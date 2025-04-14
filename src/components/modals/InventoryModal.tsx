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
import TableViewComponent from "../elements/TableViewComponent.tsx";
import {PageHead} from "../elements/PageHead.tsx";

export interface InventoryModalProps {
    inPlace?: boolean,
    onClose: () => void,
    onSave: (inventoryData: InventoryModalData) => onClickReturn,
    inventoryData: InventoryModalData,
    items: StorePart[] | StoreItem[]
}

export default function InventoryModal({onClose, onSave, inventoryData, items, inPlace}: InventoryModalProps) {
    const {t} = useTranslation();
    const [selectedData, setSelectedData] = useState<{[key: number]: boolean | undefined}>([]);
    const [search, setSearch] = useState('');

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

    const tableLines = data.map(item => {
        return [
            item.name || item.sku,
            1,
            ''
        ]
    })


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
                        value: t('Deselect All'),
                        onClick: () => {
                            setSelectedData({})
                        }
                    }
                ]}
                onSearch={(value) => {
                    setSearch(value)
                }}
            />
            <div className={"flex flex-1 overflow-y-auto flex-wrap"}>
                <TableViewComponent
                    lines={tableLines}
                    header={[
                        {
                            value: t('Name'),
                            type: "text",
                        },
                        {
                            value: t('Storage'),
                            type: 'steps',
                            editable: true
                        },
                        {
                            value: t(''),
                            type: 'text'
                        },
                    ]}
                    selectedIndexes={selectedData}
                    onClick={(index) => {
                        selectedData[index] = !selectedData[index];

                        setSelectedData({...selectedData});
                    }}
                />
            </div>
        </GeneralModal>
    )
}