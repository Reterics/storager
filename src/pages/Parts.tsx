import {ChangeEvent, useContext, useEffect, useMemo, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {useTranslation} from 'react-i18next';
import {PageHead} from '../components/elements/PageHead.tsx';
import {BsClipboard2PlusFill, BsFillPlusCircleFill} from 'react-icons/bs';
import {ShopContext} from '../store/ShopContext.tsx';
import {
  InventoryModalData,
  Shop,
  StorePart,
  StyledSelectOption,
} from '../interfaces/interfaces.ts';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import PartModal from '../components/modals/PartModal.tsx';
import {extractStorageInfo, sortItemsByWarn} from '../utils/storage.ts';
import {changeStoreType} from '../utils/events.ts';
import {storeTableKeyOrder} from '../interfaces/constants.ts';
import InventoryModal from '../components/modals/InventoryModal.tsx';

import {confirm} from '../components/modalExporter.ts';
import {modules} from '../database/firebase/config.ts';
import LaborFeeInput from '../components/elements/LaborFeeInput.tsx';

function Parts() {
  const dbContext = useContext(DBContext);
  const shopContext = useContext(ShopContext);
  const {t} = useTranslation();

  const [tableLimits, setTableLimits] = useState<number>(100);
  const selectedShopId = shopContext.shop?.id as string;

  const [filterText, setFilterText] = useState<string>('');

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

  const [allParts, setAllParts] = useState<StorePart[]>([]);
  const warnings = useMemo(
    () => sortItemsByWarn(allParts, selectedShopId),
    [allParts, selectedShopId]
  );
  const parts = useMemo(
    () => filterItems(allParts, filterText),
    [allParts, filterText]
  );
  const [shops] = useState<Shop[]>(dbContext?.data.shops || []);

  const error = warnings.length
    ? warnings.length + t(' low storage alert')
    : undefined;

  const [modalTemplate, setModalTemplate] = useState<StorePart | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryModalData | null>(
    null
  );

  const typeOptions: StyledSelectOption[] = useMemo(
    () =>
      shops.map((key) => ({
        name: key.name || '',
        value: key.id,
      })),
    [shops]
  );

  useEffect(() => {
    const selectedShopId = shopContext.shop?.id;
    if (!selectedShopId) return;

    const updatedParts = (dbContext?.data.parts || []).filter((item) =>
      item.shop_id?.includes(selectedShopId)
    );

    setAllParts(updatedParts);
  }, [dbContext?.data, shopContext.shop]); // no need for shopContext.shop since it's static

  const deletePart = async (item: StorePart) => {
    if (
      item.id &&
      (await confirm(t('Are you sure you wish to delete this Part?')))
    ) {
      let updatedItems;
      if (item.shop_id && item.shop_id?.length > 1) {
        const indexToRemove = item.shop_id.indexOf(selectedShopId);
        if (indexToRemove === -1) {
          return;
        }
        item.shop_id.splice(indexToRemove, 1);
        item.storage?.splice(indexToRemove, 1);
        item.storage_limit?.splice(indexToRemove, 1);
        item.price?.splice(indexToRemove, 1);
        updatedItems = (await dbContext?.setData(
          'parts',
          item as StorePart
        )) as StorePart[];
      } else {
        updatedItems = (await dbContext?.removeData(
          'parts',
          item.id
        )) as StorePart[];
      }
      if (shopContext.shop) {
        updatedItems = (updatedItems as StorePart[]).filter((item) =>
          item.shop_id?.includes(selectedShopId)
        );
      }
      sortItemsByWarn(updatedItems, selectedShopId);
    }
  };

  const closePart = async (item?: StorePart) => {
    let updatedParts = (await dbContext?.setData(
      'parts',
      item as StorePart
    )) as StorePart[];
    if (item) {
      await dbContext?.refreshImagePointers([item]);
    }

    if (shopContext.shop) {
      updatedParts = (updatedParts as StorePart[]).filter((item) =>
        item.shop_id?.includes(selectedShopId)
      );
    }
    sortItemsByWarn(updatedParts, selectedShopId);
    setModalTemplate(null);
  };

  const changeTableElement = (
    id: string,
    col: string | number,
    value: unknown
  ) => {
    const key = storeTableKeyOrder[col as number] as keyof StorePart;
    const item = parts.find((p) => p.id === id);
    if (item && key) {
      const changedItem = (changeStoreType(
        {
          currentTarget: {
            value: value,
          },
        } as ChangeEvent<HTMLInputElement>,
        key,
        item,
        selectedShopId
      ) || item) as StorePart;
      dbContext?.setData('parts', {
        id: item.id,
        [key]: changedItem[key],
      });
    }
  };

  const tableLines = parts.map((item) => {
    const storageInfo = extractStorageInfo(item, selectedShopId);

    const array = [
      item.image ? (
        <img src={item.image} width='40' alt='image for item' />
      ) : (
        ''
      ),
      item.sku,
      item.name || '',
      storageInfo.storage,
      storageInfo.price,
      shopContext.shop ? shopContext.shop.name : t('Nincs megadva'),
      TableViewActions({
        onRemove: () => deletePart(item),
        onEdit: () => setModalTemplate(item),
      }),
    ];

    array[-1] = storageInfo.lowStorageAlert ? 1 : 0;
    array[-2] = item.id;

    return array;
  });

  const headButtons = [
    {
      value: <BsFillPlusCircleFill />,
      onClick: () =>
        setModalTemplate(
          modalTemplate
            ? null
            : {
                id: '',
                shop_id: [selectedShopId],
                storage: [1],
                storage_limit: [5],
                price: [0],
              }
        ),
      testId: 'addButton',
    },
  ];

  if (modules.transactions) {
    headButtons.unshift({
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
    });
  }

  return (
    <>
      <PageHead
        title={t('Parts')}
        buttons={headButtons}
        error={error}
        onSearch={(e) => setFilterText(e)}
        tableLimits={tableLimits}
        setTableLimits={setTableLimits}
      >
        {modules.transactions && <LaborFeeInput />}
      </PageHead>

      <TableViewComponent
        lines={tableLines}
        isHighlighted={(item) => {
          return !!item[-1];
        }}
        header={[
          t('Image'),
          t('SKU'),
          {
            value: t('Name'),
            type: 'text',
            sortable: true,
            editable: true,
          },
          {
            value: t('Storage'),
            type: 'steps',
            sortable: true,
            editable: true,
          },
          {
            value: t('Price'),
            type: 'number',
            postFix: ' Ft',
            sortable: true,
            editable: true,
          },
          {
            value: t('Shop'),
            type: 'select',
            editable: false,
            options: typeOptions,
          },
          t('Actions'),
        ]}
        onEdit={(tableLine, col, value) =>
          changeTableElement(tableLine[-2] as string, col, value)
        }
        tableLimits={tableLimits}
      />

      {!tableLines.length && !allParts.length && (
        <div className='text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-2 max-w-screen-xl w-full shadow-md self-center'>
          {t('There is no parts in selected shop: ') + shopContext.shop?.name}
        </div>
      )}

      <div className='flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1'>
        <PartModal
          onClose={() => setModalTemplate(null)}
          onSave={(item: StorePart) => closePart(item)}
          setPart={(item: StorePart | null) => setModalTemplate(item)}
          part={modalTemplate}
          inPlace={false}
          selectedShopId={selectedShopId}
        />
        {inventoryData && shopContext.shop && (
          <InventoryModal
            onClose={() => setInventoryData(null)}
            onSave={(data) => {
              for (const id of Object.keys(data)) {
                const item = parts.find((p) => p.id === id);
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
            items={parts}
            selectedShopId={selectedShopId}
          />
        )}
      </div>
    </>
  );
}

export default Parts;
