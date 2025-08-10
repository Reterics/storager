import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.svg';
import logoWhite from '../assets/logo_white.svg';
import { useTheme } from '../store/ThemeContext.tsx';

function About() {
  const isDarkTheme = useTheme()?.theme === 'dark';
  const { t } = useTranslation();

  return (
    <>
      <div className={'bg-white rounded-lg shadow m-4 dark:bg-gray-800 p-4'}>
        <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white flex-col">
          <img
            src={isDarkTheme ? logoWhite : logo}
            className="h-40 mr-2"
            alt="StorageR logo"
          />{' '}
          StorageR
        </div>
        <div
          className={
            'flex flex-row justify-between items-center w-fit m-auto mb-2'
          }
        >
          <div
            data-testid={'version'}
            className={
              'text-xl font-bold leading-none tracking-tight text-gray-900 md:text-3xl lg:text-2xl dark:text-white'
            }
          >
            {'v' + import.meta.env.PACKAGE_VERSION}
          </div>
          <div
            data-testid={'description'}
            className={
              'font-bold leading-none tracking-tight text-gray-900 md:text-2xl lg:text-xl dark:text-white ms-4'
            }
          >
            {t(import.meta.env.PACKAGE_DESCRIPTION)}
          </div>
        </div>
      </div>

      <div className={'flex-1'}></div>
    </>
  );
}

export default About;
