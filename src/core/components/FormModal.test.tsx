import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormModal from './FormModal';
import type { CrudField } from './FirebaseCrudManager';
import { DBContext } from '../../database/DBContext';
import { ShopContext } from '../../store/ShopContext';
import type { DBContextType } from '../../interfaces/firebase';
import type {
  GeneralModalArguments,
  GeneralModalButtons,
  MediaModalArguments,
  StyledInputArgs,
  StyledSelectArgs,
  StyledSelectOption,
} from '../../interfaces/interfaces.ts';
import type { SyntheticEvent } from 'react';

// Mocks for child UI components to simplify rendering and emit props back
vi.mock('../../components/modals/GeneralModal.tsx', () => {
  // Use a minimal subset of props needed for tests
  const GeneralModalMock = ({
    title,
    children,
    buttons,
  }: GeneralModalArguments) => (
    <div>
      <h2>{title}</h2>
      <div data-testid="modal-body">{children}</div>
      <div>
        {(buttons || []).map((b: GeneralModalButtons, i: number) => (
          <button
            key={i}
            onClick={() => b.onClick?.()}
            data-testid={`btn-${b.value}`}
          >
            {b.value}
          </button>
        ))}
      </div>
    </div>
  );
  return { default: GeneralModalMock };
});

vi.mock('../../components/elements/StyledInput.tsx', () => {
  const StyledInputMock = ({
    label,
    value,
    onChange,
    type,
  }: StyledInputArgs) => (
    <label>
      {label}
      <input
        aria-label={String(label)}
        data-testid={`input-${label}`}
        value={value as string}
        type={type}
        onChange={(e) =>
          onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>)
        }
      />
    </label>
  );
  return { default: StyledInputMock };
});

vi.mock('../../components/elements/StyledSelect.tsx', () => {
  const StyledSelectMock = ({
    label,
    value,
    onSelect,
    options = [],
    name,
  }: StyledSelectArgs) => (
    <label>
      {label as React.ReactNode}
      <select
        aria-label={String(label)}
        data-testid={`select-${name}`}
        value={value as string}
        onChange={(e) =>
          onSelect?.(e as unknown as React.ChangeEvent<HTMLSelectElement>)
        }
      >
        {options.map((o: StyledSelectOption) => (
          <option key={o.value} value={o.value}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
  return { default: StyledSelectMock };
});

vi.mock('../../components/elements/StyledMultiSelect.tsx', () => ({
  default: ({
    label,
    value = [],
    onSelect,
    options = [],
    name,
  }: StyledSelectArgs) => (
    <div>
      <span>{label}</span>
      <button
        type="button"
        data-testid={`multiselect-${name}`}
        onClick={() =>
          onSelect?.(
            options.map(
              (o: { value: unknown }) => o.value,
            ) as unknown as SyntheticEvent<HTMLSelectElement, Event>,
          )
        }
      >
        SelectAll
      </button>
      <div data-testid={`multiselect-value-${name}`}>
        {JSON.stringify(value)}
      </div>
    </div>
  ),
}));

// Media modal and browse button
vi.mock('../../components/modals/MediaModal.tsx', () => ({
  default: ({ setFile, onClose }: MediaModalArguments) => (
    <div>
      <button data-testid="media-set" onClick={() => setFile('img.png')}>
        SetImage
      </button>
      <button data-testid="media-close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
  MediaBrowse: ({
    image,
    onClick,
  }: {
    onClick: () => void;
    image?: string;
  }) => (
    <button data-testid="media-browse" onClick={onClick}>
      {image ? `Image:${image}` : 'Browse'}
    </button>
  ),
}));

const baseDbContext = {
  data: {
    shops: [{ id: 'shopA', name: 'Shop A' }],
    items: [],
    parts: [],
    services: [],
    completions: [],
    settings: {},
    users: [],
    archive: [],
    types: [],
    deleted: [],
    invoices: [],
    logs: [],
    transactions: [],
    leases: [],
    leaseCompletions: [],
  },
  refreshData: vi.fn(),
  setData: vi.fn(),
  removeData: vi.fn(),
  restoreData: vi.fn(),
  removePermanentData: vi.fn(),
  removePermanentDataList: vi.fn(),
  refreshImagePointers: vi.fn(),
  uploadDataBatch: vi.fn(),
  getType: vi.fn(),
  updateLatest: vi.fn(),
} as unknown as DBContextType;

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DBContext.Provider value={baseDbContext}>
    <ShopContext.Provider
      value={{ shop: { id: 'shopA', name: 'Shop A' }, setShop: vi.fn() }}
    >
      {children}
    </ShopContext.Provider>
  </DBContext.Provider>
);

describe('FormModal', () => {
  const fields: CrudField[] = [
    { key: 'name', label: 'Name', type: 'text' },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'a', name: 'A' },
        { value: 'b', name: 'B' },
      ],
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'multiselect',
      options: [
        { value: 't1', name: 'T1' },
        { value: 't2', name: 'T2' },
      ],
    },
    { key: 'photo', label: 'Photo', type: 'image' },
    { key: 'storage', label: 'Storage', type: 'number' },
  ];

  const baseData = {
    id: 'x',
    shop_id: ['shopA'],
    name: 'Part X',
    category: 'a',
    tags: ['t1'],
    photo: undefined,
    storage: [3],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fields and allows editing, then saves updated data', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <Wrapper>
        <FormModal
          title="Edit Item"
          fields={fields}
          data={baseData}
          onClose={onClose}
          onSave={onSave}
        />
      </Wrapper>,
    );

    // Text input change
    const nameInput = screen.getByTestId('input-Name') as HTMLInputElement;
    expect(nameInput.value).toBe('Part X');
    fireEvent.change(nameInput, { target: { value: 'Part X Updated' } });

    // Select change
    const categorySelect = screen.getByTestId(
      'select-category',
    ) as HTMLSelectElement;
    fireEvent.change(categorySelect, { target: { value: 'b' } });

    // Multiselect select all via our mock button
    const tagsMulti = screen.getByTestId('multiselect-tags');
    fireEvent.click(tagsMulti);

    // Number input (stored as array with shop index 0)
    const storageInput = screen.getByTestId(
      'input-Storage',
    ) as HTMLInputElement;
    fireEvent.change(storageInput, { target: { value: '7' } });

    // Save
    fireEvent.click(screen.getByTestId('btn-Save'));

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedArg = onSave.mock.calls[0][0];

    expect(savedArg.name).toBe('Part X Updated');
    expect(savedArg.category).toBe('b');
    expect(savedArg.tags).toEqual(['t1', 't2']);
    // Number is passed as string by our simple mock; verify value propagated
    expect(savedArg.storage).toBe('7');
  });

  it('opens media modal and sets image, then saves with updated photo', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <Wrapper>
        <FormModal
          title="Edit Item"
          fields={fields}
          data={baseData}
          onClose={vi.fn()}
          onSave={onSave}
        />
      </Wrapper>,
    );

    // Open gallery
    fireEvent.click(screen.getByTestId('media-browse'));
    // Our mock MediaModal is shown; set the image
    fireEvent.click(screen.getByTestId('media-set'));

    // After setting, the modal should switch back to form view, and we can save
    fireEvent.click(screen.getByTestId('btn-Save'));

    const savedArg = onSave.mock.calls[0][0];
    expect(savedArg.photo).toBe('img.png');
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();

    render(
      <Wrapper>
        <FormModal
          title="Edit Item"
          fields={fields}
          data={baseData}
          onClose={onClose}
          onSave={vi.fn()}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByTestId('btn-Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
