import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DBContext } from '../../database/DBContext.ts';
import type { CrudField } from '../components/FirebaseCrudManager.tsx';
import FirebaseCrudManager from '../components/FirebaseCrudManager.tsx';
import type { StyledSelectOption } from '../../interfaces/interfaces';

export default function UsersPage() {
  const { t } = useTranslation();
  const dbContext = useContext(DBContext);

  const shopOptions: StyledSelectOption[] = useMemo(
    () =>
      (dbContext?.data?.shops || []).map((shop) => ({
        name: shop.name || '',
        value: shop.id,
      })),
    [dbContext?.data?.shops],
  );

  const roleOptions: StyledSelectOption[] = useMemo(
    () => [
      { name: t('Admin') as string, value: 'admin' },
      { name: t('Manager') as string, value: 'manager' },
      { name: t('User') as string, value: 'user' },
    ],
    [t],
  );

  const fields: CrudField[] = useMemo(
    () => [
      { key: 'username', label: t('Name'), type: 'text', editable: true },
      { key: 'email', label: t('Email'), type: 'text', editable: true },
      {
        key: 'role',
        label: t('Role'),
        type: 'select',
        editable: true,
        options: roleOptions,
      },
      // Modal-only fields
      {
        key: 'shop_id',
        label: t('Shops'),
        type: 'multiselect',
        editable: true,
        visible: false,
        options: shopOptions,
      },
    ],
    [t, roleOptions, shopOptions],
  );

  return (
    <FirebaseCrudManager
      entityType="users"
      title={t('Users')}
      fields={fields}
    />
  );
}
