import {
    GeneralModalButtons,
    PartModalInput,
    StorePart
} from "../../interfaces/interfaces.ts";
import {useTranslation} from "react-i18next";
import {ChangeEvent, useContext, useState} from "react";
import {fileToDataURL} from "../../utils/general.ts";
import {uploadFileDataURL} from "../../database/firebase/storage.ts";
import GeneralModal from "./GeneralModal.tsx";
import FormRow from "../elements/FormRow.tsx";
import StyledInput from "../elements/StyledInput.tsx";
import StyledSelect from "../elements/StyledSelect.tsx";
import StyledFile from "../elements/StyledFile.tsx";
import {DBContext} from "../../database/DBContext.ts";
import {getShopIndex} from "../../utils/storage.ts";



export default function PartModal({ onClose, part, setPart, onSave, inPlace, selectedShopId }: PartModalInput) {
    const { t, i18n } = useTranslation();
    const dbContext = useContext(DBContext);
    const [file, setFile] = useState<File|null>(null);

    const shopPartCategoryOptions = dbContext?.getType('part', i18n.language === 'hu' ? 'hu' : 'en') || [];
    const shopIndex = part ? getShopIndex(part, selectedShopId) : -1;

    const changeType = (e: ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

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
            if (obj[storeKey]) {
                obj[storeKey][shopIndex] = value;
            }
        }
        setPart(obj as StorePart);
    };

    const uploadAndSave = async (item: StorePart) => {
        let screenshot;

        if (file) {
            screenshot = await fileToDataURL(file) as string;
        }

        if (!item) {
            return null;
        }

        const assetToSave: StorePart = {
            ...item
        };


        if (screenshot) {
            assetToSave.image = 'screenshots/part_' + (item?.id || new Date().getTime()) + '.png';
        }

        if (assetToSave.image && screenshot) {
            await uploadFileDataURL(assetToSave.image, screenshot);
        }
        // await uploadFile(assetToSave.path, file);
        onSave(assetToSave);
    };

    if (!part) return null;

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=>uploadAndSave(part),
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
                    value={part.sku}
                    onChange={(e) => changeType(e, 'sku')}
                    label={t('SKU')}
                />
                <StyledInput
                    type="text" name="name"
                    value={part.name}
                    onChange={(e) => changeType(e, 'name')}
                    label={t("Name")}
                />

                <StyledSelect
                    type="text" name="Type"
                    options={shopPartCategoryOptions}
                    value={part.category || shopPartCategoryOptions[0].value}
                    onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'type')}
                    label={t("Category")}
                />
            </FormRow>

            <FormRow>
                <StyledInput
                    type="textarea" name="description"
                    value={part.description}
                    onChange={(e) => changeType(e, 'description')}
                    label={t('Description')}
                />

                <StyledFile name="model" label={t('Image')}
                            onChange={setFile} preview={true}
                            defaultPreview={part?.image}/>

            </FormRow>



            <FormRow>
                <StyledInput
                    type="number" name="storage"
                    value={part.storage?.[shopIndex]}
                    onChange={(e) => changeType(e, 'storage')}
                    label={t('Storage')}
                    pattern="[0-9\.]+"
                    maxLength={11}
                />
                <StyledInput
                    type="number" name="storage_limit"
                    value={part.storage_limit?.[shopIndex]}
                    onChange={(e) => changeType(e, 'storage_limit')}
                    label={t('Min Storage Limit')}
                    pattern="[0-9\.]+"
                    maxLength={11}
                />
                <StyledInput
                    type="number" name="price"
                    value={part.price}
                    onChange={(e) => changeType(e, 'price')}
                    label={t('Price')}
                    pattern="[0-9]+"
                    maxLength={11}
                />
            </FormRow>
        </GeneralModal>
    )
}
