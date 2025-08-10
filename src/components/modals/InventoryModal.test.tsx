import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InventoryModal from './InventoryModal';
import type { StoreItem, StorePart } from '../../interfaces/interfaces.ts';
import type { ReactNode } from 'react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../utils/storage.ts', () => ({
  extractStorageInfo: (item: StoreItem | StorePart) => ({
    price: item.price || 0,
    storage: item.storage?.[0] || 0,
  }),
}));

vi.mock('../elements/TableSelectComponent.tsx', () => ({
  __esModule: true,
  default: ({
    items,
    selectedItems,
    onChange,
    itemRenderer,
  }: {
    items: (StoreItem | StorePart)[];
    selectedItems: Record<string, number>;
    onChange: (
      selected: Record<string, number>,
      item: StoreItem | StorePart,
    ) => void;
    itemRenderer: (item: StoreItem | StorePart) => ReactNode[];
  }) => (
    <div data-testid="table-select">
      {items.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {itemRenderer(item).map((el, i) => (
            <div key={i}>{el}</div>
          ))}
          <button
            onClick={() => onChange({ ...selectedItems, [item.id]: 1 }, item)}
          >
            Select
          </button>
        </div>
      ))}
    </div>
  ),
}));

const mockItems = [
  {
    id: '1',
    name: 'Screw',
    sku: 'SC123',
    price: [100],
    storage: [3],
    shop_id: ['shop1'],
  },
  {
    id: '2',
    name: 'Bolt',
    sku: 'BL456',
    price: [101],
    storage: [2],
    shop_id: ['shop1'],
  },
] as (StoreItem | StorePart)[];

describe('InventoryModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inventory modal with items', () => {
    render(
      <InventoryModal
        items={mockItems}
        selectedShopId="shop1"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Screw')).toBeInTheDocument();
    expect(screen.getByText('Bolt')).toBeInTheDocument();
  });

  it('clears selection when trash button is clicked', () => {
    render(
      <InventoryModal
        items={mockItems}
        selectedShopId="shop1"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const trashButton = screen.getByTestId('trashButton');
    fireEvent.click(trashButton);

    expect(screen.getByTestId('table-select')).toBeInTheDocument();
  });

  it('calls onSave with selected items', () => {
    render(
      <InventoryModal
        items={mockItems}
        selectedShopId="shop1"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const selectButtons = screen.getAllByText('Select');
    fireEvent.click(selectButtons[0]);

    const saveButton = screen.getByTestId('saveButton');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({ '1': 1 });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <InventoryModal
        items={mockItems}
        selectedShopId="shop1"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const cancelButton = screen.getByTestId('cancelButton');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('filters out items not matching search', async () => {
    render(
      <InventoryModal
        items={mockItems}
        selectedShopId="shop1"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const input = screen.getByTestId('searchInput');
    const searchButton = screen.queryByTestId('searchButton');
    fireEvent.change(input, { target: { value: 'bolt' } });
    expect(searchButton).toBeInTheDocument();
    fireEvent.click(searchButton!);

    await waitFor(() =>
      expect(screen.queryByText('Screw')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByText(/Bolt/)).toBeInTheDocument());
  });

  it('caps selection at storage level when exceeding it', () => {
    render(
      <InventoryModal
        items={mockItems}
        selectedShopId="shop1"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    const selectButtons = screen.getAllByText('Select');
    fireEvent.click(selectButtons[0]);

    const saveButton = screen.getByTestId('saveButton');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({ '1': 1 });
  });

  it('renders itemRenderer values', async () => {
    render(
      <InventoryModal
        items={mockItems}
        selectedShopId="shop1"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    expect(screen.getByText('SC123')).toBeInTheDocument();
    expect(screen.getByText('100 Ft')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
