import {useContext, useState, useMemo, JSX, ChangeEvent} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {ShopContext} from '../store/ShopContext.tsx';
import {useTranslation} from 'react-i18next';

import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import {extractStorageInfo, sortItemsByWarn} from '../utils/storage.ts';
import {changeStoreType} from '../utils/events.ts';
import {storeTableKeyOrder} from '../interfaces/constants.ts';
import {
  GeneralButtons,
  StoreItem,
  StorePart,
  TableHead,
} from '../interfaces/interfaces.ts';
import {PageHead} from '../components/elements/PageHead.tsx';
import {
  GenericStoreModalProps,
  StoreEntity,
} from '../components/modals/GenericStoreModal.tsx';

interface StoreEntityPageProps<T> {
  entityType: 'items' | 'parts';
  renderModal: (props: GenericStoreModalProps<StoreEntity>) => JSX.Element;
  defaultValues: Partial<T>;
  extractId: (item: T) => string;
  renderExtra?: () => React.ReactNode;
  getTypeKey: keyof T;
  extraButtons?: GeneralButtons[];
  headerConfig?: TableHead[];
}

function StoreEntityPage<T extends StoreItem | StorePart>({
  entityType,
  renderModal,
  defaultValues,
  extractId,
  renderExtra,
  getTypeKey,
  extraButtons = [],
  headerConfig,
}: StoreEntityPageProps<T>) {
  const dbContext = useContext(DBContext);
  const shopContext = useContext(ShopContext);
  const {t} = useTranslation();

  const selectedShopId = shopContext.shop?.id as string;
  const allItems = (dbContext?.data?.[entityType] || []) as T[];
  const [filter, setFilter] = useState('');
  const [modalTemplate, setModalTemplate] = useState<T | null>(null);

  const filteredItems = useMemo(() => {
    const lower = filter.toLowerCase();
    return allItems.filter(
      (item) =>
        item.shop_id?.includes(selectedShopId) &&
        (!filter ||
          item.name?.toLowerCase().includes(lower) ||
          item.sku?.toLowerCase().includes(lower))
    );
  }, [filter, allItems, selectedShopId]);

  const warnings = useMemo(
    () => sortItemsByWarn(filteredItems, selectedShopId),
    [filteredItems, selectedShopId]
  );
  const error = warnings.length
    ? `${warnings.length} ${t('low storage alert')}`
    : undefined;

  const shops = dbContext?.data.shops || [];
  const typeOptions = shops.map((shop) => ({
    value: shop.id,
    name: shop.name || '',
  }));

  const closeItem = async (item: StoreEntity) => {
    await dbContext?.setData(entityType, item);
    await dbContext?.refreshImagePointers?.([item]);
    await dbContext?.refreshData(entityType);
    setModalTemplate(null);
  };

  const deleteItem = async (item: T) => {
    if (
      item.id &&
      window.confirm(t('Are you sure you wish to delete this item?'))
    ) {
      if (item.shop_id && item.shop_id.length > 1) {
        const i = item.shop_id.indexOf(selectedShopId);
        if (i === -1) return;
        item.shop_id.splice(i, 1);
        item.storage?.splice(i, 1);
        item.storage_limit?.splice(i, 1);
        item.price?.splice(i, 1);
        await dbContext?.setData(entityType, item);
      } else {
        await dbContext?.removeData(entityType, item.id);
      }
      await dbContext?.refreshData(entityType);
    }
  };

  const changeTableElement = async (
    id: string,
    col: number,
    value: unknown
  ) => {
    const key = storeTableKeyOrder[col] as keyof StoreEntity;
    const item = allItems.find((i) => extractId(i) === id) as StoreEntity;
    if (item && key) {
      const changedItem =
        changeStoreType(
          {currentTarget: {value}} as ChangeEvent<HTMLInputElement>,
          key as string,
          item,
          selectedShopId
        ) || item;
      await dbContext?.setData(entityType, {
        id: item.id,
        [key]: changedItem[key],
      });
      await dbContext?.refreshData(entityType);
    }
  };

  const tableLines = filteredItems.map((item) => {
    const storageInfo = extractStorageInfo(item, selectedShopId);
    const array = [
      item.image ? <img src={item.image} width='40' alt='preview' /> : '',
      item.sku,
      item.name || '',
      storageInfo.storage,
      storageInfo.price,
      shopContext.shop?.name || t('No shop'),
      TableViewActions({
        onRemove: () => deleteItem(item),
        onEdit: () => setModalTemplate(item),
      }),
    ];
    array[-1] = storageInfo.lowStorageAlert ? 1 : 0;
    array[-2] = extractId(item);
    return array;
  });

  const defaultHeader: (TableHead | string)[] = [
    t('Image'),
    t('SKU'),
    {value: t('Name'), type: 'text', sortable: true, editable: true},
    {value: t('Storage'), type: 'steps', sortable: true, editable: true},
    {
      value: t('Price'),
      type: 'number',
      postFix: ' Ft',
      sortable: true,
      editable: true,
    },
    {value: t('Shop'), type: 'select', editable: true, options: typeOptions},
    t('Actions'),
  ];

  const buttons: GeneralButtons[] = [
    {
      value: <span>{t('Add')}</span>,
      onClick: () =>
        setModalTemplate({...defaultValues, shop_id: [selectedShopId]} as T),
    },
    ...extraButtons,
  ];

  return (
    <>
      <PageHead
        title={t(entityType)}
        buttons={buttons}
        error={error}
        onSearch={setFilter}
      />
      {renderExtra?.()}
      <TableViewComponent
        lines={tableLines}
        isHighlighted={(line) => !!line[-1]}
        onEdit={(line, col, value) =>
          changeTableElement(line[-2] as string, Number(col), value)
        }
        header={headerConfig || defaultHeader}
      />
      <div className='flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1'>
        {modalTemplate &&
          renderModal({
            item: modalTemplate,
            onClose: () => setModalTemplate(null),
            onSave: (item: StoreEntity) => closeItem(item),
            setItem: (item: StoreEntity | null) => setModalTemplate(item as T),
            getTypeKey: getTypeKey as keyof StoreEntity,
            selectedShopId,
          })}
      </div>
    </>
  );
}

export default StoreEntityPage;
