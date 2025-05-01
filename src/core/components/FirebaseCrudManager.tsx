import {ReactNode, useContext, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ContextDataType,
  ContextDataValueType,
  GenericContextEntityType,
} from '../../interfaces/firebase.ts';
import {DBContext} from '../../database/DBContext.ts';
import {ShopContext} from '../../store/ShopContext.tsx';
import {
  GeneralButtons,
  StorageInfo,
  StorePart,
  StyledSelectOption,
  TableHead,
  TableLineType,
  TableRowType,
} from '../../interfaces/interfaces.ts';
import TableViewComponent, {
  TableViewActions,
} from '../../components/elements/TableViewComponent.tsx';
import {PageHead} from '../../components/elements/PageHead.tsx';
import FormModal from './FormModal.tsx';
import {BsFillPlusCircleFill} from 'react-icons/bs';
import {extractStorageInfo, sortItemsByWarn} from '../../utils/storage.ts';
import {multiShopKeys} from '../../utils/events.ts';

export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'date'
  | 'password'
  | 'image';

export interface CrudField {
  postFix?: string;
  key: string;
  label: string;
  type: FieldType;
  editable?: boolean;
  creatable?: boolean;
  sortable?: boolean;
  visible?: boolean;
  options?: StyledSelectOption[];
  props?: {
    onChange?: (value: unknown, row: TableRowType) => void;
  };
}

interface FirebaseCrudManagerProps {
  entityType: ContextDataType;
  title: string;
  fields: CrudField[];
  extraButtons?: GeneralButtons[];
  children?: ReactNode;
}

export default function FirebaseCrudManager<
  T extends GenericContextEntityType,
>({entityType, title, fields, extraButtons, children}: FirebaseCrudManagerProps) {
  const dbContext = useContext(DBContext);
  const shopContext = useContext(ShopContext);
  const {t} = useTranslation();

  const selectedShopId = shopContext.shop?.id;
  const [tableLimits, setTableLimits] = useState<number>(100);
  const [filterText, setFilterText] = useState<string>('');
  const [modalData, setModalData] = useState<GenericContextEntityType | null>(
    null
  );

  const filterItems = (items: StorePart[], filterBy: string) => {
    if (!filterBy) {
      return items;
    }
    const lowerCaseFilter = filterBy.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerCaseFilter) ||
        item.sku?.toLowerCase().includes(lowerCaseFilter)
    );
  };
  const data = useMemo(() => {
    const allData = (dbContext?.data?.[entityType] ||
      []) as GenericContextEntityType[];
    if (!selectedShopId || !Array.isArray(allData))
      return filterItems(allData, filterText);
    return filterItems(
      allData.filter((entry) => entry.shop_id?.includes?.(selectedShopId)),
      filterText
    );
  }, [dbContext?.data, entityType, filterText, selectedShopId]);

  const isStorageItem = !!(
    fields.find((f) => f.key === 'storage') &&
    fields.find((f) => f.key === 'storage_limit')
  );

  const warnings = useMemo(
    () => (isStorageItem ? sortItemsByWarn(data, selectedShopId) : []),
    [data, selectedShopId, isStorageItem]
  );
  const error = warnings.length
    ? warnings.length + t(' low storage alert')
    : undefined;

  const visibleFields = fields.filter(
    (f) => f.visible || f.visible === undefined
  );

  const headers = visibleFields.map((f: CrudField) => {
    if (!f.editable) return f.label;
    return {
      value: f.label,
      type: f.type,
      editable: true,
      sortable: f.sortable,
      postFix: f.postFix,
      options: f.options,
    };
  }) as TableHead[];

  const tableLines = data.map((entry: ContextDataValueType) => {
    let storageInfo: StorageInfo | undefined;
    const line = visibleFields.map((f: CrudField) => {
      const key = f.key as keyof ContextDataValueType;
      if (
        f.key === 'shop_id' &&
        Array.isArray(f.options) &&
        !f.editable
      ) {
        return (
          f.options?.find((opt) =>
            (entry[key] as unknown as string[]).includes(opt.value)
          )?.name || entry[key]
        );
      } else if (
        multiShopKeys.includes(f.key as (typeof multiShopKeys)[number])
      ) {
        storageInfo = storageInfo || extractStorageInfo(entry, selectedShopId);
        switch (f.key) {
          case 'storage_limit':
            return storageInfo.storageLimit;
          case 'storage':
            return storageInfo.storage;
          case 'price':
            return storageInfo.price;
        }
      }
      return entry[key];
    }) as TableLineType;
    line.push(
      TableViewActions({
        onEdit: () => setModalData(entry),
        onRemove: async () => {
          if (entry.id && confirm(t('Are you sure?'))) {
            await dbContext?.removeData(entityType, entry.id);
            await dbContext?.refreshData(entityType);
          }
        },
      })
    );

    line[-1] = storageInfo?.lowStorageAlert ? 1 : 0;
    line[-2] = entry.id;
    return line;
  });

  const handleSave = async (item: ContextDataValueType) => {
    await dbContext?.setData(entityType, item);
    await dbContext?.refreshData(entityType);
    setModalData(null);
  };

  return (
    <>
      <PageHead
        title={t(title)}
        buttons={[
          {
            value: <BsFillPlusCircleFill />,
            onClick: () =>
              setModalData({
                id: '',
                shop_id: selectedShopId ? [selectedShopId] : [],
              } as T),
          },
          ...(extraButtons || [])
        ]}
        error={error}
        onSearch={(e) => setFilterText(e)}
        tableLimits={tableLimits}
        setTableLimits={setTableLimits}
      >{children}</PageHead>
      <TableViewComponent
        lines={tableLines}
        header={[...headers, t('Actions')]}
        onEdit={(line, col, value) => {
          const key = visibleFields[Number(col)]?.key;
          if (!key) return;
          const id = line[-2];
          const found = data.find((entry) => entry.id === id);
          if (!found) return;
          const newItem = {...found, [key]: value};
          dbContext?.setData(entityType, newItem);
        }}
        isHighlighted={(line) => line[-1] === 1}
      />

      {modalData && (
        <FormModal
          title={t('Edit') + ' ' + t(title)}
          fields={fields}
          data={modalData}
          onClose={() => setModalData(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
