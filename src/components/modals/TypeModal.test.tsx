import {render, screen, fireEvent} from '@testing-library/react';
import TypeModal from './TypeModal';
import {describe, it, expect, vi} from 'vitest';

describe('TypeModal', () => {
  const mockType = {
    id: '1',
    name: 'Test Type',
    category: 'part',
    translations: {
      hu: 'Teszt Típus',
      en: 'Test Type',
    },
  };

  const onClose = vi.fn();
  const onSave = vi.fn();
  const setType = vi.fn();
  const inPlace = false;

  it('renders without crashing when type is null', () => {
    const {container} = render(
      <TypeModal
        type={null}
        onClose={onClose}
        onSave={onSave}
        setType={setType}
        inPlace={inPlace}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly with type data', () => {
    render(
      <TypeModal
        type={mockType}
        onClose={onClose}
        onSave={onSave}
        setType={setType}
        inPlace={inPlace}
      />
    );
    expect(screen.getByLabelText('Name')).toHaveValue(mockType.name);
    expect(screen.getByLabelText('Category')).toHaveValue(mockType.category);
    expect(screen.getByLabelText('HU')).toHaveValue(mockType.translations.hu);
    expect(screen.getByLabelText('EN')).toHaveValue(mockType.translations.en);
  });

  it('calls onClose when Cancel button is clicked', () => {
    onClose.mockReset();
    render(
      <TypeModal
        type={mockType}
        onClose={onClose}
        onSave={onSave}
        setType={setType}
        inPlace={inPlace}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with updated type data when Save button is clicked', () => {
    onSave.mockReset();
    render(
      <TypeModal
        type={mockType}
        onClose={onClose}
        onSave={onSave}
        setType={setType}
        inPlace={inPlace}
      />
    );

    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith(mockType);
  });

  it('updates type name on input change', () => {
    setType.mockReset();
    const untranslatedMock = {
      ...mockType,
      translations: undefined,
      category: undefined,
    };
    render(
      <TypeModal
        type={untranslatedMock}
        onClose={onClose}
        onSave={onSave}
        setType={setType}
        inPlace={inPlace}
      />
    );

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, {target: {value: 'New Type Name'}});
    expect(setType).toHaveBeenCalledWith({
      ...untranslatedMock,
      name: 'New Type Name',
      translations: {en: 'New Type Name'},
    });

    const categoryInput = screen.getByLabelText('Category');
    fireEvent.change(categoryInput, {target: {value: 'item'}});
    expect(setType).toHaveBeenCalledWith({
      ...untranslatedMock,
      category: 'item',
    });

    const enInput = screen.getByLabelText('EN');
    fireEvent.change(enInput, {target: {value: 'item'}});
    expect(setType).toHaveBeenCalledWith({
      ...untranslatedMock,
      translations: {en: 'item'},
    });

    const huInput = screen.getByLabelText('HU');
    fireEvent.change(huInput, {target: {value: 'item'}});
    expect(setType).toHaveBeenCalledWith({
      ...untranslatedMock,
      translations: {hu: 'item'},
    });
  });
});
