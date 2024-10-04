import StyledInput from "../elements/StyledInput.tsx";
import {GeneralModalButtons, ItemModalInput, StoreItem, StyledSelectOption} from "../../interfaces/interfaces.ts";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import StyledFile from "../elements/StyledFile.tsx";
import StyledSelect from "../elements/StyledSelect.tsx";
import {fileToDataURL} from "../../utils/general.ts";
import {uploadFileDataURL} from "../../firebase/storage.ts";
import GeneralModal from "./GeneralModal.tsx";
import {useTranslation} from "react-i18next";


export default function ItemModal({ onClose, item, setItem, onSave, inPlace }: ItemModalInput) {
    const { t } = useTranslation();

    const previewImage = useRef<HTMLImageElement|null>(null)
    const [file, setFile] = useState<File|null>(null)

    const typeOptions: StyledSelectOption[] = ["roller"].map((key)=>{
        return {
            "name": key,
            "value": key
        } as StyledSelectOption
    });

    const handleOnClose = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.id === 'ItemModal') {
            onClose();
        }
    };

    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

        const obj = {...item};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setItem(obj as StoreItem);
    };

    const reloadPreview = async (file: File) => {
        const screenshot = await fileToDataURL(file) as string;
        if (screenshot && previewImage.current) {
            previewImage.current.src = screenshot;
        }
    };

    const handleOnChangeFile = (file: File) => {
        setFile(file);
        void reloadPreview(file);
    }

    const uploadAndSave = async (item: StoreItem) => {
        let screenshot;

        if (file) {
            screenshot = await fileToDataURL(file) as string;
        }

        if (!item) {
            return null;
        }

        const assetToSave: StoreItem = {
            ...item
        };


        if (screenshot) {
            assetToSave.image = 'screenshots/' + (item?.id || new Date().getTime()) + '.png';
        }

        if (assetToSave.image && screenshot) {
            await uploadFileDataURL(assetToSave.image, screenshot);
        }
        // await uploadFile(assetToSave.path, file);
        onSave(assetToSave);
    };

    useEffect(() => {
        if (item && previewImage.current && item.image) {
            previewImage.current.src = item.image;
        }
    }, []);

    if (!item) return null;

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=>uploadAndSave(item),
            value: t('Save')
        },
        {
            onClick: onClose,
            value: t('Cancel')
        }
    ];
    return (
        <GeneralModal buttons={buttons} inPlace={inPlace} title={t('Edit Item')} >
            <div className="grid md:grid-cols-3 md:gap-6">
                <StyledInput
                    type="text" name="inventory_id"
                    value={item.inventory_id}
                    onChange={(e) => changeType(e, 'inventory_id')}
                    label="Inventory ID"
                />
                <StyledInput
                    type="text" name="name"
                    value={item.name}
                    onChange={(e) => changeType(e, 'name')}
                    label="Name"
                />

                <StyledSelect
                    type="text" name="Type"
                    options={typeOptions}
                    value={item.type || 'roller'}
                    onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'type')}
                    label="Type"
                />
            </div>

            <div className="grid md:grid-cols-2 md:gap-6">
                <StyledFile name="model" label="Image" onChange={handleOnChangeFile}/>
                <div>
                    <img ref={previewImage} alt={'preview'}/>
                </div>
            </div>


            <StyledInput
                type="text" name="description"
                value={item.description}
                onChange={(e) => changeType(e, 'description')}
                label="Description"
            />

            <div className="grid md:grid-cols-2 md:gap-6">
                <StyledInput
                    type="number" name="storage"
                    value={item.storage}
                    onChange={(e) => changeType(e, 'storage')}
                    label="Storage"
                    pattern="[0-9\.]+"
                    maxLength={11}
                />
                <StyledInput
                    type="number" name="price"
                    value={item.price}
                    onChange={(e) => changeType(e, 'price')}
                    label="Price"
                    pattern="[0-9]+"
                    maxLength={11}
                />
            </div>
        </GeneralModal>
    )
}
