import {useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {PageHead} from "../components/elements/PageHead.tsx";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {ShopContext} from "../store/ShopContext.tsx";
import {Shop, StoreItem, StorePart, StyledSelectOption} from "../interfaces/interfaces.ts";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import PartModal from "../components/modals/PartModal.tsx";
import UnauthorizedComponent from "../components/Unauthorized.tsx";


function Parts() {
    const dbContext = useContext(DBContext);
    const shopContext = useContext(ShopContext);
    const { t } = useTranslation();

    let initialParts = dbContext?.data.parts || [];
    if (shopContext.shop) {
        initialParts = initialParts.filter((item) => shopContext.shop?.id === item.shop_id);
    }

    const [parts, setParts] = useState<StorePart[]>(initialParts);
    const [shops] = useState<Shop[]>(dbContext?.data.shops || []);

    let error;
    const storageWarnings = parts.filter(item => !item.storage || item.storage < (item.storage_limit || 5));
    if (storageWarnings.length) {
        error = storageWarnings.length + t(' low storage alert');
    }

    const [modalTemplate, setModalTemplate] = useState<StorePart|null>(null)

    const typeOptions: StyledSelectOption[] = shops.map((key)=>{
        return {
            "name": key.name,
            "value": key.id
        } as StyledSelectOption
    });

    const filterItems = (filterBy: string) => {
        if (!filterBy) {
            setParts(initialParts);
        } else {
            setParts(initialParts.filter(item => item.name?.includes(filterBy) || item.sku?.includes(filterBy)))
        }
    }

    const deletePart = async (item: StorePart) => {
        if (item.id && window.confirm(t('Are you sure you wish to delete this Part?'))) {
            let updatedItems = await dbContext?.removeData('parts', item.id) as StorePart[];
            if (shopContext.shop) {
                updatedItems = (updatedItems as StorePart[])
                    .filter((item) => shopContext.shop?.id === item.shop_id);
            }
            setParts(updatedItems);
        }
    };

    const closePart = async (item?: StorePart)=> {
        let updatedParts = await dbContext?.setData('parts', item as StorePart);
        if (item) {
            await dbContext?.refreshImagePointers([item]);
        }

        if (shopContext.shop) {
            updatedParts = (updatedParts as StorePart[])
                .filter((item) => shopContext.shop?.id === item.shop_id);
        }
        setParts(updatedParts as StorePart[]);
        setModalTemplate(null);
    }

    const changeType = (e: React.ChangeEvent<HTMLInputElement> | {target: {value: unknown}}, key: string, item: StorePart) => {
        const value = e.target.value;

        const obj = {...item};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setParts((items) => {
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
        const item = parts[index] as StoreItem;

        if (item && key) {
            changeType({
                target: {
                    value: value
                }
            }, key, item);
        }

        dbContext?.setData('parts', {
            id: item.id,
            [key]: value
        });
    };

    const tableLines = parts.map(item => {
        const assignedShop = item.shop_id ? shops.find(i => i.id === item.shop_id) : null;

        return [
            item.image ? <img src={item.image} width="40" alt="image for item" /> : '',
            item.sku,
            item.name || '',
            item.storage || 0,
            item.price || 0,
            assignedShop ? assignedShop.name : t('Nincs megadva'),
            TableViewActions({
                onRemove: () => deletePart(item),
                onEdit: () => setModalTemplate(item)
            })
        ];
    });

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    return (
        <>
            <PageHead title={t('Parts')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: () => setModalTemplate(modalTemplate ? null : {
                        id: '',
                        shop_id: shopContext.shop?.id,
                        storage: 1,
                        storage_limit: 5
                    })
                }
            ]} error={error} onSearch={filterItems} />

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
                <PartModal
                    onClose={() => setModalTemplate(null)}
                    onSave={(item: StoreItem) => closePart(item)}
                    setPart={(item: StoreItem) => setModalTemplate(item)}
                    part={modalTemplate}
                    inPlace={false}
                />
            </div>
        </>
    )

}

export default Parts;
