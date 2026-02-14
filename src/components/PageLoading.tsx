import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.svg';

export interface LoadingProgress {
  current: number;
  total: number;
  label: string;
}

const PageLoading = ({ progress }: { progress?: LoadingProgress }) => {
  const { t } = useTranslation();
  const percent = progress ? Math.round((progress.current / progress.total) * 100) : 0;

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

        <div className="w-64">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="font-normal text-sm mt-2 text-center text-gray-600 dark:text-gray-400">
            {progress ? t(progress.label) : t('Loading')}...
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoading;
