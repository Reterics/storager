import {beforeAll, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, waitFor, screen} from '@testing-library/react';
import TestingPageProvider from '../../tests/mocks/TestingPageProvider.tsx';
import * as ModalExporter from '../components/modalExporter.ts';
vi.mock('../components/modalExporter.ts', () => ({
  confirm: async () => true, // Global safe mock ✅
  popup: async () => {}, // Dummy default popup (we will spy dynamically)
}));
vi.mock('../database/firebase/config.ts', () => ({
  modules: {
    transactions: true,
    storageLogs: true,
  },
  firebaseAuth: null,
}));

import Parts from './Parts.tsx';
import {
  defaultContextData,
  defaultItems,
  defaultParts,
  defaultShop,
} from '../../tests/mocks/shopData.ts';
import {ContextDataCollectionType} from '../interfaces/firebase.ts';

describe('Parts', () => {
  beforeAll(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });
  it('opens and closes the modal on add and edit actions', async () => {
    const {getAllByRole, getByText, getByTestId} = render(
      <TestingPageProvider>
        <Parts />
      </TestingPageProvider>
    );

    // Click the "Add" button to open the modal
    const addButton = getByTestId('addButton');
    fireEvent.click(addButton);

    // Expect the modal to be open
    expect(getByText('Edit Item')).toBeInTheDocument();

    // Close the modal
    const closeButton = getAllByRole('button').find(
      (b) => b.innerHTML === 'Cancel'
    );

    if (closeButton) fireEvent.click(closeButton);

    // Expect the modal to be closed

    await waitFor(() =>
      expect(screen.queryByText('Edit Item')).not.toBeInTheDocument()
    );
  });

  it('filters parts based on search input', async () => {
    const {container, getByPlaceholderText, unmount} = render(
      <TestingPageProvider>
        <Parts />
      </TestingPageProvider>
    );

    const searchInput = getByPlaceholderText('Search...') as HTMLInputElement;
    fireEvent.input(searchInput, {
      target: {
        value: 'Part2',
      },
    });
    fireEvent.keyDown(searchInput);

    await waitFor(() =>
      expect(
        container.querySelectorAll('table > tbody > tr').length
      ).toBeLessThan(defaultParts.length)
    );
    let filteredItems = container.querySelectorAll('table > tbody > tr');

    expect(filteredItems[0].children[2].innerHTML).toContain('Part2');

    fireEvent.input(searchInput, {
      target: {
        value: '',
      },
    });
    fireEvent.keyDown(searchInput);
    await waitFor(() =>
      expect(container.querySelectorAll('table > tbody > tr').length).toEqual(
        defaultParts.length
      )
    );
    filteredItems = container.querySelectorAll('table > tbody > tr');
    expect(filteredItems[0].children[2].innerHTML).toContain('Part');
    unmount();
  });

  it('displays a low storage warning alert', () => {
    const ctxDataOverride = {...defaultContextData};
    ctxDataOverride.parts[0] = {...defaultParts[0], storage: [0]}; // Low storage part
    const {getByText, unmount} = render(
      <TestingPageProvider ctxDataOverride={ctxDataOverride}>
        <Parts />
      </TestingPageProvider>
    );

    // Expect the warning to be displayed
    const warning = getByText(/low storage alert/i);
    expect(warning).toBeInTheDocument();

    unmount();
  });

  it('deletes a parts upon confirmation', async () => {
    const removeData = vi.fn(
      async (): Promise<ContextDataCollectionType | null> => [defaultParts[0]]
    );
    const setData = vi.fn(
      async (): Promise<ContextDataCollectionType | null> => [defaultParts[1]]
    );

    const multiShopPart = {
      ...defaultItems[0],
      shop_id: [defaultShop.id, 'shop2'],
      storage: [5, 10],
      storage_limit: [10, 20],
      price: [100, 200],
    };

    const ctxDataOverride = {
      ...defaultContextData,
      parts: [multiShopPart, defaultParts[1]],
      shops: [defaultShop, {id: 'shop2', name: 'Another Shop'}],
      currentUser: defaultContextData.currentUser,
    };

    const {container, unmount} = render(
      <TestingPageProvider
        removeData={removeData}
        setData={setData}
        ctxDataOverride={ctxDataOverride}
      >
        <Parts />
      </TestingPageProvider>
    );
    const trList = container.querySelectorAll('table > tbody > tr');
    expect(trList.length).toBe(defaultContextData.parts.length);

    // Simulate delete action
    let deleteButton = trList[0].querySelector('button:last-child');
    if (deleteButton) fireEvent.click(deleteButton);

    await waitFor(() => expect(setData).toHaveBeenCalled());
    await waitFor(() => expect(removeData).not.toHaveBeenCalled());

    deleteButton = container.querySelector(
      'table > tbody > tr button:last-child'
    );
    if (deleteButton) fireEvent.click(deleteButton);
    await waitFor(() => expect(removeData).toHaveBeenCalled());
    unmount();
  });

  it('renders the Parts page', () => {
    const renderResult = render(
      <TestingPageProvider>
        <Parts />
      </TestingPageProvider>
    );

    const trList =
      renderResult.container.querySelectorAll('table > tbody > tr');

    expect(trList.length).toEqual(defaultParts.length);

    defaultParts.forEach((part, index) => {
      expect(trList[index].children[1].innerHTML).toEqual(part.sku);
    });
    renderResult.unmount();
  });
  it('renders the Parts page with proper ordering', () => {
    const ctxDataOverride = {...defaultContextData};
    ctxDataOverride.parts[0] = {...defaultParts[0], storage: [1000]};
    ctxDataOverride.parts[1] = {...defaultParts[1], storage: [0]};
    const renderResult = render(
      <TestingPageProvider ctxDataOverride={ctxDataOverride}>
        <Parts />
      </TestingPageProvider>
    );

    const trList =
      renderResult.container.querySelectorAll('table > tbody > tr');

    expect(trList.length).toEqual(ctxDataOverride.parts.length);

    expect(trList[0].children[1].innerHTML).toEqual(
      ctxDataOverride.parts[1].sku
    );
    expect(trList[1].children[1].innerHTML).toEqual(
      ctxDataOverride.parts[0].sku
    );

    renderResult.unmount();
  });
  it('saves a labor fee transaction when a valid fee is entered', async () => {
    const setData = vi.fn(async () => []);
    render(
      <TestingPageProvider setData={setData}>
        <Parts />
      </TestingPageProvider>
    );

    const laborFeeInput = screen.getByTestId('laborFee') as HTMLInputElement;
    const laborFeeButton = screen.getByTestId('laborFeeButton');

    fireEvent.change(laborFeeInput, {target: {value: '1270'}});
    fireEvent.click(laborFeeButton);

    await waitFor(() =>
      expect(setData).toHaveBeenCalledWith('transactions', expect.any(Object))
    );
  });
  it('opens and closes inventory modal', async () => {
    const {getByTestId, queryByTestId} = render(
      <TestingPageProvider>
        <Parts />
      </TestingPageProvider>
    );

    const inventoryButton = getByTestId('inventoryButton');
    fireEvent.click(inventoryButton);

    await waitFor(() => {
      expect(screen.getByTestId('InventoryModal')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Cancel');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(queryByTestId('InventoryModal')).not.toBeInTheDocument();
    });
  });
  it('edits a part directly from table edit', async () => {
    const setData = vi.fn();
    const {container} = render(
      <TestingPageProvider setData={setData}>
        <Parts />
      </TestingPageProvider>
    );

    const editableCells = container.querySelectorAll('td > div');
    if (editableCells.length > 0) {
      fireEvent.click(editableCells[0]);

      const input = await waitFor(() => container.querySelector('td input'));

      fireEvent.change(input!, {target: {value: 'Changed'}});
      fireEvent.keyDown(input!, {key: 'Enter', code: 'Enter'});
    }

    await waitFor(() => expect(setData).toHaveBeenCalled());
  });
  it('handles inventoryData cancels correctly', async () => {
    const setData = vi.fn();
    const {queryByTestId, container, getByTestId} = render(
      <TestingPageProvider setData={setData}>
        <Parts />
      </TestingPageProvider>
    );

    const inventoryButton = getByTestId('inventoryButton');
    fireEvent.click(inventoryButton);

    await waitFor(() => expect(getByTestId('InventoryModal')).toBeInTheDocument());

    const addButtons = container.querySelectorAll('.add-icon');
    fireEvent.click(addButtons[0]);

    const saveButton = getByTestId('saveButton');
    fireEvent.click(saveButton);

    await waitFor(() => expect(queryByTestId('Inventory')).toBe(null));
    await waitFor(() => expect(setData).toHaveBeenCalled());
  });

  it('shows validation popup for invalid labor fee', async () => {
    const popupSpy = vi.spyOn(ModalExporter, 'popup').mockResolvedValue(false);

    const {getByTestId} = render(
      <TestingPageProvider>
        <Parts />
      </TestingPageProvider>
    );

    const laborFeeInput = getByTestId('laborFee');
    const laborFeeButton = getByTestId('laborFeeButton');

    fireEvent.change(laborFeeInput, {target: {value: ''}});
    fireEvent.click(laborFeeButton);

    await waitFor(() => {
      expect(popupSpy).toHaveBeenCalled();
    });
  });

  it('closes part modal after saving a part', async () => {
    const setData = vi.fn(async () => []);
    const refreshImagePointers = vi.fn();

    const {getByTestId, getByText, queryByText} = render(
      <TestingPageProvider
        setData={setData}
        refreshImagePointers={refreshImagePointers}
      >
        <Parts />
      </TestingPageProvider>
    );

    const addButton = getByTestId('addButton');
    fireEvent.click(addButton);

    await waitFor(() => expect(getByText('Edit Item')).toBeInTheDocument());

    // Simulate Save action inside PartModal
    const saveButton = getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(setData).toHaveBeenCalled();
      expect(refreshImagePointers).toHaveBeenCalled();
      expect(queryByText('Edit Item')).not.toBeInTheDocument();
    });
  });
});
