import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import TestingPageProvider from '../../tests/mocks/TestingPageProvider.tsx';
import Items from './items.tsx';
import {
  defaultContextData,
  defaultItems,
  defaultParts, defaultShop,
} from '../../tests/mocks/shopData.ts';
import AuthContextProviderMock from '../../tests/mocks/AuthContextProviderMock.tsx';
import {ContextDataCollectionType} from '../interfaces/firebase.ts';

describe('Items', () => {
  beforeAll(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });
  it('opens and closes the modal on add and edit actions', async () => {
    const {getAllByRole, getByText, getByTestId} = render(
      <TestingPageProvider>
        <Items />
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

  it('filters items based on search input', async () => {
    const {container, getByPlaceholderText, unmount} = render(
      <TestingPageProvider>
        <Items />
      </TestingPageProvider>
    );

    const searchInput = getByPlaceholderText('Search...') as HTMLInputElement;
    fireEvent.input(searchInput, {
      target: {
        value: 'Item 2',
      },
    });
    fireEvent.keyDown(searchInput);

    await waitFor(() =>
      expect(
        container.querySelectorAll('table > tbody > tr').length
      ).toBeLessThan(defaultItems.length)
    );
    let filteredItems = container.querySelectorAll('table > tbody > tr');

    expect(filteredItems[0].children[2].innerHTML).toContain('Item 2');

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
    expect(filteredItems[0].children[2].innerHTML).toContain('Item 1');
    unmount();
  });

  it('displays a low storage warning alert', () => {
    const ctxDataOverride = {...defaultContextData};
    ctxDataOverride.items[0] = {...defaultItems[0], storage: [0]}; // Low storage part
    const {getByText, unmount} = render(
      <TestingPageProvider ctxDataOverride={ctxDataOverride}>
        <Items />
      </TestingPageProvider>
    );

    // Expect the warning to be displayed
    const warning = getByText(/low storage alert/i);
    expect(warning).toBeInTheDocument();

    unmount();
  });

  it('deletes items after confirmation', async () => {
    const removeData = vi.fn(
      async (): Promise<ContextDataCollectionType | null> => [defaultItems[0]],
    );
    const setData = vi.fn(
      async () => {
        return [defaultItems[1]];
      },
    );

    const multiShopItem = {
      ...defaultItems[0],
      shop_id: [defaultShop.id, 'shop2'],
      storage: [5, 10],
      storage_limit: [10, 20],
      price: [100, 200],
    };

    const ctxDataOverride = {
      ...defaultContextData,
      items: [multiShopItem, defaultItems[1]],
      shops: [defaultShop, { id: 'shop2', name: 'Another Shop' }],
      currentUser: defaultContextData.currentUser,
    };

    const { container } = render(
      <TestingPageProvider removeData={removeData} setData={setData} ctxDataOverride={ctxDataOverride}>
        <Items />
      </TestingPageProvider>
    );

    const trList = container.querySelectorAll('table > tbody > tr');
    const initialLength = trList.length;

    // Simulate delete action
    let deleteButton = trList[0].querySelector('button:last-child');
    if (deleteButton) fireEvent.click(deleteButton);

    await waitFor(() => expect(setData).toHaveBeenCalled());
    await waitFor(() => expect(removeData).not.toHaveBeenCalled());
    await waitFor(() => expect(container.querySelectorAll('table > tbody > tr').length).toEqual(initialLength - 1));

    deleteButton = container.querySelector('table > tbody > tr button:last-child');
    if (deleteButton) fireEvent.click(deleteButton);
    await waitFor(() => expect(removeData).toHaveBeenCalled());
  });

  it('deletes an single-shop item after confirmation', async () => {
    const removeData = vi.fn(
      async (): Promise<ContextDataCollectionType | null> => [defaultItems[0]]
    );

    const { container } = render(
      <TestingPageProvider removeData={removeData}>
        <Items />
      </TestingPageProvider>
    );

    const trList = container.querySelectorAll('table > tbody > tr');
    const initialLength = trList.length;

    // Simulate delete action
    const deleteButton = trList[0].querySelector('button:last-child');
    if (deleteButton) fireEvent.click(deleteButton);

    await waitFor(() => expect(removeData).toHaveBeenCalled());
    await waitFor(() => expect(container.querySelectorAll('table > tbody > tr').length).toEqual(initialLength - 1));
  });

  it.concurrent('Should not render if no user active', () => {
    const renderResult = render(
      <TestingPageProvider
        ctxDataOverride={{...defaultContextData, currentUser: undefined}}
      >
        <Items />
      </TestingPageProvider>
    );

    expect(renderResult.container.querySelector('#ItemModal')).toBeNull();
    renderResult.unmount();
  });
  it.concurrent('renders the Items page', () => {
    const renderResult = render(
      <TestingPageProvider>
        <Items />
      </TestingPageProvider>
    );

    const trList =
      renderResult.container.querySelectorAll('table > tbody > tr');

    expect(trList.length).toEqual(defaultItems.length);

    defaultItems.forEach((item, index) => {
      expect(trList[index].children[1].innerHTML).toEqual(item.sku);
    });

    const buttons = renderResult.queryAllByRole('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(renderResult.container.querySelector('#ItemModal')).toBeDefined();
    renderResult.unmount();
  });

  it('renders the items page without data', () => {
    const renderResult = render(
      <AuthContextProviderMock>
        <Items />
      </AuthContextProviderMock>
    );
    expect(renderResult.container.querySelector('#ItemModal')).toBeDefined();
  });

  it('edits an item directly from table edit', async () => {
    const setData = vi.fn();
    const { container } = render(
      <TestingPageProvider setData={setData}>
        <Items />
      </TestingPageProvider>
    );

    const editableCells = container.querySelectorAll('td > div');
    if (editableCells.length > 0) {
      fireEvent.click(editableCells[0]);

      const input = await waitFor(() => container.querySelector('td input'));
      fireEvent.change(input!, { target: { value: 'ChangedName' } });
      fireEvent.keyDown(input!, { key: 'Enter', code: 'Enter' });
    }

    await waitFor(() => expect(setData).toHaveBeenCalled());
  });

  it('saves a new item via ItemModal', async () => {
    const setData = vi.fn(async () => []);
    const refreshImagePointers = vi.fn();
    const { getByTestId, getByText, queryByText } = render(
      <TestingPageProvider setData={setData} refreshImagePointers={refreshImagePointers}>
        <Items />
      </TestingPageProvider>
    );

    const addButton = getByTestId('addButton');
    fireEvent.click(addButton);

    await waitFor(() => expect(getByText('Edit Item')).toBeInTheDocument());

    const saveButton = getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(setData).toHaveBeenCalled();
      expect(refreshImagePointers).toHaveBeenCalled();
      expect(queryByText('Edit Item')).not.toBeInTheDocument();
    });
  });


  afterAll(() => {
    vi.restoreAllMocks();
  });
});
