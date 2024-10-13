import StyledSelect from "./elements/StyledSelect.tsx";
import {useTranslation} from "react-i18next";
import {SyntheticEvent, useContext} from "react";
import {useTheme} from "../store/ThemeContext.tsx";
import {DBContext} from "../database/DBContext.ts";

export const Footer = () => {
    const dbContext = useContext(DBContext)
    const settings = dbContext?.data.settings || {
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
    const theme = useTheme();
    const { t, i18n } = useTranslation();

    return (
        <footer className="bg-white rounded-lg shadow m-4 dark:bg-gray-800 no-print">
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2024 <a href={"mailto:" + settings.email} className="hover:underline">{settings.companyName}</a>.
                </span>
                <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
                    <li>
                        <StyledSelect value={i18n.language} options={[
                            {
                                name: 'Magyar',
                                value: 'hu'
                            },
                            {
                                name: 'Angol',
                                value: 'en'
                            }
                        ]} onSelect={(e: SyntheticEvent<HTMLSelectElement, Event> ) => i18n.changeLanguage(e.currentTarget.value)}
                        label={false}
                        />
                    </li>
                    <li className="ms-2">
                        <a
                            href="#"
                            className="hover:underline"
                            onClick={() => theme?.toggleTheme()}
                        >{(theme?.theme === 'dark' ? t('Light Mode') : t('Dark Mode'))}</a>

                    </li>
                </ul>
            </div>
        </footer>

    )
}
