import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import FirebaseCrudManager, {
  CrudField,
} from '../components/FirebaseCrudManager';

export default function TypesPage() {
  const {t} = useTranslation();

  const appliesToOptions = useMemo(
    () => [
      {name: t('Part') as string, value: 'part'},
      {name: t('Item') as string, value: 'item'},
      {name: t('Service') as string, value: 'service'},
    ],
    [t]
  );

  const fields: CrudField[] = useMemo(
    () => [
      {key: 'key', label: t('Key'), type: 'text', editable: true},
      {key: 'name_hu', label: t('Name (HU)'), type: 'text', editable: true},
      {key: 'name_en', label: t('Name (EN)'), type: 'text', editable: true},
      {
        key: 'appliesTo',
        label: t('Applies to'),
        type: 'select',
        editable: true,
        options: appliesToOptions,
      },
      {key: 'order', label: t('Order'), type: 'number', editable: true},
      // Optional fields (modal-only)
      {key: 'color', label: t('Color'), type: 'text', editable: true, visible: false},
      {key: 'icon', label: t('Icon'), type: 'text', editable: true, visible: false},
    ],
    [t, appliesToOptions]
  );

  return (
    <FirebaseCrudManager entityType="types" title={t('Types')} fields={fields} />
  );
}
