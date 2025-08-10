import type { ChangeEvent, SyntheticEvent } from 'react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DBContext } from '../../database/DBContext.ts';
import FormRow from '../../components/elements/FormRow.tsx';
import StyledInput from '../../components/elements/StyledInput.tsx';
import StyledSelect from '../../components/elements/StyledSelect.tsx';
import GeneralModal from './GeneralModal.tsx';
import MediaModal, { MediaBrowse } from './MediaModal.tsx';
import { changeStoreType } from '../../utils/events.ts';
import { getShopIndex } from '../../utils/storage.ts';
import type {
  GeneralModalButtons,
  StoreItem,
  StorePart,
} from '../../interfaces/interfaces.ts';

export type StoreEntity = StoreItem | StorePart;

export interface GenericStoreModalProps<T extends StoreEntity> {
  item: T;
  setItem: (item: T | null) => void;
  onClose: () => void;
  onSave: (item: T) => void;
  selectedShopId: string;
  getTypeKey: keyof T; // e.g., 'type' or 'category'
  modalTitle?: string;
  typeLabel?: string;
  typeOptionsOverride?: { name: string; value: string }[];
}

export default function GenericStoreModal<T extends StoreEntity>({
  item,
  setItem,
  onClose,
  onSave,
  selectedShopId,
  getTypeKey,
  modalTitle = 'Edit Item',
  typeLabel = 'Type',
  typeOptionsOverride,
}: GenericStoreModalProps<T>) {
  const { t, i18n } = useTranslation();
  const dbContext = useContext(DBContext);
  const [gallery, setGallery] = useState(false);

  const shopIndex = getShopIndex(item, selectedShopId);
  const isAdmin = dbContext?.data.currentUser?.role === 'admin';

  const typeOptions =
    typeOptionsOverride ||
    dbContext?.getType?.(
      getTypeKey === 'type' ? 'item' : 'part',
      i18n.language === 'hu' ? 'hu' : 'en',
    ) ||
    [];

  const changeType = (
    e: ChangeEvent<HTMLInputElement> | SyntheticEvent<HTMLSelectElement>,
    key: string,
  ) => setItem(changeStoreType(e, key, item, selectedShopId) as T);

  const uploadAndSave = async (asset: T) => {
    if (!asset) return;
    onSave({ ...asset });
  };

  if (!item) return null;

  const buttons: GeneralModalButtons[] = [
    {
      primary: true,
      onClick: () => uploadAndSave(item),
      value: t('Save'),
    },
    {
      onClick: onClose,
      value: t('Cancel'),
    },
  ];

  if (gallery) {
    return (
      <MediaModal
        setFile={(image) => {
          setItem({
            ...item,
            image: image || undefined,
          });
          setGallery(false);
        }}
        onClose={() => setGallery(false)}
      />
    );
  }

  return (
    <GeneralModal
      buttons={buttons}
      inPlace={false}
      title={t(modalTitle)}
      id="GenericStoreModal"
    >
      <FormRow>
        <StyledInput
          type="text"
          name="sku"
          value={item.sku}
          onChange={(e) => changeType(e, 'sku')}
          label={t('SKU')}
        />
        <StyledInput
          type="text"
          name="name"
          value={item.name}
          onChange={(e) => changeType(e, 'name')}
          label={t('Name')}
        />
        <StyledSelect
          name="Type"
          options={typeOptions}
          value={item[getTypeKey] as string}
          onSelect={(e) =>
            changeType(
              e as unknown as ChangeEvent<HTMLInputElement>,
              getTypeKey as string,
            )
          }
          label={t(typeLabel)}
        />
      </FormRow>

      <FormRow>
        <StyledInput
          type="textarea"
          name="description"
          value={item.description}
          onChange={(e) => changeType(e, 'description')}
          label={t('Description')}
        />
        <MediaBrowse image={item.image} onClick={() => setGallery(true)} />
      </FormRow>

      {isAdmin && dbContext?.data.settings?.enableTransactions && (
        <FormRow>
          <StyledInput
            type="number"
            name="cost"
            value={item.cost}
            onChange={(e) => changeType(e, 'cost')}
            label={t('Cost')}
            pattern="[0-9]+"
            maxLength={11}
          />
          <StyledInput
            type="number"
            name="net_price"
            value={item.net_price}
            onChange={(e) => changeType(e, 'net_price')}
            label={t('Net Price')}
            pattern="[0-9]+"
            maxLength={11}
          />
          <div />
        </FormRow>
      )}

      <FormRow>
        <StyledInput
          type="number"
          name="storage"
          value={item.storage?.[shopIndex]}
          onChange={(e) => changeType(e, 'storage')}
          label={t('Storage')}
          pattern="[0-9\.]+"
        />
        <StyledInput
          type="number"
          name="storage_limit"
          value={item.storage_limit?.[shopIndex]}
          onChange={(e) => changeType(e, 'storage_limit')}
          label={t('Min Storage Limit')}
          pattern="[0-9\.]+"
        />
        <StyledInput
          type="number"
          name="price"
          value={item.price?.[shopIndex]}
          onChange={(e) => changeType(e, 'price')}
          label={t('Price')}
          pattern="[0-9]+"
        />
      </FormRow>
    </GeneralModal>
  );
}
