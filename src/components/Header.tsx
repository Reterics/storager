import {NavLink, useLocation} from "react-router-dom";
import {AuthContext} from "../store/AuthContext.tsx";
import {useContext} from "react";
import {useThemeDetector} from "../utils/reactUtils.ts";
import {useTranslation} from "react-i18next";


const Header = () => {
    const pathname = useLocation().pathname;
    const  {SignOut, user} = useContext(AuthContext);
    const isDarkTheme = useThemeDetector();
    const { t } = useTranslation();

    return (
        <header>
            <nav className="w-full bg-white border-gray-200 dark:bg-gray-900">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="https://reterics.com/" className="flex items-center">
                        <img src={isDarkTheme ? "/logo_white.png" : "/logo.png"} width={30} height={32} className="h-8 mr-3" alt="Reterics Logo"/>
                        <div
                            className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white flex-row flex">Storage
                            <div className="text-sm pt-1 text">R</div></div>
                    </a>
                    <button data-collapse-toggle="navbar-default" type="button"
                            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                            aria-controls="navbar-default" aria-expanded="false">
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M1 1h15M1 7h15M1 13h15"/>
                        </svg>
                    </button>
                    <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                        <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                            <li>
                                <NavLink to='/'
                                         className={pathname === '/' ?
                                             "block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500" :
                                             "block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent"}
                                         aria-current="page">{t('Shops')}</NavLink>
                            </li>
                            <li>
                                <NavLink to='/items'
                                         className={pathname === '/items' ?
                                             "block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500" :
                                             "block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent"}
                                >{t('Items')}</NavLink>
                            </li>
                            <li>
                                <NavLink to='/parts'
                                         className={pathname === '/parts' ?
                                             "block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500" :
                                             "block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent"}
                                >{t('Parts')}</NavLink>
                            </li>
                            <li>
                                <NavLink to='/service'
                                         className={pathname === '/service' ?
                                             "block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500" :
                                             "block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent"}
                                >{t('Service')}</NavLink>
                            </li>
                            <li>
                                <NavLink to='/settings'
                                         className={pathname === '/settings' ?
                                             "block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500" :
                                             "block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent"}
                                >{t('Settings')}</NavLink>
                            </li>
                            <li className="font-normal">
                                {t('Welcome')} {user?.displayName || user?.email}
                                <button onClick={() => SignOut()} className="font-medium ml-3">{t('Logout')}</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

        </header>
    )
};

export default Header;
