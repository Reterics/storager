import {render, screen, fireEvent} from '@testing-library/react';
import TableViewComponent from './TableViewComponent';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TableHead, TableLineType} from '../../interfaces/interfaces.ts';

const mockHeader = [
  {value: 'ID', sortable: true, editable: false},
  {value: 'Name', sortable: true, editable: true, type: 'text'},
  {value: 'Quantity', sortable: true, editable: true, type: 'number'},
] as (string | TableHead)[];

const mockLines = [
  [1, 'Item 1', 10],
  [2, 'Item 2', 5],
  [3, 'Item 3', 8],
];

describe('TableViewComponent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders table headers and rows', () => {
    render(
      <TableViewComponent
        header={mockHeader as (string | TableHead)[]}
        lines={mockLines}
      />
    );

    // Check header rendering
    mockHeader.forEach((header) => {
      if (
        header &&
        typeof header !== 'string' &&
        typeof header.value === 'string'
      ) {
        expect(screen.getByText(header.value)).toBeInTheDocument();
      }
    });

    // Check rows rendering
    mockLines.forEach((line) => {
      line.forEach((cell) => {
        expect(screen.getByText(cell.toString())).toBeInTheDocument();
      });
    });
  });

  it('toggles edit mode and saves changes on editable cells', () => {
    const mockOnChange = vi.fn();
    render(
      <TableViewComponent
        header={mockHeader as (string | TableHead)[]}
        lines={mockLines}
        onEdit={mockOnChange}
      />
    );

    const cell = screen.getByText('Item 1');
    fireEvent.click(cell); // Enter edit mode
    const input = screen.getByDisplayValue('Item 1');

    fireEvent.change(input, {target: {value: 'New Item'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(mockOnChange).toHaveBeenCalledWith([1, 'Item 1', 10], 1, 'New Item'); // Check onChange callback with row and column index
  });

  it('highlights selected row', () => {
    render(
      <TableViewComponent
        header={mockHeader}
        lines={mockLines}
        selectedIndexes={{1: true}}
      />
    );

    const selectedRow = screen.getAllByRole('row')[2];
    expect(selectedRow).toHaveClass('bg-gray-300');
  });

  it('highlights rows conditionally', () => {
    const isHighlighted = (line: TableLineType) =>
      line && typeof line[2] === 'number' && line[2] > 6; // Highlight if quantity > 6
    render(
      <TableViewComponent
        header={mockHeader}
        lines={mockLines}
        isHighlighted={isHighlighted}
      />
    );

    const highlightedRows = screen
      .getAllByRole('row')
      .filter((row) => row.classList.contains('bg-yellow-50'));
    expect(highlightedRows.length).toBe(2); // Should highlight two rows
  });
});
