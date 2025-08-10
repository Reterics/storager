import { NavLink, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../store/AuthContext.tsx';
import { useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext.tsx';
import { ShopContext } from '../store/ShopContext.tsx';
import { DBContext } from '../database/DBContext.ts';
import logo from '../assets/logo.svg';
import logoWhite from '../assets/logo_white.svg';
import {
  BsArrowClockwise,
  BsCardList,
  BsDoorOpen,
  BsFillGearFill,
  BsFillPersonLinesFill,
  BsFillTrash3Fill,
  BsListUl,
  BsShop,
  BsTools,
  BsWrench,
  BsCreditCard,
  BsChevronDown,
  BsX,
  BsBoxes,
  BsReceipt,
  BsClipboardCheck,
  BsThreeDots,
} from 'react-icons/bs';
import LoadingIcon from './elements/LoadingIcon.tsx';
import PWAInstallButton from './elements/PWAInstallButton.tsx';
import { flushSync } from 'react-dom';
import { firebaseModel } from '../database/firebase/config.ts';

const navBase = 'flex items-center py-2 px-2 rounded mg:py-2 md:px-2.5';
const navActive = 'text-white bg-gray-700 md:bg-zinc-700 dark:bg-gray-700';
const navInactive =
  'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700';

const Header = () => {
  const { SignOut } = useContext(AuthContext);
  const dbContext = useContext(DBContext);
  const isAdmin = dbContext?.data?.currentUser?.role === 'admin';
  const { shop } = useContext(ShopContext);
  const isDarkTheme = useTheme()?.theme === 'dark';
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || 'shops';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false); // State for the navbar collapse
  const [isLoading, setIsLoading] = useState(false);

  const navbarRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown and navbar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarOpen &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        setNavbarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navbarOpen]);

  const handleLinkClick = () => {
    setDropdownOpen(false);
    setNavbarOpen(false); // Close both dropdown and navbar when link is clicked
  };

  const updatePageData = async () => {
    setDropdownOpen(false);
    flushSync(() => {
      setIsLoading(true);
    });

    switch (page) {
      case 'items':
        await dbContext?.refreshData('items');
        await dbContext?.refreshData('users');
        break;
      case 'parts':
        await dbContext?.refreshData('parts');
        await dbContext?.refreshData('users');
        break;
      case 'service':
      case 'recycle':
        firebaseModel.invalidateCache('deleted');
        firebaseModel.invalidateCache('archive');
        firebaseModel.invalidateCache('services');
        firebaseModel.invalidateCache('leaseCompletions');
        firebaseModel.invalidateCache('completions');
        await dbContext?.refreshData('users');
        break;
      case 'settings':
        await dbContext?.refreshData('settings');
        break;
      case 'users':
        await dbContext?.refreshData('users');
        break;
      case 'types':
        await dbContext?.refreshData('types');
        break;
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <header className="no-print">
        <nav className="w-full bg-white border-gray-200 dark:bg-gray-900">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="?page=about" className="flex items-center">
              <img
                src={isDarkTheme ? logoWhite : logo}
                width={30}
                height={32}
                className="h-8 mr-3"
                alt="StorageR Logo"
              />
              <div className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white flex-row flex">
                Storage
                <div className="text-sm pt-1 text">R</div>
              </div>
            </a>

            <LoadingIcon />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="no-print">
      <nav className="w-full bg-white border-gray-200 dark:bg-gray-900 shadow-sm">
        <div className="max-w-screen-xl flex items-center justify-between mx-auto p-2 md:p-4">
          <a href="?page=about" className="flex items-center">
            <img
              src={isDarkTheme ? logoWhite : logo}
              width={28}
              height={30}
              className="h-7 md:h-8 mr-2 md:mr-3"
              alt="StorageR Logo"
            />
            <div className="self-center text-xl md:text-2xl font-semibold whitespace-nowrap dark:text-white flex-row flex">
              Storage
              <div className="text-xs md:text-sm pt-1 text">R</div>
            </div>
          </a>

          <div className="hidden md:flex md:items-center">
            <ul className="font-medium flex flex-row space-x-1 lg:space-x-4 items-center">
              <li>
                <NavLink
                  to="/?page="
                  onClick={handleLinkClick}
                  className={`${navBase} ${page === 'shops' ? navActive : navInactive}`}
                  aria-current="page"
                >
                  <BsShop className="text-lg" />
                  <span className="hidden ml-1 lg:inline">{t('Shops')}</span>
                </NavLink>
              </li>
              {shop && (
                <li>
                  <NavLink
                    to="/?page=items"
                    onClick={handleLinkClick}
                    className={`${navBase} ${page === 'items' ? navActive : navInactive}`}
                    title={t('Items')}
                  >
                    <BsBoxes className="text-lg" />
                    <span className="hidden ml-1 lg:inline">{t('Items')}</span>
                  </NavLink>
                </li>
              )}
              {shop && (
                <li>
                  <NavLink
                    to="/?page=parts"
                    onClick={handleLinkClick}
                    className={`${navBase} ${page === 'parts' ? navActive : navInactive}`}
                    title={t('Parts')}
                  >
                    <BsTools className="text-lg" />
                    <span className="hidden ml-1 lg:inline">{t('Parts')}</span>
                  </NavLink>
                </li>
              )}
              {shop && (
                <li>
                  <NavLink
                    to="/?page=service"
                    onClick={handleLinkClick}
                    className={`${navBase} ${page === 'service' ? navActive : navInactive}`}
                    title={t('Service')}
                  >
                    <BsWrench className="text-lg" />
                    <span className="hidden ml-1 lg:inline">
                      {t('Service')}
                    </span>
                  </NavLink>
                </li>
              )}
              {shop && dbContext?.data.settings?.enableLeasing && (
                <li>
                  <NavLink
                    to="/?page=leases"
                    onClick={handleLinkClick}
                    className={`${navBase} ${page === 'leases' ? navActive : navInactive}`}
                    title={t('Leases')}
                  >
                    <BsClipboardCheck className="text-lg" />
                    <span className="hidden ml-1 lg:inline">{t('Leases')}</span>
                  </NavLink>
                </li>
              )}
              {shop && (
                <li>
                  <NavLink
                    to="/?page=invoices"
                    onClick={handleLinkClick}
                    className={`${navBase} ${page === 'invoices' ? navActive : navInactive}`}
                    title={t('Invoices')}
                  >
                    <BsReceipt className="text-lg" />
                    <span className="hidden ml-1 lg:inline">
                      {t('Invoices')}
                    </span>
                  </NavLink>
                </li>
              )}
              {shop && dbContext?.data.settings?.enableTransactions && (
                <li>
                  <NavLink
                    to="/?page=transactions"
                    onClick={handleLinkClick}
                    className={`${navBase} ${page === 'transactions' ? navActive : navInactive}`}
                    title={t('Transactions')}
                  >
                    <BsCreditCard className="text-lg" />
                    <span className="hidden ml-1 lg:inline">
                      {t('Transactions')}
                    </span>
                  </NavLink>
                </li>
              )}

              <li className="relative ml-1">
                <button
                  name="userMenuButton"
                  data-testid="userMenuButton"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center py-1 px-2 text-gray-900 rounded hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  title={shop?.name}
                >
                  <span className="hidden md:inline mr-1 max-w-[100px] lg:max-w-[200px] truncate">
                    {shop?.name}
                  </span>
                  <BsChevronDown className="text-sm" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg dark:bg-gray-800 z-50">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {shop?.name}
                      </div>
                    </div>
                    <ul className="py-1">
                      {isAdmin && (
                        <>
                          <li className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 uppercase">
                            {t('Admin')}
                          </li>
                          <li>
                            <NavLink
                              to="/?page=types"
                              onClick={handleLinkClick}
                              className="flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              <div className="text-lg me-2">
                                <BsListUl />
                              </div>
                              {t('Types')}
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/?page=recycle"
                              onClick={handleLinkClick}
                              className="flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              <div className="text-lg me-2">
                                <BsFillTrash3Fill />
                              </div>
                              {t('Recycle Bin')}
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/?page=settings"
                              onClick={handleLinkClick}
                              className="w-full flex text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              <div className="text-lg me-2">
                                <BsFillGearFill />
                              </div>
                              {t('Settings')}
                            </NavLink>
                          </li>
                          {firebaseModel.isLoggingActive() &&
                            dbContext?.data.settings?.enableLogs && (
                              <li>
                                <NavLink
                                  to="/?page=logs"
                                  onClick={handleLinkClick}
                                  className="w-full flex text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                  <div className="text-lg me-2">
                                    <BsCardList />
                                  </div>
                                  {t('Logs')}
                                </NavLink>
                              </li>
                            )}
                          <li>
                            <NavLink
                              to="/?page=users"
                              onClick={handleLinkClick}
                              className="flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              <div className="text-lg me-2">
                                <BsFillPersonLinesFill />
                              </div>
                              {t('Users')}
                            </NavLink>
                          </li>
                          <li className="border-t border-gray-200 dark:border-gray-700 mt-1"></li>
                        </>
                      )}
                      <li>
                        <button
                          onClick={() => updatePageData()}
                          className="w-full flex text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          <div className="text-lg me-2">
                            <BsArrowClockwise />
                          </div>
                          {t('Update')}
                        </button>
                      </li>
                      <li>
                        <PWAInstallButton
                          className="w-full flex text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                          label={t('Install App')}
                          onInstalled={() => setDropdownOpen(false)}
                        />
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            handleLinkClick();
                            SignOut();
                          }}
                          className="flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          <div className="text-lg me-2">
                            <BsDoorOpen />
                          </div>
                          {t('Logout')}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            </ul>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="inline-flex items-center p-1 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-mobile"
              aria-expanded={navbarOpen}
            >
              <span className="sr-only">Open main menu</span>
              {navbarOpen ? (
                <BsX className="w-6 h-6" />
              ) : (
                <BsThreeDots className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {navbarOpen && (
          <div
            ref={navbarRef}
            className="md:hidden fixed inset-0 z-40 bg-gray-900 bg-opacity-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setNavbarOpen(false);
            }}
          >
            <div
              style={{
                zIndex: '1001',
              }}
              className="fixed inset-y-0 z-50 right-0 max-w-[280px] w-full bg-white dark:bg-gray-800 shadow-xl transform transition-transform ease-in-out duration-300"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {shop?.name || t('Menu')}
                </div>
                <button
                  onClick={() => setNavbarOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  <BsX className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto h-full pb-20">
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-2">
                    <NavLink
                      to="/?page="
                      onClick={handleLinkClick}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                        page === 'shops'
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <BsShop className="text-xl mb-1" />
                      <span className="text-xs">{t('Shops')}</span>
                    </NavLink>

                    {shop && (
                      <NavLink
                        to="/?page=items"
                        onClick={handleLinkClick}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          page === 'items'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <BsBoxes className="text-xl mb-1" />
                        <span className="text-xs">{t('Items')}</span>
                      </NavLink>
                    )}

                    {shop && (
                      <NavLink
                        to="/?page=parts"
                        onClick={handleLinkClick}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          page === 'parts'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <BsTools className="text-xl mb-1" />
                        <span className="text-xs">{t('Parts')}</span>
                      </NavLink>
                    )}

                    {shop && (
                      <NavLink
                        to="/?page=service"
                        onClick={handleLinkClick}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          page === 'service'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <BsWrench className="text-xl mb-1" />
                        <span className="text-xs">{t('Service')}</span>
                      </NavLink>
                    )}

                    {shop && dbContext?.data.settings?.enableLeasing && (
                      <NavLink
                        to="/?page=leases"
                        onClick={handleLinkClick}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          page === 'leases'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <BsClipboardCheck className="text-xl mb-1" />
                        <span className="text-xs">{t('Leases')}</span>
                      </NavLink>
                    )}

                    {shop && (
                      <NavLink
                        to="/?page=invoices"
                        onClick={handleLinkClick}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          page === 'invoices'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <BsReceipt className="text-xl mb-1" />
                        <span className="text-xs">{t('Invoices')}</span>
                      </NavLink>
                    )}

                    {shop && dbContext?.data.settings?.enableTransactions && (
                      <NavLink
                        to="/?page=transactions"
                        onClick={handleLinkClick}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          page === 'transactions'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <BsCreditCard className="text-xl mb-1" />
                        <span className="text-xs">{t('Transactions')}</span>
                      </NavLink>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {t('Admin')}
                    </div>
                    <ul>
                      <li>
                        <NavLink
                          to="/?page=types"
                          onClick={handleLinkClick}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <BsListUl className="mr-3 text-lg" />
                          {t('Types')}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/?page=recycle"
                          onClick={handleLinkClick}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <BsFillTrash3Fill className="mr-3 text-lg" />
                          {t('Recycle Bin')}
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/?page=settings"
                          onClick={handleLinkClick}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <BsFillGearFill className="mr-3 text-lg" />
                          {t('Settings')}
                        </NavLink>
                      </li>
                      {firebaseModel.isLoggingActive() &&
                        dbContext?.data.settings?.enableLogs && (
                          <li>
                            <NavLink
                              to="/?page=logs"
                              onClick={handleLinkClick}
                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              <BsCardList className="mr-3 text-lg" />
                              {t('Logs')}
                            </NavLink>
                          </li>
                        )}
                      <li>
                        <NavLink
                          to="/?page=users"
                          onClick={handleLinkClick}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <BsFillPersonLinesFill className="mr-3 text-lg" />
                          {t('Users')}
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
                  <ul>
                    <li>
                      <button
                        onClick={() => updatePageData()}
                        className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <BsArrowClockwise className="mr-3 text-lg" />
                        {t('Update')}
                      </button>
                    </li>
                    <li>
                      <PWAInstallButton
                        className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                        label={t('Install App')}
                        onInstalled={() => setNavbarOpen(false)}
                      />
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          handleLinkClick();
                          SignOut();
                        }}
                        className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <BsDoorOpen className="mr-3 text-lg" />
                        {t('Logout')}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
