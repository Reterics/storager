import { CrudField } from './FirebaseCrudManager';
import { useState } from 'react';
import GeneralModal from '../../components/modals/GeneralModal.tsx';
import StyledInput from '../../components/elements/StyledInput.tsx';
import StyledSelect from '../../components/elements/StyledSelect.tsx';
import {ContextDataValueType} from '../../interfaces/firebase.ts';
import StyledMultiSelect from '../../components/elements/StyledMultiSelect.tsx';
import MediaModal, {MediaBrowse} from '../../components/modals/MediaModal.tsx';

interface FormModalProps {
  title: string;
  fields: CrudField[];
  data: ContextDataValueType;
  onClose: () => void;
  onSave: (data: ContextDataValueType) => Promise<void>;
}

export default function FormModal({ title, fields, data, onClose, onSave }: FormModalProps) {
  const [form, setForm] = useState<ContextDataValueType>(data);
  const [gallery, setGallery] = useState<string|false>(false);

  const update = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: CrudField) => {
    const value = form[field.key as keyof ContextDataValueType] ?? '';

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'date':
      case 'number':
      case 'password':
        return (
          <StyledInput
            type={field.type}
            value={(value || '') as string}
            onChange={(e) => update(field.key, e.target.value)}
            label={field.label}
          />
        );
      case 'select':
        return (
          <StyledSelect
            options={field.options || []}
            name={field.key}
            value={(value || '') as string}
            onSelect={(e) => update(field.key, (e.target as HTMLSelectElement).value)}
            label={field.label}
          />
        );
      case 'multiselect':
        return (
          <StyledMultiSelect
            options={field.options || []}
            name={field.key}
            value={Array.isArray(value) ? value : []}
            onSelect={(selected: string[]) => update(field.key, selected)}
            label={field.label}
          />
        );
      case 'image':
        return <MediaBrowse image={value as string | undefined} onClick={() => setGallery(field.key)} />
      default:
        return <span>Unsupported field type: {field.type}</span>;
    }
  };

  if (gallery) {
    return (
      <MediaModal
        setFile={(image) => {
          setForm({
            ...form,
            [gallery]: image || undefined,
          });
          setGallery(false);
        }}
        onClose={() => setGallery(false)}
      />
    );
  }

  return (
    <GeneralModal
      title={title}
      onClose={onClose}
      buttons={[
        {
          value: 'Save',
          onClick: () => onSave(form),
          primary: true,
        },
        {
          value: 'Cancel',
          onClick: onClose,
        },
      ]}
    >
      <div className="grid grid-cols-2 gap-3">
        {fields.filter(f => f.creatable !== false).map((field) => (
          <div key={field.key}>{renderField(field)}</div>
        ))}
      </div>
    </GeneralModal>
  );
}
