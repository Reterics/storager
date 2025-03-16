import {ChangeEvent, SyntheticEvent, useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {PageHead} from "../components/elements/PageHead.tsx";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {ShopContext} from "../store/ShopContext.tsx";
import {Shop, StorePart, StyledSelectOption} from "../interfaces/interfaces.ts";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import PartModal from "../components/modals/PartModal.tsx";
import UnauthorizedComponent from "../components/Unauthorized.tsx";
import {extractStorageInfo, sortItemsByWarn} from "../utils/storage.ts";
import {changeStoreType} from "../utils/events.ts";
import {storeTableKeyOrder} from "../interfaces/constants.ts";


function Parts() {
    const dbContext = useContext(DBContext);
    const shopContext = useContext(ShopContext);
    const { t } = useTranslation();

    const [tableLimits, setTableLimits] = useState<number>(100);
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
            let updatedItems;
            if (item.shop_id && item.shop_id?.length > 1) {
                const indexToRemove = item.shop_id.indexOf(selectedShopId);
                if (indexToRemove === -1) {
                    return;
                }
                item.shop_id.splice(indexToRemove, 1);
                item.storage?.splice(indexToRemove, 1);
                item.storage_limit?.splice(indexToRemove, 1);
                updatedItems = await dbContext?.setData('parts', item as StorePart) as StorePart[];
            } else {
                updatedItems = await dbContext?.removeData('parts', item.id) as StorePart[];
            }
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

    const changeType = (e: ChangeEvent<HTMLInputElement>|SyntheticEvent<HTMLSelectElement>, key: string, part: StorePart) => {
        const obj = changeStoreType(e, key, part, selectedShopId)
        setParts((items) =>
            items.map(i => i === part ? (obj as StorePart) : {...i}));
    };

    const changeTableElement = (index: number, col: string | number, value: unknown) => {
        const key = storeTableKeyOrder[col as number];
        const item: StorePart = parts[index];

        if (item && key) {
            changeType({
                target: {
                    value: value
                }
            } as ChangeEvent<HTMLInputElement>, key, item);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        dbContext?.setData('parts', {id: item.id, [key]: item[key]});
    };

    const tableLines = parts.map(item => {
        const storageInfo = extractStorageInfo(item, selectedShopId);

        const array =  [
            item.image ? <img src={item.image} width="40" alt="image for item" /> : '',
            item.sku,
            item.name || '',
            storageInfo.storage,
            Number(item.price || 0),
            shopContext.shop ? shopContext.shop.name : t('Nincs megadva'),
            TableViewActions({
                onRemove: () => deletePart(item),
                onEdit: () => setModalTemplate(item)
            })
        ];

        array[-1] = storageInfo.lowStorageAlert ? 1 : 0;

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
                    }),
                    testId: 'addButton'
                }
            ]}
                error={error}
                onSearch={filterItems}
                tableLimits={tableLimits}
                setTableLimits={setTableLimits}
            />

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
                            editable: false,
                            options: typeOptions
                        },
                        t('Actions')]}
                    onChange={(index, col, value) => changeTableElement(index, col, value)}
                    tableLimits={tableLimits}
            />

            {!tableLines.length && !initialParts.length &&
                <div className="text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-2 max-w-screen-xl w-full shadow-md self-center">
                    {t('There is no parts in selected shop: ') + shopContext.shop?.name}
                </div>
            }

            <div className="flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1">
                <PartModal
                    onClose={() => setModalTemplate(null)}
                    onSave={(item: StorePart) => closePart(item)}
                    setPart={(item: StorePart|null) => setModalTemplate(item)}
                    part={modalTemplate}
                    inPlace={false}
                    selectedShopId={selectedShopId}
                />
            </div>
        </>
    )

}

export default Parts;
