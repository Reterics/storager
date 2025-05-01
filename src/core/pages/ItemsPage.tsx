import {useTranslation} from 'react-i18next';
import {useMemo} from 'react';
import {useContext} from 'react';
import {StyledSelectOption} from '../../interfaces/interfaces';
import {DBContext} from '../../database/DBContext.ts';
import FirebaseCrudManager, {
  CrudField,
} from '../components/FirebaseCrudManager.tsx';

export default function ItemsPage() {
  const {t, i18n} = useTranslation();
  const dbContext = useContext(DBContext);

  const shopOptions: StyledSelectOption[] = useMemo(
    () =>
      dbContext?.data?.shops?.map((shop) => ({
        name: shop.name || '',
        value: shop.id,
      })) || [],
    [dbContext?.data?.shops]
  );

  const typeOptions = useMemo(
    () => dbContext?.getType('item', i18n.language as 'hu' | 'en') || [],
    [dbContext, i18n.language]
  );

  const fields: CrudField[] = useMemo(
    () => [
      {key: 'image', label: t('Image'), type: 'image', editable: false},
      {key: 'sku', label: t('SKU'), type: 'text', editable: true},
      {key: 'name', label: t('Name'), type: 'text', editable: true},
      {key: 'storage', label: t('Storage'), type: 'number', editable: true},
      {key: 'price', label: t('Price'), type: 'number', editable: true},
      {
        key: 'shop_id',
        label: t('Shop'),
        type: 'select',
        editable: true,
        options: shopOptions,
      },
      // Modal only fields:
      {
        key: 'type',
        label: t('Type'),
        type: 'select',
        editable: true,
        visible: false,
        options: typeOptions,
      },
      {
        key: 'description',
        label: t('Description'),
        type: 'text',
        editable: true,
        visible: false,
      },
      {
        key: 'cost',
        label: t('Cost'),
        type: 'number',
        editable: true,
        visible: false,
      },
      {
        key: 'net_price',
        label: t('Net Price'),
        type: 'number',
        editable: true,
        visible: false,
      },
      {
        key: 'storage_limit',
        label: t('Min Storage Limit'),
        type: 'number',
        editable: true,
        visible: false,
      },
    ],
    [t, shopOptions, typeOptions]
  );

  return (
    <FirebaseCrudManager
      entityType='items'
      title={t('Items')}
      fields={fields}
    />
  );
}
