import {FormEvent, useContext, useEffect, useRef, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {useTranslation} from 'react-i18next';
import StyledInput from '../components/elements/StyledInput.tsx';
import FormRow from '../components/elements/FormRow.tsx';
import {SettingsItems} from '../interfaces/interfaces.ts';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import BackupDBModel, {BackupData} from '../database/backup/BackupDBModel.ts';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import {downloadAsFile} from '../utils/general.ts';
import {PageHead} from '../components/elements/PageHead.tsx';
import {BsFillPlusCircleFill} from 'react-icons/bs';
import {CommonCollectionData} from '../interfaces/firebase.ts';

function Service() {
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      <div
        className='mt-4 flex flex-row text-sm text-left text-gray-500 dark:text-gray-400 max-w-screen-xl w-full shadow-md self-center
                 bg-white rounded dark:bg-gray-900 p-4'
      >
        <form onSubmit={handleSubmit} className='w-full'>
          <h2 className='text-2xl font-bold mb-4'>{t('Company Details')}</h2>

          <FormRow>
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
          </FormRow>
          <FormRow>
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
          </FormRow>
          <FormRow>
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
          </FormRow>

          <FormRow>
            <StyledInput
              type='textarea'
              name='serviceAgreement'
              value={settingsItems.serviceAgreement}
              onChange={(e) => changeType(e)}
              label={t('Service Agreement')}
            />
          </FormRow>

          <FormRow>
            <StyledInput
              type='textarea'
              name='rentalConditions'
              value={settingsItems.rentalConditions}
              onChange={(e) => changeType(e)}
              label={t('Rental Conditions')}
            />
          </FormRow>

          <div className='mt-8'>
            {shouldSave && (
              <button
                type='submit'
                className='px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700'
              >
                {t('Save Settings')}
              </button>
            )}
          </div>
        </form>
      </div>
      {dbContext?.data.currentUser.role === 'admin' && (
        <div className='w-full place-content-center flex flex-row'>
          <div className='max-w-screen-xl w-full place-items-center flex flex-row bg-white dark:bg-gray-900 shadow-md mt-4'>
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

export default Service;
