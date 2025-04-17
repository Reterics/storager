import {useTranslation} from 'react-i18next';

export default function TermsOfUse() {
  const {t} = useTranslation('terms');
  const sectionTitle = 'text-lg font-semibold mt-6 mb-2';
  const listItem = 'ml-5 list-disc text-sm';

  const renderList = (key: string) => (
    <ul className='mb-2'>
      {(t(key, {returnObjects: true}) as string[]).map((item, i) => (
        <li className={listItem} key={i}>
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div className='text-left w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-6 py-8 rounded shadow max-w-5xl mx-auto text-sm'>
      <h1 className='text-2xl font-bold mb-6'>{t('title')}</h1>

      <h2 className={sectionTitle}>{t('general.title')}</h2>
      <p className='mb-1 font-medium'>{t('general.appName')}</p>
      <p className='mb-1'>{t('general.provider')}</p>
      <p className='mb-1'>{t('general.address')}</p>
      <p className='mb-1'>{t('general.tax')}</p>
      <p className='mb-1'>{t('general.reg')}</p>
      <p className='mb-1'>{t('general.email')}</p>
      <p className='mb-1'>{t('general.phone')}</p>

      <h2 className={sectionTitle}>{t('hosting.title')}</h2>
      <p className='mb-1 font-medium'>{t('hosting.provider')}</p>
      <p className='mb-1'>{t('hosting.hq')}</p>
      <p className='mb-1'>{t('hosting.branch')}</p>
      <p className='mb-1'>{t('hosting.tax')}</p>
      <p className='mb-1'>{t('hosting.vat')}</p>
      <p className='mb-1'>{t('hosting.reg')}</p>
      <p className='mb-1'>{t('hosting.account')}</p>
      <p className='mb-1'>{t('hosting.swift')}</p>
      <p className='mb-1'>{t('hosting.iban')}</p>
      <p className='mb-1'>{t('hosting.website')}</p>
      <p className='mb-1'>{t('hosting.email')}</p>
      <p className='mb-1'>{t('hosting.phone')}</p>

      <h2 className={sectionTitle}>{t('thirdparty.title')}</h2>
      <p className='mb-1'>{t('thirdparty.text1')}</p>
      <p className='mb-1'>
        {t('thirdparty.text2')}:{' '}
        <a href='https://firebase.google.com/terms'>
          https://firebase.google.com/terms
        </a>
      </p>

      <h2 className={sectionTitle}>{t('scope.title')}</h2>
      <p className='mb-1'>{t('scope.text1')}</p>
      <p className='mb-1'>{t('scope.text2')}</p>

      <h2 className={sectionTitle}>{t('liability.title')}</h2>
      {renderList('liability.items')}

      <h2 className={sectionTitle}>{t('user.title')}</h2>
      {renderList('user.items')}
      <p className='mb-1'>{t('user.text1')}</p>
      <p className='mb-1'>{t('user.text2')}</p>

      <h2 className={sectionTitle}>{t('data.title')}</h2>
      <p className='mb-1'>{t('data.text1')}</p>
      <p className='mb-1'>{t('data.text2')}</p>
      <p className='mb-1'>{t('data.text3')}</p>
      <p className='mb-1'>{t('data.text4')}</p>

      <h2 className={sectionTitle}>{t('rights.title')}</h2>
      {renderList('rights.items')}

      <h2 className={sectionTitle}>{t('dispute.title')}</h2>
      <p className='mb-1'>{t('dispute.text1')}</p>
      <p className='mb-1'>{t('dispute.text2')}</p>

      <h2 className={sectionTitle}>{t('custom.title')}</h2>
      <p className='mb-1'>{t('custom.text1')}</p>
      <p className='mb-1'>{t('custom.text2')}</p>
    </div>
  );
}
