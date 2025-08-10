import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.svg';
import LoadingIcon from './elements/LoadingIcon.tsx';

const PageLoading = () => {
  const { t } = useTranslation();

  return (
    <div className="page-loading fixed top-0 h-svh w-full bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center z-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 mb-8">
        <a
          href="?page=about"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white flex-col"
        >
          <img src={logo} className="h-40 mr-2" alt="Reterics logo" />
          StorageR
        </a>

        <LoadingIcon />
        <div className={'font-normal text-xl mt-2'}>{t('Loading')}...</div>
      </div>
    </div>
  );
};

export default PageLoading;
