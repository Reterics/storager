import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StyledSelect from './StyledSelect';
import type { StyledSelectOption } from '../../interfaces/interfaces';
import { textToOptions } from '../../utils/ui.ts';

describe('StyledSelect', () => {
  const options: StyledSelectOption[] = [
    { value: 'option1', name: 'Option 1' },
    { value: 'option2', name: 'Option 2' },
    { value: 'option3', name: 'Option 3' },
  ];
  const onSelectMock = vi.fn();

  beforeEach(() => {
    onSelectMock.mockClear();
  });

  it('renders the label if provided', () => {
    render(
      <StyledSelect
        value=""
        onSelect={onSelectMock}
        name="test-select"
        label="Test Label"
        options={options}
      />,
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it("renders 'Please Select' as the first option", () => {
    render(
      <StyledSelect
        value=""
        onSelect={onSelectMock}
        name="test-select"
        options={options}
      />,
    );

    expect(screen.getByText('Please Select')).toBeInTheDocument();
  });

  it('renders all options correctly', () => {
    render(
      <StyledSelect
        value=""
        onSelect={onSelectMock}
        name="test-select"
        options={options}
      />,
    );

    options.forEach((option) => {
      expect(screen.getByText(option.name)).toBeInTheDocument();
    });
  });

  it('calls onSelect when a new option is selected', () => {
    render(
      <StyledSelect
        value=""
        onSelect={onSelectMock}
        name="test-select"
        options={options}
      />,
    );

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'option1' } });
    expect(onSelectMock).toHaveBeenCalled();
  });

  it('sets the correct option as selected based on the value prop', () => {
    render(
      <StyledSelect
        label={false}
        value="option2"
        onSelect={onSelectMock}
        name="test-select"
        options={options}
      />,
    );

    const optionElement = screen.getByRole('option', {
      name: 'Option 2',
    }) as HTMLOptionElement;
    expect((optionElement.parentElement as HTMLSelectElement).value).toEqual(
      'option2',
    );
  });
});

describe('textToOptions function', () => {
  it('creates options with provided names', () => {
    const values = ['value1', 'value2'];
    const names = ['Name 1', 'Name 2'];
    const options = textToOptions(values, names);

    expect(options).toEqual([
      { value: 'value1', name: 'Name 1' },
      { value: 'value2', name: 'Name 2' },
    ]);
  });

  it('creates options with names equal to values if names are not provided', () => {
    const values = ['value1', 'value2'];
    const options = textToOptions(values, undefined);

    expect(options).toEqual([
      { value: 'value1', name: 'value1' },
      { value: 'value2', name: 'value2' },
    ]);
  });
});
