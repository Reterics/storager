// RecycleBin.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
vi.mock('../components/modalExporter.ts', () => ({
  confirm: async () => {
    return Promise.resolve(true);
  },
  popup: async () => {
    return Promise.resolve();
  },
}));
import RecycleBin from './RecycleBin';
import { DBContext } from '../database/DBContext';
import { ShopContext } from '../store/ShopContext';
import { vi, expect, it, describe, beforeEach } from 'vitest';
import type {
  ContextDataValueType,
  DBContextType,
} from '../interfaces/firebase';
import { MemoryRouter } from 'react-router-dom';
import type {
  Shop,
  TableLineElementType,
  TableLineType,
} from '../interfaces/interfaces.ts';

// Mock PageHead and TableViewComponent to simplify the test
vi.mock('../components/elements/PageHead', () => ({
  PageHead: ({ title }: { title: React.ReactNode }) => <div>{title}</div>,
}));

vi.mock('../components/elements/TableViewComponent', () => ({
  __esModule: true,
  default: ({
    lines,
    header,
  }: {
    lines: TableLineType[];
    header: string[];
  }) => (
    <table>
      <thead>
        <tr>
          {header.map((h, index) => (
            <th key={index}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {lines.map((line, index) => (
          <tr key={index}>
            {line.map((cell: TableLineElementType, cellIndex: number) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  TableViewActions: ({ onRemove }: { onRemove: () => void }) => (
    <button onClick={onRemove}>Delete</button>
  ),
}));

describe('RecycleBin Component', () => {
  const mockDBContext = {
    data: {
      shops: [],
      items: [],
      parts: [],
      services: [],
      completions: [],
      settings: { id: '1' },
      users: [],
      archive: [],
      types: [],
      invoices: [],
      currentUser: {
        id: 'user1',
        role: 'admin',
      },
      deleted: [
        {
          id: 'item1',
          name: 'Item 1',
          docType: 'types',
          docUpdated: new Date().getTime(),
          shop_id: ['shop1'],
        },
        {
          id: 'item2',
          client_name: 'Client 2',
          docType: 'parts',
          docUpdated: new Date().getTime(),
          shop_id: ['shop1'],
        },
      ],
    },
    removePermanentData: vi.fn(),
  };

  const mockShopContext = {
    shop: {
      id: 'shop1',
      name: 'shop1',
    },
    setShop: () => {},
  } as {
    shop: Shop | null;
    setShop: () => void;
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <DBContext.Provider value={mockDBContext as unknown as DBContextType}>
          <ShopContext.Provider value={mockShopContext}>
            {ui}
          </ShopContext.Provider>
        </DBContext.Provider>
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PageHead and TableViewComponent when user is authorized', () => {
    renderWithProviders(<RecycleBin />);

    expect(screen.getByText('Recycle Bin')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays all items when no shop is selected', () => {
    const shopContextWithoutShop = {
      shop: null,
    } as {
      shop: Shop | null;
      setShop: () => void;
    };

    render(
      <MemoryRouter>
        <DBContext.Provider value={mockDBContext as unknown as DBContextType}>
          <ShopContext.Provider value={shopContextWithoutShop}>
            <RecycleBin />
          </ShopContext.Provider>
        </DBContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Client 2')).toBeInTheDocument();
  });

  it('calls removePermanentData and updates items when delete is confirmed', async () => {
    // Mock removePermanentData to return updated items
    const updatedDeletedItems: ContextDataValueType[] = [
      {
        id: 'item2',
        client_name: 'Client 2',
        docType: 'parts',
        docUpdated: new Date().getTime(),
        shop_id: ['shop1'],
      },
    ];
    mockDBContext.removePermanentData.mockResolvedValue(updatedDeletedItems);

    renderWithProviders(<RecycleBin />);

    // Click on Delete button
    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() =>
      expect(mockDBContext.removePermanentData).toHaveBeenCalledWith('item1'),
    );
  });

  it('does not call removePermanentData when delete is canceled', async () => {
    // Mock window.confirm to return false
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(<RecycleBin />);

    // Click on Delete button
    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      // Expect removePermanentData not to have been called
      expect(mockDBContext.removePermanentData).not.toHaveBeenCalled();

      // Item should still be present
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.queryByText('Client 2')).toBeInTheDocument();
    });
  });

  it('handles items without shop_id gracefully', () => {
    const dbContextWithItemWithoutShopId = {
      ...mockDBContext,
      data: {
        ...mockDBContext.data,
        deleted: [
          ...mockDBContext.data.deleted,
          {
            id: 'item3',
            name: 'Item 3',
            docType: 'Type3',
            docUpdated: new Date().toISOString(),
            // No shop_id
          },
        ],
      },
    };

    render(
      <MemoryRouter>
        <DBContext.Provider
          value={dbContextWithItemWithoutShopId as unknown as DBContextType}
        >
          <ShopContext.Provider value={mockShopContext}>
            <RecycleBin />
          </ShopContext.Provider>
        </DBContext.Provider>
      </MemoryRouter>,
    );

    // Item without shop_id should be displayed
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('displays the correct name for items', () => {
    renderWithProviders(<RecycleBin />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByText('Client 2')).toBeInTheDocument();
  });
});
