import {useTheme} from "../store/ThemeContext.tsx";
import {useTranslation} from "react-i18next";
import logoWhite from "../assets/logo_white.svg";
import logo from "../assets/logo.svg";
import {NavLink} from "react-router-dom";
import {useState} from "react";


const UserHeader = () => {
    const isDarkTheme = useTheme()?.theme === 'dark';
    const [navbarOpen, setNavbarOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <header className="no-print">
            <nav className="w-full bg-white border-gray-200 dark:bg-gray-900">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="?page=about" className="flex items-center">
                        <img src={isDarkTheme ? logoWhite : logo} width={30} height={32} className="h-8 mr-3" alt="StorageR Logo"/>
                        <div
                            className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white flex-row flex">Storage
                            <div className="text-sm pt-1 text">R</div></div>
                    </a>
                    <button
                        onClick={() => setNavbarOpen(!navbarOpen)} // Toggle navbar open/close
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        aria-controls="navbar-default"
                        aria-expanded={navbarOpen}
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M1 1h15M1 7h15M1 13h15"/>
                        </svg>
                    </button>
                    <div className={`${navbarOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default" role="navigation">
                        <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                            <li>
                                <NavLink to='/?page='
                                         className={"block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent" }
                                         aria-current="page">{t('Login')}</NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

        </header>
    )
}

export default UserHeader;