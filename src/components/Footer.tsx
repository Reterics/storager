import StyledSelect from "./elements/StyledSelect.tsx";
import {useTranslation} from "react-i18next";
import {SyntheticEvent, useEffect, useState} from "react";

export const Footer = () => {
    const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const { t, i18n } = useTranslation();

    // Toggle dark mode class on the <html> or <body> tag
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

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
                    <li className="">
                        <a
                            href="#"
                            className="hover:underline"
                            onClick={() => setDarkMode(!darkMode)}
                        >{(darkMode ? t('Light Mode') : t('Dark Mode'))}</a>

                    </li>
                </ul>
            </div>
        </footer>

    )
}
