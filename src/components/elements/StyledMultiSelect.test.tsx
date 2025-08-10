import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import StyledMultiSelect from './StyledMultiSelect';
import type { StyledSelectOption } from '../../interfaces/interfaces.ts';

describe('StyledMultiSelect', () => {
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
      <StyledMultiSelect
        value={[]}
        onSelect={onSelectMock}
        name="test-select"
        label="Test Label"
        options={options}
      />,
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders all options as checkboxes', () => {
    render(
      <StyledMultiSelect
        value={[]}
        onSelect={onSelectMock}
        name="test-select"
        options={options}
      />,
    );

    options.forEach((option) => {
      expect(screen.getByLabelText(option.name)).toBeInTheDocument();
      expect(screen.getByLabelText(option.name)).toHaveAttribute(
        'type',
        'checkbox',
      );
    });
  });

  it('checks the checkbox if value is in the selected values', () => {
    render(
      <StyledMultiSelect
        value={['option1']}
        onSelect={onSelectMock}
        name="test-select"
        options={options}
      />,
    );

    const option1Checkbox = screen.getByLabelText('Option 1');
    expect(option1Checkbox).toBeChecked();
  });

  it('calls onSelect with updated values when a checkbox is selected', () => {
    render(
      <StyledMultiSelect
        value={[]}
        onSelect={onSelectMock}
        name="test-select"
        options={options}
      />,
    );

    const option1Checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(option1Checkbox);

    expect(onSelectMock).toHaveBeenCalledWith(['option1']);
  });

  it('calls onSelect with updated values when a checkbox is deselected', () => {
    render(
      <StyledMultiSelect
        value={['option1']}
        onSelect={onSelectMock}
        name="test-select"
        options={options}
      />,
    );

    const option1Checkbox = screen.getByLabelText('Option 1');
    fireEvent.click(option1Checkbox);

    expect(onSelectMock).toHaveBeenCalledWith([]);
  });

  it('correctly handles multiple selections', () => {
    render(
      <StyledMultiSelect
        value={['option1']}
        onSelect={onSelectMock}
        name="test-select"
        options={options}
      />,
    );

    const option2Checkbox = screen.getByLabelText('Option 2');
    fireEvent.click(option2Checkbox);

    expect(onSelectMock).toHaveBeenCalledWith(['option1', 'option2']);
  });
});
