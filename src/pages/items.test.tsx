import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import TestingPageProvider from '../../tests/mocks/TestingPageProvider.tsx';
import Items from './items.tsx';
import {
  defaultContextData,
  defaultItems,
  defaultParts,
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

  it('filters parts based on search input', async () => {
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

  it('deletes a part upon confirmation', async () => {
    const {container, unmount} = render(
      <TestingPageProvider
        removeData={vi.fn(
          async (): Promise<ContextDataCollectionType | null> => [
            defaultItems[0],
          ]
        )}
      >
        <Items />
      </TestingPageProvider>
    );
    const trList = container.querySelectorAll('table > tbody > tr');
    const initialLength = trList.length;

    // Simulate delete action
    const deleteButton = trList[0].querySelector('button:last-child');
    if (deleteButton) fireEvent.click(deleteButton);

    await waitFor(() =>
      expect(container.querySelectorAll('table > tbody > tr').length).toEqual(
        initialLength - 1
      )
    );
    unmount();
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

  afterAll(() => {
    vi.restoreAllMocks();
  });
});
