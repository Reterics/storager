import {describe, it, vi, beforeEach, expect} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import FirebaseCrudManager, {
  CrudField,
} from '../components/FirebaseCrudManager';
import {DBContext} from '../../database/DBContext';
import {ShopContext} from '../../store/ShopContext';
import {DBContextType} from '../../interfaces/firebase.ts';

describe('FirebaseCrudManager', () => {
  const mockSetData = vi.fn();
  const mockRefreshData = vi.fn();
  const testEntity = 'parts';
  const mockData = [
    {
      id: '1',
      name: 'Screw',
      sku: 'SC-001',
      shop_id: ['shop123'],
      storage: [5],
      storage_limit: [10],
      price: [99],
    },
  ];

  const fields: CrudField[] = [
    {key: 'sku', label: 'SKU', type: 'text', editable: true},
    {key: 'name', label: 'Name', type: 'text', editable: true},
    {key: 'storage', label: 'Storage', type: 'number', editable: true},
    {key: 'price', label: 'Price', type: 'number', editable: true},
  ];

  const renderComponent = () => {
    render(
      <DBContext.Provider
        value={
          {
            data: {parts: mockData, currentUser: {email: 'test@user.com'}},
            setData: mockSetData,
            refreshData: mockRefreshData,
          } as unknown as DBContextType
        }
      >
        <ShopContext.Provider value={{shop: {id: 'shop123'}, setShop: vi.fn()}}>
          <FirebaseCrudManager
            entityType={testEntity}
            title='Parts'
            fields={fields}
          />
        </ShopContext.Provider>
      </DBContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders headers and data', () => {
    renderComponent();
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Screw')).toBeInTheDocument();
  });

  it('opens modal when add button is clicked', async () => {
    renderComponent();
    const addButton = screen.getByTestId('managerAddButton');
    fireEvent.click(addButton);
    expect(await screen.findByText(/Edit Parts/i)).toBeInTheDocument();
  });

  it('calls setData on inline edit', async () => {
    renderComponent();

    const nameCell = screen.getByText('Screw');
    fireEvent.click(nameCell); // activates edit mode

    const input = screen.getByDisplayValue('Screw');
    fireEvent.change(input, {target: {value: 'Updated Screw'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    await waitFor(() =>
      expect(mockSetData).toHaveBeenCalledWith(
        testEntity,
        expect.objectContaining({
          name: 'Updated Screw',
        })
      )
    );
  });
});
