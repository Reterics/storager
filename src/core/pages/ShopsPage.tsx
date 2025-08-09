import {useContext, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {DBContext} from '../../database/DBContext.ts';
import FirebaseCrudManager, {CrudField} from '../components/FirebaseCrudManager.tsx';
import {StyledSelectOption} from '../../interfaces/interfaces';

export default function ShopsPage() {
  const {t, i18n} = useTranslation();
  const dbContext = useContext(DBContext);

  // Shop type options from types collection if available
  const typeOptions: StyledSelectOption[] = useMemo(
    () => dbContext?.getType('service', i18n.language as 'hu' | 'en') || [],
    [dbContext, i18n.language]
  );

  // Currency options (basic set; could be extended from settings)
  const currencyOptions: StyledSelectOption[] = useMemo(
    () => [
      {name: 'HUF', value: 'HUF'},
      {name: 'EUR', value: 'EUR'},
      {name: 'USD', value: 'USD'},
    ],
    []
  );

  const fields: CrudField[] = useMemo(
    () => [
      {key: 'image', label: t('Image'), type: 'image', editable: false},
      {key: 'name', label: t('Name'), type: 'text', editable: true},
      {key: 'email', label: t('Email'), type: 'text', editable: true},
      {key: 'phone', label: t('Phone'), type: 'text', editable: true},
      {key: 'address', label: t('Address'), type: 'text', editable: true},
      {
        key: 'type',
        label: t('Type'),
        type: 'select',
        editable: true,
        visible: false,
        options: typeOptions,
      },
      {
        key: 'currency',
        label: t('Currency'),
        type: 'select',
        editable: true,
        options: currencyOptions,
      },
    ],
    [t, typeOptions, currencyOptions]
  );

  return (
    <FirebaseCrudManager entityType="shops" title={t('Shops')} fields={fields} />
  );
}
