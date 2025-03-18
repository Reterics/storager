import {ChangeEvent, useContext, useState} from 'react'
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";

import {Shop, StoreItem,  StyledSelectOption} from "../interfaces/interfaces.ts";
import {BsFillPlusCircleFill} from "react-icons/bs";
import ItemModal from "../components/modals/ItemModal.tsx";
import {DBContext} from "../database/DBContext.ts";
import {PageHead} from "../components/elements/PageHead.tsx";
import { useTranslation } from 'react-i18next';
import {ShopContext} from "../store/ShopContext.tsx";
import UnauthorizedComponent from "../components/Unauthorized.tsx";
import {extractStorageInfo, sortItemsByWarn} from "../utils/storage.ts";
import {changeStoreType} from "../utils/events.ts";
import {storeTableKeyOrder} from "../interfaces/constants.ts";

function Items() {
    const dbContext = useContext(DBContext);
    const shopContext = useContext(ShopContext);
    const { t } = useTranslation();

    const selectedShopId = shopContext.shop ? shopContext.shop.id : dbContext?.data.shops[0]?.id as string;
    const initialItems = (dbContext?.data.items || [])
        .filter((item) => item.shop_id?.includes(selectedShopId));

    const warnings = sortItemsByWarn(initialItems, selectedShopId);

    const [items, setItems] = useState<StoreItem[]>(initialItems);
    const [shops] = useState<Shop[]>(dbContext?.data.shops || []);

    const error = warnings.length ? warnings.length + t(' low storage alert') : undefined;

    const [modalTemplate, setModalTemplate] = useState<StoreItem|null>(null)

    const typeOptions: StyledSelectOption[] = shops.map((key)=>{
        return {
            "name": key.name,
            "value": key.id
        } as StyledSelectOption
    });

    const filterItems = (filterBy: string) => {
        if (!filterBy) {
            setItems(initialItems);
        } else {
            const lowerCaseFilter = filterBy.toLowerCase();

            setItems(initialItems.filter(item => item.name?.toLowerCase().includes(lowerCaseFilter) || item.sku?.toLowerCase().includes(lowerCaseFilter)))
        }
    };

    const deleteItem = async (item: StoreItem) => {
        if (item.id && window.confirm(t('Are you sure you wish to delete this Item?'))) {
            let updatedItems;
            if (item.shop_id && item.shop_id?.length > 1) {
                const indexToRemove = item.shop_id.indexOf(selectedShopId);
                if (indexToRemove === -1) {
                    return;
                }
                item.shop_id.splice(indexToRemove, 1);
                item.storage?.splice(indexToRemove, 1);
                item.storage_limit?.splice(indexToRemove, 1);
                updatedItems = await dbContext?.setData('items', item as StoreItem) as StoreItem[];
            } else {
                updatedItems = await dbContext?.removeData('items', item.id) as StoreItem[];
            }
            if (shopContext.shop) {
                updatedItems = (updatedItems as StoreItem[])
                    .filter((item) => item.shop_id?.includes(selectedShopId));
            }
            setItems(updatedItems);
        }
    };

    const closeItem = async (item?: StoreItem)=> {
        let updatedItems = await dbContext?.setData('items', item as StoreItem);
        if (item) {
            await dbContext?.refreshImagePointers([item]);
        }

        if (shopContext.shop) {
            updatedItems = (updatedItems as StoreItem[])
                .filter((item) => item.shop_id?.includes(selectedShopId));
        }
        setItems(updatedItems as StoreItem[]);
        setModalTemplate(null);
    }

    const changeTableElement = (id: string, col: string | number, value: unknown) => {
        const key = storeTableKeyOrder[col as number];
        let item = items.find(p => p.id === id);

        if (item && key) {
            const changedItem = changeStoreType({
                target: {
                    value: value
                }
            } as ChangeEvent<HTMLInputElement>, key, item, selectedShopId) || item;
            setItems((items) =>
                items.map(i => i.id === item?.id ? (changedItem as StoreItem) : {...i}));
            item = changedItem;
            dbContext?.setData('items', {id: item.id, [key as keyof StoreItem]: item[key as keyof StoreItem]});
        }
    };

    const tableLines = items.map(item => {
        const storageInfo = extractStorageInfo(item, selectedShopId);

        const array =  [
            item.image ? <img src={item.image} width="40" alt="image for item" /> : '',
            item.sku,
            item.name || '',
            storageInfo.storage,
            Number(item.price || 0),
            shopContext.shop ? shopContext.shop.name : t('Nincs megadva'),
            TableViewActions({
                onRemove: () => deleteItem(item),
                onEdit: () => setModalTemplate(item)
            })
        ];

        array[-1] = storageInfo.lowStorageAlert ? 1 : 0;
        array[-2] = item.id;

        return array;
    });

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    return (
        <>
            <PageHead title={t('Items')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick:() => setModalTemplate(modalTemplate ? null : {
                        id: '',
                        shop_id: [selectedShopId],
                        storage: [1],
                        storage_limit: [5]
                    }),
                    testId: 'addButton'
                }
            ]} error={error} onSearch={filterItems}/>

            <TableViewComponent lines={tableLines}
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
                                        editable: true
                                    },
                                    {
                                        value: t('Storage'),
                                        type: 'steps',
                                        sortable: true,
                                        editable: true
                                    },
                                    {
                                        value: t('Price'),
                                        type: 'number',
                                        postFix: ' Ft',
                                        sortable: true,
                                        editable: true
                                    },
                                    {
                                        value: t('Shop'),
                                        type: 'select',
                                        editable: true,
                                        options: typeOptions
                                    },
                                    t('Actions')]}
                                onEdit={(tableLine, col, value) => changeTableElement(tableLine[-2] as string, col, value)}
            />

            {!tableLines.length && !initialItems.length &&
                <div className="text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-2 max-w-screen-xl w-full shadow-md self-center">
                    {t('There is no items in selected shop: ') + shopContext.shop?.name}
                </div>
            }

            <div className="flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1">
                <ItemModal
                    onClose={()=>setModalTemplate(null)}
                    onSave={(item: StoreItem) => closeItem(item)}
                    setItem={(item: StoreItem|null) => setModalTemplate(item)}
                    item={modalTemplate}
                    inPlace={false}
                    selectedShopId={selectedShopId}
                />
            </div>
        </>
    )
}

export default Items
