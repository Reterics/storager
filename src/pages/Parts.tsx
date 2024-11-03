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
import {getShopIndex, sortItemsByWarn} from "../utils/storage.ts";


function Parts() {
    const dbContext = useContext(DBContext);
    const shopContext = useContext(ShopContext);
    const { t } = useTranslation();

    const selectedShopId = shopContext.shop ? shopContext.shop.id : dbContext?.data.shops[0]?.id as string;

    const initialParts = (dbContext?.data.parts || [])
        .filter((item) => item.shop_id?.includes(selectedShopId));

    const warnings = sortItemsByWarn(initialParts, selectedShopId);

    const [parts, setParts] = useState<StorePart[]>(initialParts);
    const [shops] = useState<Shop[]>(dbContext?.data.shops || []);

    const error = warnings.length ? warnings.length + t(' low storage alert') : undefined;

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
            const lowerCaseFilter = filterBy.toLowerCase();
            setParts(initialParts.filter(item => item.name?.toLowerCase().includes(lowerCaseFilter) || item.sku?.toLowerCase().includes(lowerCaseFilter)))
        }
    }

    const deletePart = async (item: StorePart) => {
        if (item.id && window.confirm(t('Are you sure you wish to delete this Part?'))) {
            let updatedItems = await dbContext?.removeData('parts', item.id) as StorePart[];
            if (shopContext.shop) {
                updatedItems = (updatedItems as StorePart[])
                    .filter((item) => item.shop_id?.includes(selectedShopId));
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
                .filter((item) => item.shop_id?.includes(selectedShopId));
        }
        setParts(updatedParts as StorePart[]);
        setModalTemplate(null);
    }

    const changeType = (e: React.ChangeEvent<HTMLInputElement> | {target: {value: unknown}}, key: string, part: StorePart) => {
        const value = e.target.value as string;

        let obj: StorePart;
        if (!['storage_limit', 'shop_id', 'storage'].includes(key)) {
            obj = {
                ...part,
                [key]: value
            } as StorePart;
        } else {
            const storeKey = key as 'storage_limit'|'shop_id'|'storage';
            obj = {
                ...part,
                [key]: part?.[storeKey] || []
            } as StorePart;

            if (!Array.isArray(obj[storeKey])) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                obj[storeKey] = [obj[storeKey]]
            }
            const shopIndex = part ? getShopIndex(part, selectedShopId) : -1;
            if (obj[storeKey]) {
                obj[storeKey][shopIndex] = value;
            }
        }

        setParts((items) => {
            return items.map(i => {
                if (i === part) {
                    return obj as StorePart;
                }
                return {...i} as StorePart;
            })
        });
    };

    const tableKeyOrder = ['image', 'sku', 'name', 'storage', 'price', 'shop'];

    const changeTableElement = (index: number, col: string | number, value: unknown) => {
        const key = tableKeyOrder[col as number];
        const item = parts[index] as StorePart;

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
        const shopIndex = getShopIndex(item, selectedShopId);
        const assignedShop = shops[shopIndex];
        const storage = item.storage && item.storage[shopIndex];
        const stLimitA = item.storage_limit &&
        (item.storage_limit[shopIndex] || item.storage_limit[shopIndex] === 0) ? Number(item.storage_limit[shopIndex]) : 5;

        const array =  [
            item.image ? <img src={item.image} width="40" alt="image for item" /> : '',
            item.sku,
            item.name || '',
            Number(storage || 0),
            Number(item.price || 0),
            assignedShop ? assignedShop.name : t('Nincs megadva'),
            TableViewActions({
                onRemove: () => deletePart(item),
                onEdit: () => setModalTemplate(item)
            })
        ];

        array[-1] = storage === undefined || storage < stLimitA ? 1 : 0;

        return array;
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
                        shop_id: [selectedShopId],
                        storage: [1],
                        storage_limit: [5]
                    })
                }
            ]} error={error} onSearch={filterItems} />

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
                                onChange={(index, col, value) => changeTableElement(index, col, value)}
            />

            <div className="flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1">
                <PartModal
                    onClose={() => setModalTemplate(null)}
                    onSave={(item: StoreItem) => closePart(item)}
                    setPart={(item: StoreItem) => setModalTemplate(item)}
                    part={modalTemplate}
                    inPlace={false}
                    selectedShopId={selectedShopId}
                />
            </div>
        </>
    )

}

export default Parts;
