import GeneralModal from './GeneralModal.tsx';
import {useTranslation} from 'react-i18next';
import TableViewComponent from '../elements/TableViewComponent.tsx';
import {
  GeneralModalButtons,
  ImportShopDataArguments,
  Shop,
  StoreItem,
  StorePart,
} from '../../interfaces/interfaces.ts';
import {useContext, useState} from 'react';
import {DBContext} from '../../database/DBContext.ts';
import {PageHead} from '../elements/PageHead.tsx';

export default function ImportShopData({
  onClose,
  shop,
  inPlace,
  title,
}: ImportShopDataArguments) {
  const {t} = useTranslation();
  const dbContext = useContext(DBContext);

  const [isItemSelected, setIsItemSelected] = useState(false);
  const [isPartSelected, setIsPartSelected] = useState(false);
  const [shopFilter, setShopFilter] = useState<string>();
  const [shops] = useState<Shop[]>(dbContext?.data.shops || []);
  const [search, setSearch] = useState('');
  const [selectedData, setSelectedData] = useState<{
    [key: number]: boolean | undefined;
  }>([]);

  if (!shop) return null;
  const filteredShopId = shops.find((shop) => shop.name === shopFilter)?.id;

  const data = [
    ...(isItemSelected ? dbContext?.data.items || [] : []).map((d) => ({
      ...d,
      docType: 'items',
    })),
    ...(isPartSelected ? dbContext?.data.parts || [] : []).map((d) => ({
      ...d,
      docType: 'parts',
    })),
  ].filter((item) => {
    if (search) {
      const lowerCaseFilter = search.toLowerCase();
      if (
        !item.name?.toLowerCase().includes(lowerCaseFilter) &&
        !item.sku?.toLowerCase().includes(lowerCaseFilter)
      ) {
        return false;
      }
    }
    if (filteredShopId && !item.shop_id?.includes(filteredShopId)) {
      return false;
    }
    return !item.shop_id?.includes(shop?.id);
  });

  const isAllSelected = Object.keys(selectedData).length === data.length;

  const tableLines = data.map((item) => {
    const stLimit =
      item.storage_limit &&
      (item.storage_limit[0] || item.storage_limit[0] === 0)
        ? Number(item.storage_limit[0])
        : 5;

    return [item.sku, item.name || '', stLimit, Number(item.price || 0)];
  });

  const buttons: GeneralModalButtons[] = [
    {
      primary: true,
      onClick: async (): Promise<false> => {
        const dataToImport = data.reduce(
          (out, data, index) => {
            if (
              selectedData[index] &&
              data &&
              (data.docType === 'items' || data.docType === 'parts')
            ) {
              if (!data.shop_id) {
                data.shop_id = [];
              }
              if (!data.storage) {
                data.storage = [0];
              }
              if (!data.storage_limit) {
                data.storage_limit = [5];
              }
              if (shop?.id) {
                data.shop_id.push(shop.id);
                data.storage_limit.push(data.storage_limit[0]);
                data.storage.push(0);
                out[data.docType].push(data as StoreItem | StorePart);
              }
            }
            return out;
          },
          {
            items: [],
            parts: [],
          } as {items: StoreItem[]; parts: StorePart[]}
        );

        const length = dataToImport.items.length + dataToImport.parts.length;
        console.log('Ready to import ' + length + ' data');

        if (
          length &&
          window.confirm(
            t('Are you sure to import the following amount into your shop? ') +
              length
          )
        ) {
          if (dataToImport.items.length) {
            await dbContext?.uploadDataBatch('items', dataToImport.items);
          }
          if (dataToImport.parts.length) {
            await dbContext?.uploadDataBatch('parts', dataToImport.parts);
          }

          alert('Import successful');
        }
        return false;
      },
      value: t('Import'),
    },
    {
      onClick: onClose,
      value: t('Cancel'),
    },
  ];

  return (
    <GeneralModal
      buttons={buttons}
      inPlace={inPlace}
      title={title || t('Import Shop Data')}
      id={'ImportShopData'}
    >
      <PageHead
        shopFilter={shopFilter}
        setShopFilter={setShopFilter}
        buttons={[
          {
            value: (
              <span className={isItemSelected ? '' : 'text-gray-400'}>
                {t('Items')}
              </span>
            ),
            onClick: () => {
              setIsItemSelected(!isItemSelected);
            },
          },
          {
            value: (
              <span className={isPartSelected ? '' : 'text-gray-400'}>
                {t('Parts')}
              </span>
            ),
            onClick: () => {
              setIsPartSelected(!isPartSelected);
            },
          },
          {
            value: isAllSelected ? t('Deselect All') : t('Select All'),
            onClick: () => {
              setSelectedData(
                isAllSelected
                  ? {}
                  : data.reduce(
                      (out, _value, index) => {
                        out[index] = true;
                        return out;
                      },
                      {} as {[key: number]: boolean | undefined}
                    )
              );
            },
          },
        ]}
        onSearch={(value) => {
          setSearch(value);
        }}
      />

      <div className={'flex flex-1 overflow-y-auto flex-wrap'}>
        <TableViewComponent
          lines={tableLines}
          header={[
            t('SKU'),
            {
              value: t('Name'),
              type: 'text',
              sortable: true,
            },
            {
              value: t('Min Storage Limit'),
              type: 'steps',
              sortable: true,
            },
            {
              value: t('Price'),
              type: 'number',
              postFix: ' Ft',
              sortable: true,
            },
          ]}
          selectedIndexes={selectedData}
          onClick={(index) => {
            selectedData[index] = !selectedData[index];

            setSelectedData({...selectedData});
          }}
        ></TableViewComponent>
      </div>
    </GeneralModal>
  );
}
