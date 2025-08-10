import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TableSelectComponent from './TableSelectComponent';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

type TestItem = { id: string; name: string };

const mockItems: TestItem[] = [
  { id: '1', name: 'Item One' },
  { id: '2', name: 'Item Two' },
];

const renderComponent = (
  selectedItems: Record<string, number> = {},
  maxCount = 99,
) => {
  const onChange = vi.fn();
  render(
    <TableSelectComponent
      items={mockItems}
      selectedItems={selectedItems}
      onChange={onChange}
      headers={['Name']}
      getId={(item) => item.id}
      itemRenderer={(item) => [<span key={item.id}>{item.name}</span>]}
      maxCount={maxCount}
    />,
  );
  return { onChange };
};

describe('TableSelectComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders headers and items', () => {
    renderComponent();

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
  });

  it('shows count and triggers onChange when incremented', () => {
    const { onChange } = renderComponent({ '1': 1 });

    const addButton = screen.getAllByRole('button', { name: '' }).find(
      (_btn, i) => i % 2 === 1, // Plus button (green)
    );
    if (addButton) fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith(
      { '1': 2 },
      expect.objectContaining({ id: '1' }),
    );
  });

  it('decreases count and removes item when count hits 0', () => {
    const { onChange } = renderComponent({ '1': 1 });

    const removeButton = screen.getAllByRole('button', { name: '' }).find(
      (_btn, i) => i % 2 === 0, // Minus button (red)
    );
    if (removeButton) fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ id: '1' }),
    );
  });

  it('respects maxCount and does not exceed it', () => {
    const { onChange } = renderComponent({ '1': 5 }, 5);

    const addButton = screen
      .getAllByRole('button', { name: '' })
      .find((_btn, i) => i % 2 === 1);
    if (addButton) fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith(
      { '1': 5 },
      expect.objectContaining({ id: '1' }),
    );
  });

  it('disables remove button when count is 0', () => {
    renderComponent({ '1': 0 });

    const removeButton = screen
      .getAllByRole('button', { name: '' })
      .find((_btn, i) => i % 2 === 0);
    expect(removeButton).toBeDisabled();
  });

  it('renders no data fallback when items is empty', () => {
    render(
      <TableSelectComponent
        items={[] as { id: string; name: string }[]}
        selectedItems={{}}
        onChange={() => {}}
        headers={['Name']}
        getId={(item) => item.id}
        itemRenderer={(item) => [<span key={item.id}>{item.name}</span>]}
      />,
    );

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });
});
