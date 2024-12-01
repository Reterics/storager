import StyledInput from "../elements/StyledInput.tsx";
import {GeneralModalButtons, ItemModalInput, StoreItem} from "../../interfaces/interfaces.ts";
import {ChangeEvent, SyntheticEvent, useContext, useState} from "react";
import StyledSelect from "../elements/StyledSelect.tsx";
import {fileToDataURL} from "../../utils/general.ts";
import {uploadFileDataURL} from "../../database/firebase/storage.ts";
import GeneralModal from "./GeneralModal.tsx";
import {useTranslation} from "react-i18next";
import FormRow from "../elements/FormRow.tsx";
import {DBContext} from "../../database/DBContext.ts";
import {getShopIndex} from "../../utils/storage.ts";
import {changeStoreType} from "../../utils/events.ts";
import MediaModal, {MediaBrowse} from "./MediaModal.tsx";


export default function ItemModal({ onClose, item, setItem, onSave, inPlace, selectedShopId }: ItemModalInput) {
    const { t, i18n } = useTranslation();
    const dbContext = useContext(DBContext);

    const selectTypeOptions = dbContext?.getType('item', i18n.language === 'hu' ? 'hu' : 'en') || [];

    const [file] = useState<File|null>(null)
    const [gallery, setGallery] = useState<boolean>(false)
    const shopIndex = item ? getShopIndex(item, selectedShopId) : -1;

    const changeType = (e: ChangeEvent<HTMLInputElement>|SyntheticEvent<HTMLSelectElement>, key: string) =>
        setItem(changeStoreType(e, key, item, selectedShopId));

    const uploadAndSave = async (item: StoreItem) => {
        let screenshot;

        if (file) {
            screenshot = await fileToDataURL(file) as string;
        }

        if (!item) {
            return false;
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

    if (gallery) {
        return <MediaModal setFile={(image) => {
            setItem({
                ...item,
                image: image || undefined
            });
            setGallery(false);
        }} onClose={() => setGallery(false)}/>
    }

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
                    options={selectTypeOptions}
                    value={item.type || selectTypeOptions[0].value}
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

                <MediaBrowse image={item.image} onClick={()=> setGallery(true)} />
            </FormRow>


            <FormRow>
                <StyledInput
                    type="number" name="storage"
                    value={item.storage?.[shopIndex]}
                    onChange={(e) => changeType(e, 'storage')}
                    label={t('Storage')}
                    pattern="[0-9\.]+"
                    maxLength={11}
                />
                <StyledInput
                    type="number" name="storage_limit"
                    value={item.storage_limit?.[shopIndex]}
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
