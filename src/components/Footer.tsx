import StyledSelect from "./elements/StyledSelect.tsx";
import {useTranslation} from "react-i18next";
import {SyntheticEvent} from "react";

export const Footer = () => {
    const { t, i18n } = useTranslation();

    return (
        <footer className="bg-white rounded-lg shadow m-4 dark:bg-gray-800">
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2024 <a href="https://reterics.com/" className="hover:underline">Attila Reterics™</a>. {t('All Rights Reserved')}.
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
                    <li className="hidden">
                        <a href="#" className="hover:underline">{t('Contact')}</a>
                    </li>
                </ul>
            </div>
        </footer>

    )
}
