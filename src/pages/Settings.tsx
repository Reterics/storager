import {FormEvent, useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {PageHead} from "../components/elements/PageHead.tsx";
import StyledInput from "../components/elements/StyledInput.tsx";
import FormRow from "../components/elements/FormRow.tsx";
import {SettingsItems} from "../interfaces/interfaces.ts";


function Service() {
    const firebaseContext = useContext(DBContext);
    const { t } = useTranslation();

    const initialSettings = firebaseContext?.data.settings || {
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
        await firebaseContext?.setData('settings', settingsItems);
        setShouldSave(false);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        void saveFirebaseSettings();
    };

    return (
        <>
            <PageHead title={t('Settings')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: () => console.log('To be implemented -> Save Button')
                }
            ]}/>

            <div className="bg-white p-4 rounded dark:bg-gray-900 min-w-[60vw] m-auto">
                <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-scroll pe-2 ps-1">
                    {/* Company Details */}
                    <h2 className="text-2xl font-bold mb-4">{t('Company Details')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('Company Name')}</label>
                            <input
                                type="text"
                                name="companyName"
                                value={settingsItems.companyName}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('Address')}</label>
                            <input
                                type="text"
                                name="address"
                                value={settingsItems.address}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        {/* Tax ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('Tax ID')}</label>
                            <input
                                type="text"
                                name="taxId"
                                value={settingsItems.taxId}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        {/* Bank Account Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('Bank Account Number')}</label>
                            <input
                                type="text"
                                name="bankAccount"
                                value={settingsItems.bankAccount}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('Phone')}</label>
                            <input
                                type="tel"
                                name="phone"
                                value={settingsItems.phone}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('Email')}</label>
                            <input
                                type="email"
                                name="email"
                                value={settingsItems.email}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>

                    {/* SMTP Data */}
                    <h2 className="text-2xl font-bold mt-8 mb-4">{t('SMTP Settings')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        {/* SMTP Server */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('SMTP Server')}</label>
                            <input
                                type="text"
                                name="smtpServer"
                                value={settingsItems.smtpServer}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        {/* Port */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('Port')}</label>
                            <input
                                type="number"
                                name="port"
                                value={settingsItems.port}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('Username')}</label>
                            <input
                                type="text"
                                name="username"
                                value={settingsItems.username}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('Password')}</label>
                            <input
                                type="password"
                                name="password"
                                value={settingsItems.password}
                                onChange={changeType}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        {/* Use SSL */}
                        <div className="col-span-1 md:col-span-2 flex items-center">
                            <input
                                type="checkbox"
                                name="useSSL"
                                checked={settingsItems.useSSL}
                                onChange={changeType}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">{t('Use SSL')}</label>
                        </div>
                    </div>


                    <FormRow>
                          <StyledInput
                            type="textarea" name="serviceAgreement"
                            value={settingsItems.serviceAgreement}
                            onChange={(e) => changeType(e)}
                            label={t("Service Agreement")}
                        />
                    </FormRow>

                    {/* Submit Button */}
                    <div className="mt-8">
                        {shouldSave && <button
                            type="submit"
                            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            {t('Save Settings')}
                        </button> }
                    </div>
                </form>
            </div>
        </>
    )
}

export default Service;
