import {render, screen, fireEvent} from '@testing-library/react';
import TableViewComponent, {TableViewActions} from './TableViewComponent';
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

  it('calls correct functions when action buttons clicked', () => {
    const onCreate = vi.fn();
    const onOpen = vi.fn();
    const onSave = vi.fn();
    const onCode = vi.fn();
    const onPaste = vi.fn();
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    const onPrint = vi.fn();

    render(
      <TableViewActions
        onCreate={onCreate}
        onOpen={onOpen}
        onSave={onSave}
        onCode={onCode}
        onPaste={onPaste}
        onEdit={onEdit}
        onRemove={onRemove}
        onPrint={onPrint}
      />
    );

    fireEvent.click(screen.getByTestId('button-table-create'));
    fireEvent.click(screen.getByTestId('button-table-open'));
    fireEvent.click(screen.getByTestId('button-table-save'));
    fireEvent.click(screen.getByTestId('button-table-code'));
    fireEvent.click(screen.getByTestId('button-table-paste'));
    fireEvent.click(screen.getByTestId('button-table-edit'));
    fireEvent.click(screen.getByTestId('button-table-remove'));
    fireEvent.click(screen.getByTestId('button-table-print'));

    expect(onCreate).toHaveBeenCalled();
    expect(onOpen).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
    expect(onCode).toHaveBeenCalled();
    expect(onPaste).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalled();
    expect(onPrint).toHaveBeenCalled();
  });
  it('edits a "steps" cell correctly', async () => {
    const mockOnChange = vi.fn();
    render(
      <TableViewComponent
        header={[
          {value: 'ID', editable: false, type: 'text'},
          {value: 'Name', editable: false, type: 'text'},
          {value: 'Quantity', editable: true, type: 'steps'},
        ]}
        lines={[[1, 'Item 1', 5]]}
        onEdit={mockOnChange}
      />
    );

    const cell = screen.getByText('5');
    fireEvent.click(cell); // 1. Click to activate

    const input = await screen.findByDisplayValue(5);

    fireEvent.change(input, {target: {value: '4'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(mockOnChange).toHaveBeenCalledWith([1, 'Item 1', 5], 2, '4');
  });

  it('edits a "number" cell correctly', async () => {
    const mockOnChange = vi.fn();
    render(
      <TableViewComponent
        header={[{value: 'Quantity', editable: true, type: 'number'}]}
        lines={[[5]]}
        onEdit={mockOnChange}
      />
    );

    const cell = screen.getByText('5');
    fireEvent.click(cell);

    const input = await screen.findByDisplayValue('5');
    fireEvent.change(input, {target: {value: '10'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('edits a "text" cell correctly', async () => {
    const mockOnChange = vi.fn();
    render(
      <TableViewComponent
        header={[{value: 'Name', editable: true, type: 'text'}]}
        lines={[['Item 1']]}
        onEdit={mockOnChange}
      />
    );

    const cell = screen.getByText('Item 1');
    fireEvent.click(cell); // 1. click to activate edit mode

    // 2. wait until input appears
    const input = await screen.findByDisplayValue('Item 1');

    fireEvent.change(input, {target: {value: 'Updated Name'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('edits a "select" cell correctly', async () => {
    const mockOnChange = vi.fn();
    render(
      <TableViewComponent
        header={[
          {value: 'ID', editable: false, type: 'text'},
          {value: 'Name', editable: false, type: 'text'},
          {
            value: 'Type',
            editable: true,
            type: 'select',
            options: [
              {name: 'Option1', value: 'option1'},
              {name: 'Option2', value: 'option2'},
            ],
          },
        ]}
        lines={[[1, 'Item 1', 'option1']]}
        onEdit={mockOnChange}
      />
    );

    const cell = screen.getByText('option1');
    fireEvent.click(cell);

    const select = await screen.findByRole('combobox');
    fireEvent.change(select, {target: {value: 'option2'}});

    const closeButton = screen.getByTestId('inline-close-button');
    fireEvent.click(closeButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      [1, 'Item 1', 'option1'],
      2,
      'option2'
    );
  });
  it('sorts rows correctly when clicking headers', async () => {
    const {container} = render(
      <TableViewComponent
        header={mockHeader}
        lines={[
          [3, 'C', 5],
          [1, 'A', 10],
          [2, 'B', 8],
        ]}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader); // ASC
    fireEvent.click(nameHeader); // DSC

    // Should sort by name descending (C -> B -> A)
    const rows = container.querySelectorAll('tbody tr');
    const firstRowCells = rows[0].querySelectorAll('td');

    expect(firstRowCells[1].textContent).toContain('C');
  });
  it('renders without sorting when no orderBy', () => {
    render(
      <TableViewComponent
        header={mockHeader}
        lines={[
          [1, 'B', 20],
          [2, 'A', 10],
        ]}
      />
    );

    // Should render in original order
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('B');
    expect(rows[2]).toHaveTextContent('A');
  });
  it('skips sorting if sorting key is undefined', async () => {
    render(
      <TableViewComponent
        header={mockHeader}
        lines={[
          [1, 'B'],
          [2, undefined],
        ]}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader); // Set orderBy

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('B');
  });
  it('skips sorting if value is null', async () => {
    render(
      <TableViewComponent
        header={mockHeader}
        lines={[
          [1, null],
          [2, 'A'],
        ]}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('1');
    expect(rows[2]).toHaveTextContent('2');
  });
  it('skips sorting if value type is not string or number', async () => {
    render(
      <TableViewComponent
        header={mockHeader}
        lines={[
          [1, true],
          [2, 'A'],
        ]}
      />
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader); // Set orderBy

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toBeDefined();
  });
  it('sorts ascending then descending by clicking header', async () => {
    render(
      <TableViewComponent
        header={mockHeader}
        lines={[
          [1, 'B', 5],
          [2, 'A', 10],
        ]}
      />
    );

    const nameHeader = screen
      .getByText('Name')
      .querySelector('.sort') as Element;
    expect(nameHeader).toBeInTheDocument();
    fireEvent.click(nameHeader); // ASC

    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('2A 10');

    fireEvent.click(nameHeader); // DSC
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('1B 5');
  });
});
