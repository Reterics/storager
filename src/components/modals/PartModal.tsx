import {
    GeneralModalButtons,
    PartModalInput,
    StorePart
} from "../../interfaces/interfaces.ts";
import {useTranslation} from "react-i18next";
import {ChangeEvent, SyntheticEvent, useContext, useState} from "react";
import GeneralModal from "./GeneralModal.tsx";
import FormRow from "../elements/FormRow.tsx";
import StyledInput from "../elements/StyledInput.tsx";
import StyledSelect from "../elements/StyledSelect.tsx";
import {DBContext} from "../../database/DBContext.ts";
import {getShopIndex} from "../../utils/storage.ts";
import {changeStoreType} from "../../utils/events.ts";
import MediaModal, {MediaBrowse} from "./MediaModal.tsx";


export default function PartModal({ onClose, part, setPart, onSave, inPlace, selectedShopId }: PartModalInput) {
    const { t, i18n } = useTranslation();
    const dbContext = useContext(DBContext);
    const [gallery, setGallery] = useState<boolean>(false)

    const shopPartCategoryOptions = dbContext?.getType('part', i18n.language === 'hu' ? 'hu' : 'en') || [];
    const shopIndex = part ? getShopIndex(part, selectedShopId) : -1;

    const changeType = (e: ChangeEvent<HTMLInputElement>|SyntheticEvent<HTMLSelectElement>, key: string) =>
        setPart(changeStoreType(e, key, part, selectedShopId));

    const uploadAndSave = async (part: StorePart) => {
        if (!part) {
            return false;
        }

        onSave({
            ...part
        });
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

    if (gallery) {
        return <MediaModal setFile={(image) => {
            setPart({
                ...part,
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

                <MediaBrowse image={part?.image} onClick={()=> setGallery(true)} />
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
