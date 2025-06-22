import {useContext, useEffect, useRef, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {useTranslation} from 'react-i18next';
import StyledInput from '../components/elements/StyledInput.tsx';
import {SettingsItems} from '../interfaces/interfaces.ts';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import BackupDBModel, {BackupData} from '../database/backup/BackupDBModel.ts';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import {downloadAsFile} from '../utils/general.ts';
import {PageHead} from '../components/elements/PageHead.tsx';
import {
  BsFillPlusCircleFill,
  BsGear,
  BsBuilding,
  BsFillFloppy2Fill,
} from 'react-icons/bs';
import {CommonCollectionData} from '../interfaces/firebase.ts';
import StyledToggle from '../components/elements/StyledToggle.tsx';
import {modules} from '../database/firebase/config.ts';

function Settings() {
  const dbContext = useContext(DBContext);
  const {t} = useTranslation();

  const initialSettings = dbContext?.data.settings || {
    id: '',
    companyName: '',
    address: '',
    taxId: '',
    bankAccount: '',
    phone: '',
    email: '',
    smtpServer: '',
    port: '',
    username: '',
    password: '',
    useSSL: false,

    serviceAgreement: '',
    rentalConditions: '',

    enableLogs: false,
    enableTransactions: false,
    enableLeasing: false,
    enableInvoiceNotes: false,
    enableExtendedInvoices: false,
  };

  const [shouldSave, setShouldSave] = useState(false);
  const [settingsItems, setSettingsItems] =
    useState<SettingsItems>(initialSettings);

  const [localBackups, setLocalBackups] = useState<BackupData[]>([]);
  const backupDB = useRef(new BackupDBModel());

  const changeType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value, type, checked} = e.target;
    setSettingsItems((prevDetails) => ({
      ...prevDetails,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setShouldSave(true);
  };

  const saveFirebaseSettings = async () => {
    await dbContext?.setData('settings', settingsItems);
    setShouldSave(false);
  };

  const handleSubmit = (e?: React.MouseEvent) => {
    e?.preventDefault();

    void saveFirebaseSettings();
  };

  const tableLines = localBackups.map((item) => {
    const stats = [
      t('Shops') + ': ' + (item?.shops as CommonCollectionData[]).length,
      t('Items') + ': ' + (item?.items as CommonCollectionData[]).length,
      t('Parts') + ': ' + (item?.parts as CommonCollectionData[]).length,
      t('services') + ': ' + (item?.services as CommonCollectionData[]).length,
    ].join(', ');

    return [
      item.id,
      new Date(item.updated).toLocaleString(),
      stats,
      TableViewActions({
        onSave: () => {
          downloadAsFile('backup_' + item.id + '.json', JSON.stringify(item));
        },
        onRemove: () => {
          if (window.confirm(t('Are you sure you wish to delete this Item?'))) {
            backupDB.current.remove(item.id).then((backups) => {
              setLocalBackups([...backups]);
            });
          }
        },
      }),
    ];
  });

  useEffect(() => {
    if (backupDB.current) {
      backupDB.current.loadPersisted().then(() => {
        setLocalBackups(backupDB.current.getAll());
      });
    }
  }, []);

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

  return (
    <>
      <PageHead
        title={t('Settings')}
        buttons={
          shouldSave
            ? [
                {
                  value: (
                    <div className='flex items-center gap-1'>
                      <BsFillFloppy2Fill /> {t('Save Settings')}
                    </div>
                  ),
                  onClick: handleSubmit,
                },
              ]
            : undefined
        }
      />

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-screen-xl w-full self-center justify-center'>
        <div className='md:col-span-2 bg-white dark:bg-gray-900 rounded-lg shadow-md p-6'>
          <div className='flex items-center mb-4'>
            <BsBuilding className='text-gray-700 dark:text-gray-300 mr-2 text-xl' />
            <h2 className='text-xl font-semibold text-gray-800 dark:text-white'>
              {t('Company Details')}
            </h2>
          </div>

          <form className='w-full'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              <StyledInput
                type='text'
                name='companyName'
                value={settingsItems.companyName}
                onChange={changeType}
                label={t('Company Name')}
              />
              <StyledInput
                type='text'
                name='address'
                value={settingsItems.address}
                onChange={changeType}
                label={t('Address')}
              />
              <StyledInput
                type='text'
                name='taxId'
                value={settingsItems.taxId}
                onChange={changeType}
                label={t('Tax ID')}
              />
              <StyledInput
                type='text'
                name='bankAccount'
                value={settingsItems.bankAccount}
                onChange={changeType}
                label={t('Bank Account Number')}
              />
              <StyledInput
                type='text'
                name='phone'
                value={settingsItems.phone}
                onChange={changeType}
                label={t('Phone')}
              />
              <StyledInput
                type='text'
                name='email'
                value={settingsItems.email}
                onChange={changeType}
                label={t('Email')}
              />
            </div>

            <div className='mb-6'>
              <StyledInput
                type='textarea'
                name='serviceAgreement'
                value={settingsItems.serviceAgreement}
                onChange={(e) => changeType(e)}
                label={t('Service Agreement')}
              />
            </div>

            <div className='mb-6'>
              <StyledInput
                type='textarea'
                name='rentalConditions'
                value={settingsItems.rentalConditions}
                onChange={(e) => changeType(e)}
                label={t('Rental Conditions')}
              />
            </div>
          </form>
        </div>

        {dbContext?.data.currentUser.role === 'admin' && (
          <div className='bg-white dark:bg-gray-900 rounded-lg shadow-md p-6'>
            <div className='flex items-center mb-4'>
              <BsGear className='text-gray-700 dark:text-gray-300 mr-2 text-xl' />
              <h2 className='text-xl font-semibold text-gray-800 dark:text-white'>
                {t('Feature Settings')}
              </h2>
            </div>

            <div className='space-y-4'>
              <StyledToggle
                label={t('Enable Logs')}
                name='enableLogs'
                checked={!!settingsItems.enableLogs}
                onChange={(e) => modules.logs && changeType(e)}
                description={t('Logs tracking for system activities')}
              />

              <StyledToggle
                label={t('Enable Transactions')}
                name='enableTransactions'
                checked={!!settingsItems.enableTransactions}
                onChange={(e) => modules.transactions && changeType(e)}
                description={t(
                  'Transaction management for financial operations'
                )}
              />

              <StyledToggle
                label={t('Enable Leasing')}
                name='enableLeasing'
                checked={!!settingsItems.enableLeasing}
                onChange={(e) => modules.leasing && changeType(e)}
                description={t('Leasing functionality for rental operations')}
              />

              <StyledToggle
                label={t('Enable Invoice Notes')}
                name='enableInvoiceNotes'
                checked={!!settingsItems.enableInvoiceNotes}
                onChange={changeType}
                description={t('Simple invoices as form of notes')}
              />

              <StyledToggle
                label={t('Enable Extended Invoices')}
                name='enableExtendedInvoices'
                checked={!!settingsItems.enableExtendedInvoices}
                onChange={(e) => modules.advancedInvoices && changeType(e)}
                description={t(
                  'Enhanced invoice functionality with additional fields'
                )}
              />
            </div>
          </div>
        )}
      </div>
      {dbContext?.data.currentUser.role === 'admin' && (
        <div className='w-full place-content-center flex flex-row'>
          <div className='max-w-screen-xl w-full place-items-center flex flex-row mt-4'>
            <PageHead
              title={t('Local Backup')}
              buttons={[
                {
                  value: <BsFillPlusCircleFill />,
                  onClick: () => {
                    if (
                      window.confirm(t('Are you sure to create a new backup?'))
                    ) {
                      backupDB.current.add().then((backups) => {
                        setLocalBackups([...backups]);
                      });
                    }
                  },
                },
              ]}
            />
          </div>
        </div>
      )}
      {dbContext?.data.currentUser.role === 'admin' && (
        <div
          className='flex flex-row text-sm text-left text-gray-500 dark:text-gray-400 max-w-screen-xl w-full shadow-md self-center
                 bg-white rounded-b dark:bg-gray-900 p-4'
        >
          <TableViewComponent
            header={['ID', t('Date'), t('Stats'), t('Actions')]}
            lines={tableLines}
          />
        </div>
      )}
    </>
  );
}

export default Settings;
