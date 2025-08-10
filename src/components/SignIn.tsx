import logo from '../assets/logo.svg';
import { useContext, useState } from 'react';
import { AuthContext } from '../store/AuthContext.tsx';
import '../pages/Shops.css';
import AlertBox from './AlertBox.tsx';
import { useTranslation } from 'react-i18next';

const SignInComponent = () => {
  const { SignIn, loading, error } = useContext(AuthContext);
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full max-w-md">
        <a
          href="?page=about"
          className="flex flex-col items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img src={logo} className="h-40" alt="Reterics logo" />
          StorageR
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700 p-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-4">
            {t('Sign in to your account')}
          </h1>
          {error && <AlertBox title={'Error'} message={error} role="alert" />}

          {loading ? (
            <div role="status" className="text-center">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539..."
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">{t('Loading')}...</span>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                SignIn({ email, password });
              }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {t('Your email')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="name@integrint.hu"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  {t('Password')}
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                {t('Sign in')}
              </button>
            </form>
          )}
          <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-4">
            {t('By signing in, you agree to our')}
            <a
              href="?page=terms"
              className="font-medium text-primary-600 hover:underline dark:text-primary-500 ml-1"
            >
              {t('Terms and Conditions')}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignInComponent;
