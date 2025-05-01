import {useTranslation} from 'react-i18next';
import {ChangeEvent, useMemo, useState} from 'react';
import {useContext} from 'react';
import {InventoryModalData, StorePart, StyledSelectOption, Transaction} from '../../interfaces/interfaces';
import {DBContext} from '../../database/DBContext.ts';
import FirebaseCrudManager, {
  CrudField,
} from '../components/FirebaseCrudManager.tsx';
import {modules} from '../../database/firebase/config.ts';
import {confirm, popup} from '../../components/modalExporter.ts';
import {BsClipboard2PlusFill, BsFloppy} from 'react-icons/bs';
import {ShopContext} from '../../store/ShopContext.tsx';
import InventoryModal from '../../components/modals/InventoryModal.tsx';
import {extractStorageInfo} from '../../utils/storage.ts';
import {changeStoreType} from '../../utils/events.ts';


export default function PartsPage() {
  const dbContext = useContext(DBContext);
  const shopContext = useContext(ShopContext);
  const selectedShopId = shopContext.shop?.id as string;
  const entities = dbContext?.data.parts || [];

  const { t, i18n } = useTranslation();
  const [inventoryData, setInventoryData] = useState<InventoryModalData | null>(
    null
  );
  const [laborFee, setLaborFee] = useState<string>('');

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

  const fields: CrudField[] = useMemo(() => [
    { key: 'image', label: t('Image'), type: 'image', editable: false },
    { key: 'sku', label: t('SKU'), type: 'text', editable: true },
    { key: 'name', label: t('Name'), type: 'text', editable: true },
    { key: 'storage', label: t('Storage'), type: 'number', editable: true },
    { key: 'price', label: t('Price'), type: 'number', editable: true },
    { key: 'shop_id', label: t('Shop'), type: 'select', editable: true, options: shopOptions },
    // Modal-only fields
    { key: 'category', label: t('Category'), type: 'select', editable: true, visible: false, options: typeOptions },
    { key: 'description', label: t('Description'), type: 'text', editable: true, visible: false },
    { key: 'cost', label: t('Cost'), type: 'number', editable: true, visible: false },
    { key: 'net_price', label: t('Net Price'), type: 'number', editable: true, visible: false },
    { key: 'storage_limit', label: t('Min Storage Limit'), type: 'number', editable: true, visible: false },
  ], [t, shopOptions, typeOptions]);

  const extraButtons = modules.transactions ? [
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
    }
  ] : [];

  return (
    <>
      <FirebaseCrudManager
        entityType="parts"
        title={t('Parts')}
        fields={fields}
        extraButtons={extraButtons}
      >
        {modules.transactions && (
          <div className='flex max-w-32'>
            <input
              value={laborFee}
              onChange={(e) => setLaborFee(e.target.value)}
              type='text'
              data-testid='laborFee'
              className='block w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-l-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 dark:bg-gray-800 dark:text-white dark:border-gray-600'
              placeholder={t('Labor Fee')}
            />
            <button
              onClick={async () => {
                const laborFeeNumeric = Number.parseInt(laborFee);
                if (Number.isNaN(laborFeeNumeric) || laborFee.trim() === '') {
                  return void popup(
                    t('Please provide a valid number for labor fee')
                  );
                }
                const response = await confirm(
                  <div>
                    {t('Are you sure to save the following labor fee?')}
                    <br />
                    {laborFeeNumeric} Ft
                  </div>
                );

                if (response) {
                  const netPrice = laborFeeNumeric / 1.27;

                  dbContext?.setData('transactions', {
                    net_amount: netPrice,
                    cost: netPrice,
                    gross_amount: laborFeeNumeric,
                    item_type: 'other',
                    payment_method: 'cash',
                    document_type: 'receipt',
                    transaction_type: 'labor',
                    user: dbContext?.data.currentUser?.email,
                    shop_id: [selectedShopId],
                  } as Transaction);
                }
              }}
              type='button'
              data-testid='laborFeeButton'
              className='px-2.5 py-2 text-gray-800 bg-white hover:bg-gray-100 border-y border-r border-gray-300 rounded-r-md focus:ring-2 focus:ring-gray-800 focus:outline-none'
            >
              <BsFloppy size={18} />
            </button>
          </div>
        )}
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