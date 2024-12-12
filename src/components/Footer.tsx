import {useTranslation} from "react-i18next";
import {useContext} from "react";
import {useTheme} from "../store/ThemeContext.tsx";
import {DBContext} from "../database/DBContext.ts";
import {useSearchParams} from "react-router-dom";

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
    const [searchParams] = useSearchParams();
    const page = searchParams.get('page');


    return (
        <footer className="bg-white rounded-lg shadow m-4 dark:bg-gray-800 no-print">
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2024 <a href={"mailto:" + settings.email} className="hover:underline">{settings.companyName}</a>.
                </span>
                <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
                    {page === 'service' && <li className="ms-1">
                        <a href="?page=diag">{t('Diagnostic')}</a>
                    </li>}
                    <li className="ms-1">
                        {page === 'service' && ' | '}
                        <a
                            href="#"
                            className="hover:underline"
                            onClick={() => i18n.changeLanguage(i18n.language === 'hu' ? 'en' : 'hu')}
                        >{(i18n.language === 'hu' ? t('English language') : t('Hungarian language'))}</a>
                    </li>
                    <li className="ms-1">
                        | <a
                            href="#"
                            className="hover:underline"
                            onClick={() => theme?.toggleTheme()}
                        >{(theme?.theme === 'dark' ? t('Light Mode') : t('Dark Mode'))}</a>
                    </li>
                    <li className="ms-1">
                        | <a href="?page=about">StorageR v{import.meta.env.PACKAGE_VERSION}</a>
                    </li>
                </ul>
            </div>
        </footer>

    )
}
