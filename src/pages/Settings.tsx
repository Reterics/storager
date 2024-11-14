import {FormEvent, useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import StyledInput from "../components/elements/StyledInput.tsx";
import FormRow from "../components/elements/FormRow.tsx";
import {SettingsItems} from "../interfaces/interfaces.ts";
import UnauthorizedComponent from "../components/Unauthorized.tsx";


function Service() {
    const dbContext = useContext(DBContext);
    const { t } = useTranslation();

    const initialSettings = dbContext?.data.settings || {
        id: '',
        companyName: '',
        address: '',
        taxId: '',
        bankAccount: '',
        phone: '',
        email: '',
        smtpServer: '',
        port: '',
        username: '',
        password: '',
        useSSL: false,

        serviceAgreement: ''
    };


    const [shouldSave, setShouldSave] = useState(false);
    const [settingsItems, setSettingsItems] = useState<SettingsItems>(initialSettings);

    const changeType = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettingsItems((prevDetails) => ({
            ...prevDetails,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setShouldSave(true);
    };

    const saveFirebaseSettings = async () => {
        await dbContext?.setData('settings', settingsItems);
        setShouldSave(false);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        void saveFirebaseSettings();
    };

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    return (
        <>

            <div className="bg-white p-4 rounded dark:bg-gray-900 min-w-[60vw] m-auto">
                <form onSubmit={handleSubmit} className="max-h-[65vh] overflow-y-scroll pe-2 ps-1">
                    <h2 className="text-2xl font-bold mb-4">{t('Company Details')}</h2>

                    <FormRow>
                        <StyledInput
                            type="text" name="companyName"
                            value={settingsItems.companyName}
                            onChange={changeType}
                            label={t('Company Name')}
                        />
                        <StyledInput
                            type="text" name="address"
                            value={settingsItems.address}
                            onChange={changeType}
                            label={t('Address')}
                        />
                    </FormRow>
                    <FormRow>
                        <StyledInput
                            type="text" name="taxId"
                            value={settingsItems.taxId}
                            onChange={changeType}
                            label={t('Tax ID')}
                        />
                        <StyledInput
                            type="text" name="bankAccount"
                            value={settingsItems.bankAccount}
                            onChange={changeType}
                            label={t('Bank Account Number')}
                        />
                    </FormRow>
                    <FormRow>
                        <StyledInput
                            type="text" name="phone"
                            value={settingsItems.phone}
                            onChange={changeType}
                            label={t('Phone')}
                        />
                        <StyledInput
                            type="text" name="email"
                            value={settingsItems.email}
                            onChange={changeType}
                            label={t('Email')}
                        />
                    </FormRow>

                    <FormRow>
                        <StyledInput
                            type="textarea" name="serviceAgreement"
                            value={settingsItems.serviceAgreement}
                            onChange={(e) => changeType(e)}
                            label={t("Service Agreement")}
                        />
                    </FormRow>

                    <div className="mt-8">
                        {shouldSave && <button
                            type="submit"
                            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            {t('Save Settings')}
                        </button>}
                    </div>
                </form>
            </div>
        </>
    )
}

export default Service;
