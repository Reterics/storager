import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import ImportShopData from './ImportShopData';
import {DBContext} from '../../database/DBContext';
import {
  GeneralButtons,
  ImportShopDataArguments,
  TableViewArguments,
} from '../../interfaces/interfaces.ts';
import {DBContextType} from '../../interfaces/firebase.ts';

// Mock PageHead component
vi.mock('../elements/PageHead.tsx', () => ({
  PageHead: ({
    buttons,
    onSearch,
  }: {
    buttons: GeneralButtons[];
    onSearch?: (value: string) => void;
  }) => (
    <div data-testid='PageHead'>
      {buttons.map((button, index) => (
        <button key={index} onClick={button.onClick} type='button'>
          {button.value}
        </button>
      ))}
      <input
        type='text'
        placeholder='Search'
        onChange={(e) =>
          typeof onSearch === 'function' ? onSearch(e.target.value) : null
        }
      />
    </div>
  ),
}));

// Mock TableViewComponent
vi.mock('../elements/TableViewComponent.tsx', () => ({
  default: ({lines, header, selectedIndexes, onClick}: TableViewArguments) => (
    <table data-testid='TableViewComponent'>
      <thead>
        <tr>
          {header?.map((head, index) => (
            <th key={index}>{typeof head === 'string' ? head : head.value}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {lines.map((line, index) => (
          <tr
            key={index}
            data-selected={!!selectedIndexes?.[index]}
            onClick={() =>
              typeof onClick === 'function' ? onClick(index) : null
            }
          >
            {line.map((cell, idx) => (
              <td key={idx}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

describe('ImportShopData Component', () => {
  const onCloseMock = vi.fn();

  const mockDBContext = {
    data: {
      items: [
        {
          sku: 'sku1',
          name: 'Item 1',
          storage_limit: [10],
          price: [100],
          shop_id: [],
        },
        {
          sku: 'sku2',
          name: 'Item 2',
          storage_limit: [5],
          price: [200],
          shop_id: [],
        },
      ],
      parts: [
        {
          sku: 'sku3',
          name: 'Part 1',
          storage_limit: [2],
          price: [50],
          shop_id: [],
        },
      ],
    },
    uploadDataBatch: vi.fn().mockImplementation(async () => {}),
  };

  const renderComponent = (props: ImportShopDataArguments) => {
    return render(
      <DBContext.Provider value={mockDBContext as unknown as DBContextType}>
        <ImportShopData {...props} />
      </DBContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when shop is not provided', () => {
    const {container} = renderComponent({onClose: onCloseMock});
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when shop is provided', () => {
    renderComponent({shop: {id: 'shop1'}, onClose: onCloseMock});
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('PageHead')).toBeInTheDocument();
    expect(screen.getByTestId('TableViewComponent')).toBeInTheDocument();
  });

  it('toggles isItemSelected when "Items" button is clicked', async () => {
    renderComponent({shop: {id: 'shop1'}, onClose: onCloseMock});

    expect(screen.queryAllByRole('row')).toHaveLength(1); // Only header row

    fireEvent.click(screen.getByText('Items'));

    await waitFor(() => {
      expect(screen.queryAllByRole('row')).toHaveLength(3); // Header + 2 items
    });

    fireEvent.click(screen.getByText('Items'));

    await waitFor(() => {
      expect(screen.queryAllByRole('row')).toHaveLength(1); // Only header row
    });
  });

  it('toggles isPartSelected when "Parts" button is clicked', async () => {
    renderComponent({shop: {id: 'shop1'}, onClose: onCloseMock});

    fireEvent.click(screen.getByText('Parts'));

    await waitFor(() => {
      expect(screen.queryAllByRole('row')).toHaveLength(2); // Header + 1 part
    });
  });

  it('filters data based on search input', async () => {
    renderComponent({shop: {id: 'shop1'}, onClose: onCloseMock});

    fireEvent.click(screen.getByText('Items'));
    fireEvent.click(screen.getByText('Parts'));

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: {value: 'Item 1'},
    });

    await waitFor(() => {
      expect(screen.queryAllByRole('row')).toHaveLength(2); // Header + 1 matching item
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });

  it('selects and deselects all items when "Select All"/"Deselect All" is clicked', async () => {
    renderComponent({shop: {id: 'shop1'}, onClose: onCloseMock});

    fireEvent.click(screen.getByText('Items'));

    fireEvent.click(screen.getByText('Select All'));

    const rows = screen.queryAllByRole('row');
    rows.slice(1).forEach((row) => {
      expect(row).toHaveAttribute('data-selected', 'true');
    });

    expect(screen.getByText('Deselect All')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Deselect All'));

    rows.slice(1).forEach((row) => {
      expect(row).toHaveAttribute('data-selected', 'false');
    });
  });

  it('calls onClose when "Cancel" button is clicked', () => {
    onCloseMock.mockClear();
    renderComponent({shop: {id: 'shop1'}, onClose: onCloseMock});

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls import function when "Import" button is clicked', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockReturnValue();

    renderComponent({shop: {id: 'shop1'}, onClose: onCloseMock});

    fireEvent.click(screen.getByText('Items'));
    fireEvent.click(screen.getByText('Parts'));

    await waitFor(() => {
      expect(screen.queryAllByRole('row')).toHaveLength(4); // Header + 2 items
    });

    fireEvent.click(screen.queryAllByRole('row')[1]);
    fireEvent.click(screen.queryAllByRole('row')[3]);

    fireEvent.click(screen.getByText('Import'));

    await waitFor(() =>
      expect(mockDBContext.uploadDataBatch).toHaveBeenCalledTimes(2)
    );
  });
});
