import {beforeAll, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, waitFor, screen} from '@testing-library/react';
import TestingPageProvider from '../../tests/mocks/TestingPageProvider.tsx';
vi.mock('../components/modalExporter.ts', () => ({
  confirm: async () => {
    return Promise.resolve(true);
  },
  popup: async () => {
    return Promise.resolve();
  },
}));

import Parts from './Parts.tsx';
import {defaultContextData, defaultParts} from '../../tests/mocks/shopData.ts';
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

  it('deletes a part upon confirmation', async () => {
    const removeData = vi.fn(
      async (): Promise<ContextDataCollectionType | null> => [defaultParts[0]]
    );
    const {container, unmount} = render(
      <TestingPageProvider removeData={removeData}>
        <Parts />
      </TestingPageProvider>
    );
    const trList = container.querySelectorAll('table > tbody > tr');
    expect(trList.length).toBe(defaultContextData.parts.length);

    // Simulate delete action
    const deleteButton = trList[0].querySelector('button:last-child');
    if (deleteButton) fireEvent.click(deleteButton);

    await waitFor(() => expect(removeData.mock.calls.length).toBe(1));
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
});
