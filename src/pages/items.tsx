import {useContext, useState} from 'react'
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";

import {Shop, StoreItem, StyledSelectOption} from "../interfaces/interfaces.ts";
import {BsFillPlusCircleFill} from "react-icons/bs";
import ItemModal from "../components/modals/ItemModal.tsx";
import {DBContext} from "../database/DBContext.ts";
import {PageHead} from "../components/elements/PageHead.tsx";
import { useTranslation } from 'react-i18next';
import {ShopContext} from "../store/ShopContext.tsx";
import UnauthorizedComponent from "../components/Unauthorized.tsx";

function Items() {
    const dbContext = useContext(DBContext);
    const shopContext = useContext(ShopContext);
    const { t } = useTranslation();

    let initialItems = dbContext?.data.items || [];
    if (shopContext.shop) {
        initialItems = initialItems.filter((item) => shopContext.shop?.id === item.shop_id);
    }

    const [items, setItems] = useState<StoreItem[]>(initialItems);
    const [shops] = useState<Shop[]>(dbContext?.data.shops || []);

    let error;
    const storageWarnings = items.filter(item=> !item.storage || item.storage < (item.storage_limit || 5));
    if (storageWarnings.length) {
        error = storageWarnings.length + t(' low storage alert');
    }

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
            setItems(initialItems.filter(item => item.name?.includes(filterBy) || item.sku?.includes(filterBy)))
        }
    };

    const deleteItem = async (item: StoreItem) => {
        if (item.id && window.confirm(t('Are you sure you wish to delete this Item?'))) {
            let updatedItems = await dbContext?.removeData('items', item.id) as StoreItem[];
            if (shopContext.shop) {
                updatedItems = (updatedItems as StoreItem[])
                    .filter((item) => shopContext.shop?.id === item.shop_id);
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
                .filter((item) => shopContext.shop?.id === item.shop_id);
        }
        setItems(updatedItems as StoreItem[]);
        setModalTemplate(null);
    }

    const changeType = (e: React.ChangeEvent<HTMLInputElement> | {target: {value: unknown}}, key: string, item: StoreItem) => {
        const value = e.target.value;

        const obj = {...item};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setItems((items) => {
            return items.map(i => {
                if (i === item) {
                    return obj as StoreItem;
                }
                return {...i} as StoreItem;
            })
        });
    };

    const tableKeyOrder = ['image', 'sku', 'name', 'storage', 'price', 'shop'];

    const changeTableElement = (index: number, col: string | number, value: unknown) => {
        const key = tableKeyOrder[col as number];
        const item = items[index] as StoreItem;

        if (item && key) {
            changeType({
                target: {
                    value: value
                }
            }, key, item);

            dbContext?.setData('items', {
                id: item.id,
                [key]: value
            });
        }
    };

    const tableLines = items.map(item => {
        const assignedShop = item.shop_id ? shops.find(i => i.id === item.shop_id) : null;

        return [
            item.image ? <img src={item.image} width="40" alt="image for item" /> : '',
            item.sku,
            item.name || '',
            Number(item.storage || 0),
            Number(item.price || 0),
            assignedShop ? assignedShop.name : t('Nincs megadva'),
            TableViewActions({
                onRemove: () => deleteItem(item),
                onEdit: () => setModalTemplate(item)
            })
        ];
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
                        shop_id: shopContext.shop?.id,
                        storage: 1,
                        storage_limit: 5
                    })
                }
            ]} error={error} onSearch={filterItems}/>

            <TableViewComponent lines={tableLines}
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
                                onChange={(index, col, value) => changeTableElement(index, col, value)}
            />

            <div className="flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1">
                <ItemModal
                    onClose={()=>setModalTemplate(null)}
                    onSave={(item: StoreItem) => closeItem(item)}
                    setItem={(item: StoreItem) => setModalTemplate(item)}
                    item={modalTemplate}
                    inPlace={false}
                />
            </div>
        </>
    )
}

export default Items
