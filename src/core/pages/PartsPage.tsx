import {useTranslation} from 'react-i18next';
import {ChangeEvent, useMemo, useState} from 'react';
import {useContext} from 'react';
import {
  InventoryModalData,
  StorePart,
  StyledSelectOption,
} from '../../interfaces/interfaces';
import {DBContext} from '../../database/DBContext.ts';
import FirebaseCrudManager, {
  CrudField,
} from '../components/FirebaseCrudManager.tsx';
import {modules} from '../../database/firebase/config.ts';
import {BsClipboard2PlusFill} from 'react-icons/bs';
import {ShopContext} from '../../store/ShopContext.tsx';
import InventoryModal from '../../components/modals/InventoryModal.tsx';
import {extractStorageInfo} from '../../utils/storage.ts';
import {changeStoreType} from '../../utils/events.ts';
import LaborFeeInput from '../../components/elements/LaborFeeInput.tsx';
import {toSelectOptions} from '../../utils/data.ts';

export default function PartsPage() {
  const dbContext = useContext(DBContext);
  const shopContext = useContext(ShopContext);
  const selectedShopId = shopContext.shop?.id as string;
  const entities = dbContext?.data.parts || [];

  const {t, i18n} = useTranslation();
  const [inventoryData, setInventoryData] = useState<InventoryModalData | null>(
    null
  );

  const shopOptions: StyledSelectOption[] = useMemo(
    () => toSelectOptions(dbContext?.data?.shops || []),
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
      // Modal-only fields
      {
        key: 'category',
        label: t('Category'),
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

  const extraButtons = modules.transactions
    ? [
        {
          value: <BsClipboard2PlusFill />,
          onClick: () =>
            setInventoryData(
              inventoryData
                ? null
                : {
                    selectedItems: [],
                  }
            ),
          testId: 'inventoryButton',
        },
      ]
    : [];

  return (
    <>
      <FirebaseCrudManager
        entityType='parts'
        title={t('Parts')}
        fields={fields}
        extraButtons={extraButtons}
      >
        {modules.transactions && <LaborFeeInput />}
      </FirebaseCrudManager>
      {inventoryData && shopContext.shop && (
        <InventoryModal
          onClose={() => setInventoryData(null)}
          onSave={(data) => {
            for (const id of Object.keys(data)) {
              const item = entities.find((p) => p.id === id);
              if (item) {
                const storageInfo = extractStorageInfo(item, selectedShopId);

                const changedItem = (changeStoreType(
                  {
                    currentTarget: {
                      value: storageInfo.storage - data[id],
                    },
                  } as unknown as ChangeEvent<HTMLInputElement>,
                  'storage',
                  item,
                  selectedShopId
                ) || item) as StorePart;
                dbContext?.setData('parts', {
                  id: item.id,
                  storage: changedItem.storage,
                });
              }
            }
            setInventoryData(null);
          }}
          inPlace={false}
          items={entities}
          selectedShopId={selectedShopId}
        />
      )}
    </>
  );
}
