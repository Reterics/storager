import StyledInput from "../elements/StyledInput.tsx";
import {GeneralModalButtons, Shop, ShopModalInput} from "../../interfaces/interfaces.ts";
import {GeoPoint} from "firebase/firestore";
import GeneralModal from "./GeneralModal.tsx";
import {useTranslation} from "react-i18next";
import FormRow from "../elements/FormRow.tsx";


export default function ShopModal({ onClose, shop, setShop, onSave, inPlace }: ShopModalInput) {
    const { t } = useTranslation();

    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

        const obj = {...shop};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setShop(obj as Shop);
    };

    const changeCoordinates = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const [lat, lon] = value.split(' ');

        if (lat && lon && !Number.isNaN(lat) && !Number.isNaN(lon)) {
            setShop({...shop, coordinates: new GeoPoint(Number(lat), Number(lon))} as Shop);
        }
    }


    if (!shop) return null;

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=>onSave(shop),
            value: t('Save')
        },
        {
            onClick: onClose,
            value: t('Cancel')
        }
    ];

    return (<GeneralModal  buttons={buttons} inPlace={inPlace}
                           title={shop.id ? t('Edit Shop') : t('Add Shop')} id={'ShopModal'}>

        <FormRow>
            <StyledInput
                type="text" name="name"
                value={shop.name}
                onChange={(e) => changeType(e, 'name')}
                label="Name"
            />
        </FormRow>


        <FormRow>
            <StyledInput
                type="text" name="coordinates"
                value={shop.coordinates instanceof GeoPoint ?
                    shop.coordinates?.latitude + ' ' + shop.coordinates?.longitude : ''}
                onChange={(e) => changeCoordinates(e)}
                label="Coordinates"
                pattern="[0-9\.]{5}[-]{1}[0-9\.]{5}"
                maxLength={11}
            />
            <StyledInput
                type="text" name="phone"
                value={shop.phone}
                onChange={(e) => changeType(e, 'phone')}
                label="Phone"
            />
        </FormRow>
        <FormRow>
            <StyledInput
                type="text" name="address"
                value={shop.address}
                onChange={(e) => changeType(e, 'address')}
                label="Address"
            />

            <StyledInput
                type="text" name="email"
                value={shop.email}
                onChange={(e) => changeType(e, 'email')}
                label="Email"
            />
        </FormRow>
    </GeneralModal>)
}
