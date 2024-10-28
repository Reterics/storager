import {useTranslation} from "react-i18next";
import {GeneralModalButtons, ShopType, StorePart, TypeModalInput} from "../../interfaces/interfaces.ts";
import GeneralModal from "./GeneralModal.tsx";
import FormRow from "../elements/FormRow.tsx";
import StyledInput from "../elements/StyledInput.tsx";
import {typeModalOptions} from "../../interfaces/constants.ts";
import {ChangeEvent, useMemo} from "react";
import StyledSelect from "../elements/StyledSelect.tsx";


export default function TypeModal({onClose, type, setType, onSave, inPlace}: TypeModalInput) {
    const { t, i18n } = useTranslation();

    const types = useMemo(()=>{
        return typeModalOptions.map(type=> {
            type.name = t(type.name);
            return type;
        })
    }, [t]);

    const changeTranslation = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;
        const obj = {...type} as ShopType;
        if(!obj.translations) {
            obj.translations = {};
        }
        obj.translations[key] = value;

        setType(obj as StorePart);
    }

    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

        const obj = {...type};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;


        if (key === 'name') {
            if(!obj.translations) {
                obj.translations = {};
            }
            obj.translations[i18n.language] = value;
        }

        setType(obj as StorePart);
    };

    if (!type) {
        return null;
    }

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=>onSave(type),
            value: t('Save')
        },
        {
            onClick: onClose,
            value: t('Cancel')
        }
    ];

    return (<GeneralModal buttons={buttons} inPlace={inPlace}
                    title={t('Edit Type')} id={'TypeModal'}>
        <FormRow>
            <StyledInput
                type="text" name="name"
                value={type.name}
                onChange={(e) => changeType(e, 'name')}
                label={t("Name")}
            />

            <StyledSelect
                type="text" name="category"
                options={types}
                value={type.category || types[0].value}
                onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'category')}
                label={t("Category")}
            />
        </FormRow>

        <FormRow>
            <StyledInput
                type="text" name="hu"
                value={type.translations?.hu || ''}
                onChange={(e) => changeTranslation(e, 'hu')}
                label={t("HU")}
            />
            <StyledInput
                type="text" name="en"
                value={type.translations?.en || ''}
                onChange={(e) => changeTranslation(e, 'en')}
                label={t("EN")}
            />
        </FormRow>
    </GeneralModal>);
}
