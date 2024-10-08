import StyledInput from "../elements/StyledInput.tsx";
import {
    GeneralModalButtons,
    StoreItem,
    StyledSelectOption,
    UserData,
    UserModalInput
} from "../../interfaces/interfaces.ts";
import {ChangeEvent, useState} from "react";
import StyledSelect from "../elements/StyledSelect.tsx";
import GeneralModal from "./GeneralModal.tsx";
import {useTranslation} from "react-i18next";
import FormRow from "../elements/FormRow.tsx";
import {userRoleOptions} from "../../interfaces/constants.ts";
import AlertBox from "../AlertBox.tsx";
import {SignUp} from "../../firebase/services/AuthService.ts";


export default function UserModal({ onClose, user, setUser, onSave, inPlace, shops }: UserModalInput) {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);

    const typeOptions: StyledSelectOption[] = (shops || []).map((key)=>{
        return {
            "name": key.name,
            "value": key.id
        } as StyledSelectOption
    });

    const changeType = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.target.value;

        const obj = {...user};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        obj[key] = value;

        setUser(obj as StoreItem);
    };

    const uploadAndSave = async (item: UserData) => {
        if (!item) {
            setError(t('Invalid Item'));
            return null;
        }

        const assetToSave: UserData = {
            ...item
        };

        if (!item.email) {
            setError('Email must be provided');
            return;
        }

        if (!item.id) {
            // We verify passwords at user creation
            if (item.password_confirmation !== item.password) {
                setError(t('Passwords mismatch'));
                return;
            }
            await SignUp({
                displayName: item.username || item.email,
                email: item.email,
                password: item.password || '',
            })
        }

        onSave(assetToSave);
    };

    if (!user) return null;

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=>uploadAndSave(user),
            value: t('Save')
        },
        {
            onClick: onClose,
            value: t('Cancel')
        }
    ];
    return (
        <GeneralModal buttons={buttons} inPlace={inPlace}
                      title={t('Edit User')} id="UserModal" >
            <FormRow>
                <StyledInput
                    type="text" name="username"
                    value={user.username}
                    onChange={(e) => changeType(e, 'username')}
                    label={t("Username")}
                />

                <StyledInput
                    type="text" name="email"
                    value={user.email}
                    onChange={(e) => changeType(e, 'email')}
                    label={t("Email")}
                />
            </FormRow>

            {!user.id &&
                <FormRow>
                    <StyledInput
                        type="password" name="password"
                        value={user.password}
                        onChange={(e) => changeType(e, 'password')}
                        label={t("Password")}
                    />

                    <StyledInput
                        type="password" name="password_confirmation"
                        value={user.password_confirmation}
                        onChange={(e) => changeType(e, 'password_confirmation')}
                        label={t("Password Confirmation")}
                    />
                </FormRow>
            }

            <FormRow>
                <StyledSelect
                    options={typeOptions}
                    name="shop_id"
                    value={user.shop_id}
                    onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'shop_id')}
                    label={t("Assigned Shop")}
                />

                <StyledSelect
                    options={userRoleOptions}
                    name="role"
                    value={user.role || userRoleOptions[0].value}
                    onSelect={(e) => changeType(e as unknown as ChangeEvent<HTMLInputElement>, 'role')}
                    label={t("Role")}
                />

            </FormRow>

            {error && <div className={'mt-4 mb-4'}><AlertBox message={error} role={"warning"}/></div>}
        </GeneralModal>
    )
}
