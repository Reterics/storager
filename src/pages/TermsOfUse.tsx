import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { DBContext } from '../database/DBContext.ts';
import { hostingDefaults } from '../constants/hosting.ts';

export default function TermsOfUse() {
  const { t } = useTranslation('terms');
  const dbContext = useContext(DBContext);
  const providerCompany = dbContext?.data?.settings?.companyName ?? '';
  const address = dbContext?.data?.settings?.address ?? '';
  const tax = dbContext?.data?.settings?.taxId ?? '';
  const reg = dbContext?.data?.settings?.registrationNumber ?? '';
  const phone = dbContext?.data?.settings?.phone ?? '';
  const email = dbContext?.data?.settings?.email ?? '';
  const sectionTitle = 'text-lg font-semibold mt-6 mb-2';
  const listItem = 'ml-5 list-disc text-sm';

  const renderList = (key: string) => (
    <ul className="mb-2">
      {(t(key, { returnObjects: true }) as string[]).map((item, i) => (
        <li className={listItem} key={i}>
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="text-left w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-6 py-8 rounded shadow max-w-5xl mx-auto text-sm">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      <h2 className={sectionTitle}>{t('general.title')}</h2>
      <p className="mb-1 font-medium">{t('general.appName')}</p>
      <p className="mb-1">
        {t('general.provider', { provider: providerCompany })}
      </p>
      <p className="mb-1">{t('general.address', { address })}</p>
      <p className="mb-1">{t('general.tax', { tax })}</p>
      <p className="mb-1">{t('general.reg', { reg })}</p>
      <p className="mb-1">{t('general.email', { email })}</p>
      <p className="mb-1">{t('general.phone', { phone })}</p>

      <h2 className={sectionTitle}>{t('hosting.title')}</h2>
      <p className="mb-1 font-medium">{dbContext?.data?.settings?.hostingProvider || hostingDefaults.provider}</p>
      <p className="mb-1">{t('hosting.hqLabel')}: {dbContext?.data?.settings?.hostingHq || hostingDefaults.hq}</p>
      <p className="mb-1">{t('hosting.branchLabel')}: {dbContext?.data?.settings?.hostingBranch || hostingDefaults.branch}</p>
      <p className="mb-1">{t('hosting.taxLabel')}: {dbContext?.data?.settings?.hostingTax || hostingDefaults.tax}</p>
      <p className="mb-1">{t('hosting.vatLabel')}: {dbContext?.data?.settings?.hostingVat || hostingDefaults.vat}</p>
      <p className="mb-1">{t('hosting.regLabel')}: {dbContext?.data?.settings?.hostingReg || hostingDefaults.reg}</p>
      <p className="mb-1">{t('hosting.accountLabel')}: {dbContext?.data?.settings?.hostingAccount || hostingDefaults.account}</p>
      <p className="mb-1">{t('hosting.swiftLabel')}: {dbContext?.data?.settings?.hostingSwift || hostingDefaults.swift}</p>
      <p className="mb-1">{t('hosting.ibanLabel')}: {dbContext?.data?.settings?.hostingIban || hostingDefaults.iban}</p>
      <p className="mb-1">{t('hosting.websiteLabel')}: {dbContext?.data?.settings?.hostingWebsite || hostingDefaults.website}</p>
      <p className="mb-1">{t('hosting.emailLabel')}: {dbContext?.data?.settings?.hostingEmail || hostingDefaults.email}</p>
      <p className="mb-1">{t('hosting.phoneLabel')}: {dbContext?.data?.settings?.hostingPhone || hostingDefaults.phone}</p>

      <h2 className={sectionTitle}>{t('thirdparty.title')}</h2>
      <p className="mb-1">{t('thirdparty.text1')}</p>
      <p className="mb-1">
        {t('thirdparty.text2')}:{' '}
        <a href="https://firebase.google.com/terms">
          https://firebase.google.com/terms
        </a>
      </p>

      <h2 className={sectionTitle}>{t('scope.title')}</h2>
      <p className="mb-1">{t('scope.text1')}</p>
      <p className="mb-1">{t('scope.text2')}</p>

      <h2 className={sectionTitle}>{t('liability.title')}</h2>
      {renderList('liability.items')}

      <h2 className={sectionTitle}>{t('user.title')}</h2>
      {renderList('user.items')}
      <p className="mb-1">{t('user.text1')}</p>
      <p className="mb-1">{t('user.text2')}</p>

      <h2 className={sectionTitle}>{t('data.title')}</h2>
      <p className="mb-1">{t('data.text1')}</p>
      <p className="mb-1">{t('data.text2')}</p>
      <p className="mb-1">{t('data.text3')}</p>
      <p className="mb-1">{t('data.text4')}</p>

      <h2 className={sectionTitle}>{t('system.title')}</h2>
      <h3 className="font-medium mt-2 mb-1">{t('system.browser.title')}</h3>
      {renderList('system.browser.items')}
      <h3 className="font-medium mt-2 mb-1">{t('system.tablet.title')}</h3>
      {renderList('system.tablet.items')}
      <h3 className="font-medium mt-2 mb-1">{t('system.device.title')}</h3>
      <p className="mb-1">{t('system.device.text')}</p>

      <h2 className={sectionTitle}>{t('rights.title')}</h2>
      {renderList('rights.items')}

      <h2 className={sectionTitle}>{t('dispute.title')}</h2>
      <p className="mb-1">{t('dispute.text1')}</p>
      <p className="mb-1">{t('dispute.text2')}</p>

      <h2 className={sectionTitle}>{t('custom.title')}</h2>
      <p className="mb-1">{t('custom.text1')}</p>
      <p className="mb-1">{t('custom.text2')}</p>
    </div>
  );
}
