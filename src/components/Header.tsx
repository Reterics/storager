import {NavLink, useSearchParams} from 'react-router-dom';
import {AuthContext} from '../store/AuthContext.tsx';
import {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../store/ThemeContext.tsx';
import {ShopContext} from '../store/ShopContext.tsx';
import {DBContext} from '../database/DBContext.ts';
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
} from 'react-icons/bs';
import LoadingIcon from './elements/LoadingIcon.tsx';
import {flushSync} from 'react-dom';
import {firebaseModel, modules} from '../database/firebase/config.ts';

const Header = () => {
  const {SignOut} = useContext(AuthContext);
  const dbContext = useContext(DBContext);
  const isAdmin = dbContext?.data?.currentUser?.role === 'admin';
  const {shop} = useContext(ShopContext);
  const isDarkTheme = useTheme()?.theme === 'dark';
  const {t} = useTranslation();
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || 'shops';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false); // State for the navbar collapse

  const [isLoading, setIsLoading] = useState(false);

  const handleLinkClick = () => {
    setDropdownOpen(false); // Close dropdown when link is clicked
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
      <header className='no-print'>
        <nav className='w-full bg-white border-gray-200 dark:bg-gray-900'>
          <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4'>
            <a href='?page=about' className='flex items-center'>
              <img
                src={isDarkTheme ? logoWhite : logo}
                width={30}
                height={32}
                className='h-8 mr-3'
                alt='StorageR Logo'
              />
              <div className='self-center text-2xl font-semibold whitespace-nowrap dark:text-white flex-row flex'>
                Storage
                <div className='text-sm pt-1 text'>R</div>
              </div>
            </a>

            <LoadingIcon />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className='no-print'>
      <nav className='w-full bg-white border-gray-200 dark:bg-gray-900'>
        <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4'>
          <a href='?page=about' className='flex items-center'>
            <img
              src={isDarkTheme ? logoWhite : logo}
              width={30}
              height={32}
              className='h-8 mr-3'
              alt='StorageR Logo'
            />
            <div className='self-center text-2xl font-semibold whitespace-nowrap dark:text-white flex-row flex'>
              Storage
              <div className='text-sm pt-1 text'>R</div>
            </div>
          </a>
          <button
            onClick={() => setNavbarOpen(!navbarOpen)} // Toggle navbar open/close
            className='inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
            aria-controls='navbar-default'
            aria-expanded={navbarOpen}
          >
            <span className='sr-only'>Open main menu</span>
            <svg
              className='w-5 h-5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 17 14'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M1 1h15M1 7h15M1 13h15'
              />
            </svg>
          </button>
          <div
            className={`${navbarOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`}
            id='navbar-default'
            role='navigation'
          >
            <ul className='font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700'>
              <li>
                <NavLink
                  to='/?page='
                  onClick={handleLinkClick}
                  className={
                    page === 'shops'
                      ? 'block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500'
                      : 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent'
                  }
                  aria-current='page'
                >
                  {t('Shops')}
                </NavLink>
              </li>
              {shop && (
                <li>
                  <NavLink
                    to='/?page=items'
                    onClick={handleLinkClick}
                    className={
                      page === 'items'
                        ? 'block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500'
                        : 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent'
                    }
                  >
                    {t('Items')}
                  </NavLink>
                </li>
              )}
              {shop && (
                <li>
                  <NavLink
                    to='/?page=parts'
                    onClick={handleLinkClick}
                    className={
                      page === 'parts'
                        ? 'block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500'
                        : 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent'
                    }
                  >
                    {t('Parts')}
                  </NavLink>
                </li>
              )}
              {shop && (
                <li>
                  <NavLink
                    to='/?page=service'
                    onClick={handleLinkClick}
                    className={
                      page === 'service'
                        ? 'block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500'
                        : 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent'
                    }
                  >
                    {t('Service')}
                  </NavLink>
                </li>
              )}
              {shop && modules.leasing && (
                <li>
                  <NavLink
                    to='/?page=leases'
                    onClick={handleLinkClick}
                    className={
                      page === 'leases'
                        ? 'block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500'
                        : 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent'
                    }
                  >
                    {t('Leases')}
                  </NavLink>
                </li>
              )}
              {shop && (
                <li>
                  <NavLink
                    to='/?page=invoices'
                    onClick={handleLinkClick}
                    className={
                      page === 'invoices'
                        ? 'block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500'
                        : 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent'
                    }
                  >
                    {t('Invoices')}
                  </NavLink>
                </li>
              )}
              {shop && modules.transactions && (
                <li>
                  <NavLink
                    to='/?page=transactions'
                    onClick={handleLinkClick}
                    className={
                      page === 'transactions'
                        ? 'block py-2 pl-3 pr-4 text-white bg-gray-900 rounded md:bg-transparent md:text-gray-700 md:p-0 dark:text-white md:dark:text-gray-500'
                        : 'block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent'
                    }
                  >
                    {t('Transactions')}
                  </NavLink>
                </li>
              )}

              <li className='relative'>
                <button
                  name='userMenuButton'
                  data-testid='userMenuButton'
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className='flex text-gray-900 hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-gray-900 md:p-0 dark:text-white md:dark:hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white md:dark:hover:bg-transparent'
                >
                  {shop?.name}
                  <svg
                    className='w-6 h-6 inline-block ml-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg dark:bg-gray-800 z-50'>
                    <ul className='py-1'>
                      {isAdmin && (
                        <li>
                          <NavLink
                            to='/?page=types'
                            onClick={handleLinkClick}
                            className='flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600'
                          >
                            <div className='text-xl me-2'>
                              <BsListUl />
                            </div>
                            {t('Types')}
                          </NavLink>
                        </li>
                      )}
                      {isAdmin && (
                        <li>
                          <NavLink
                            to='/?page=recycle'
                            onClick={handleLinkClick}
                            className='flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600'
                          >
                            <div className='text-xl me-2'>
                              <BsFillTrash3Fill />
                            </div>
                            {t('Recycle Bin')}
                          </NavLink>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={() => updatePageData()}
                          className='w-full flex text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600'
                        >
                          <div className='text-xl me-2'>
                            <BsArrowClockwise />
                          </div>
                          {t('Update')}
                        </button>
                      </li>
                      {isAdmin && (
                        <li>
                          <NavLink
                            to='/?page=settings'
                            onClick={handleLinkClick}
                            className='w-full flex text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600'
                          >
                            <div className='text-xl me-2'>
                              <BsFillGearFill />
                            </div>
                            {t('Settings')}
                          </NavLink>
                        </li>
                      )}
                      {isAdmin && firebaseModel.isLoggingActive() && (
                        <li>
                          <NavLink
                            to='/?page=logs'
                            onClick={handleLinkClick}
                            className='w-full flex text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600'
                          >
                            <div className='text-xl me-2'>
                              <BsCardList />
                            </div>
                            {t('Logs')}
                          </NavLink>
                        </li>
                      )}
                      {isAdmin && (
                        <li>
                          <NavLink
                            to='/?page=users'
                            onClick={handleLinkClick}
                            className='flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600'
                          >
                            <div className='text-xl me-2'>
                              <BsFillPersonLinesFill />
                            </div>
                            {t('Users')}
                          </NavLink>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={() => {
                            handleLinkClick();
                            SignOut();
                          }}
                          className='flex w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600'
                        >
                          <div className='text-xl me-2'>
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
        </div>
      </nav>
    </header>
  );
};

export default Header;
