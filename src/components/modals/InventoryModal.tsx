import {useTranslation} from "react-i18next";
import {useState} from "react";
import {
    GeneralModalButtons,
    InventoryModalData,
    onClickReturn,
    StoreItem,
    StorePart
} from "../../interfaces/interfaces.ts";
import GeneralModal from "./GeneralModal.tsx";
import {PageHead} from "../elements/PageHead.tsx";
import TableSelectComponent from "../elements/TableSelectComponent.tsx";
import {BsTrashFill} from "react-icons/bs";
import {extractStorageInfo} from "../../utils/storage.ts";

export interface InventoryModalProps {
    inPlace?: boolean,
    onClose: () => void,
    onSave: (inventoryData: InventoryModalData) => onClickReturn,
    inventoryData: InventoryModalData,
    items: StorePart[] | StoreItem[],
    selectedShopId: string
}

export default function InventoryModal({onClose, onSave, inventoryData, items, inPlace, selectedShopId}: InventoryModalProps) {
    const {t} = useTranslation();
    const [search, setSearch] = useState('');
    const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});

    const data = items
        .filter(item => {
            if (search) {
                const lowerCaseFilter = search.toLowerCase();
                if (!item.name?.toLowerCase().includes(lowerCaseFilter) &&
                    !item.sku?.toLowerCase().includes(lowerCaseFilter)) {
                    return false;
                }
            }
            return true;
        });

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=>onSave(inventoryData),
            value: t('Save'),
            testId: 'saveButton'
        },
        {
            onClick: onClose,
            value: t('Cancel'),
            testId: 'cancelButton'
        }
    ];

    return (
        <GeneralModal buttons={buttons} inPlace={inPlace} id={'InventoryModal'}>

            <PageHead
                title={t('Inventory')}
                buttons={[
                    {
                        value: <BsTrashFill size={16} />,
                        onClick: () => {
                            setSelectedMap({})
                        }
                    }
                ]}
                onSearch={(value) => {
                    setSearch(value)
                }}
            />
            <div className={"flex flex-1 overflow-y-auto flex-wrap"}>
                <TableSelectComponent<StoreItem>
                    items={data}
                    selectedItems={selectedMap}
                    onChange={setSelectedMap}
                    itemRenderer={(item) => {
                        const storageInfo = extractStorageInfo(item, selectedShopId);

                        return [item.sku, item.name, `${item.price} Ft`, storageInfo.storage];
                    }}
                    headers={[t('SKU'), t('Name'), t('Price'), t('Storage')]}
                    getId={(item) => item.id}
                />
            </div>
        </GeneralModal>
    )
}