import StyledInput from "../elements/StyledInput.tsx";
import {GeneralModalButtons, ItemModalInput, StoreItem} from "../../interfaces/interfaces.ts";
import {ChangeEvent, useState} from "react";
import StyledFile from "../elements/StyledFile.tsx";
import StyledSelect from "../elements/StyledSelect.tsx";
import {fileToDataURL} from "../../utils/general.ts";
import {uploadFileDataURL} from "../../firebase/storage.ts";
import GeneralModal from "./GeneralModal.tsx";
import {useTranslation} from "react-i18next";
import FormRow from "../elements/FormRow.tsx";
import {shopItemTypeOptions} from "../../interfaces/constants.ts";


export default function ItemModal({ onClose, item, setItem, onSave, inPlace }: ItemModalInput) {
    const { t } = useTranslation();

    const [file, setFile] = useState<File|null>(null)


    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

        const obj = {...item};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setItem(obj as StoreItem);
    };

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
            assetToSave.image = 'screenshots/item_' + (item?.id || new Date().getTime()) + '.png';
        }

        if (assetToSave.image && screenshot) {
            await uploadFileDataURL(assetToSave.image, screenshot);
        }
        // await uploadFile(assetToSave.path, file);
        onSave(assetToSave);
    };

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
        <GeneralModal buttons={buttons} inPlace={inPlace}
                      title={t('Edit Item')} id="ItemModal" >
            <FormRow>
                <StyledInput
                    type="text" name="sku"
                    value={item.sku}
                    onChange={(e) => changeType(e, 'sku')}
                    label={t('SKU')}
                />
                <StyledInput
                    type="text" name="name"
                    value={item.name}
                    onChange={(e) => changeType(e, 'name')}
                    label={t("Name")}
                />

                <StyledSelect
                    type="text" name="Type"
                    options={shopItemTypeOptions}
                    value={item.type || shopItemTypeOptions[0].value}
                    onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'type')}
                    label={t("Type")}
                />
            </FormRow>

            <FormRow>
                <StyledInput
                    type="textarea" name="description"
                    value={item.description}
                    onChange={(e) => changeType(e, 'description')}
                    label={t('Description')}
                />

                <StyledFile name="model" label={t('Image')}
                            onChange={setFile} preview={true}
                            defaultPreview={item?.image}/>

            </FormRow>



            <FormRow>
                <StyledInput
                    type="number" name="storage"
                    value={item.storage}
                    onChange={(e) => changeType(e, 'storage')}
                    label={t('Storage')}
                    pattern="[0-9\.]+"
                    maxLength={11}
                />
                <StyledInput
                    type="number" name="storage_limit"
                    value={item.storage_limit}
                    onChange={(e) => changeType(e, 'storage_limit')}
                    label={t('Min Storage Limit')}
                    pattern="[0-9\.]+"
                    maxLength={11}
                />
                <StyledInput
                    type="number" name="price"
                    value={item.price}
                    onChange={(e) => changeType(e, 'price')}
                    label={t('Price')}
                    pattern="[0-9]+"
                    maxLength={11}
                />
            </FormRow>
        </GeneralModal>
    )
}
