import {useContext, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {DBContext} from '../../database/DBContext.ts';
import {PageHead} from '../../components/elements/PageHead.tsx';
import TableViewComponent, {TableViewActions} from '../../components/elements/TableViewComponent.tsx';
import UnauthorizedComponent from '../../components/Unauthorized.tsx';
import StyledSelect from '../../components/elements/StyledSelect.tsx';
import StyledInput from '../../components/elements/StyledInput.tsx';
import {BsFillPlusCircleFill} from 'react-icons/bs';
import {StyledSelectOption, Transaction} from '../../interfaces/interfaces.ts';
import {documentTypes, paymentMethods, transactionTypes} from '../../interfaces/constants.ts';
import {formatCurrency} from '../../utils/data.ts';
import TransactionModal from '../../components/modals/TransactionModal.tsx';

export default function TransactionsPage() {
  const {t} = useTranslation();
  const dbContext = useContext(DBContext);

  const [tableLimits, setTableLimits] = useState<number>(100);
  const [shopFilter, setShopFilter] = useState<string | undefined>();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const [transactions, setTransactions] = useState<Transaction[]>(
    (dbContext?.data.transactions || []).slice()
  );

  const usersOptions: StyledSelectOption[] = useMemo(
    () =>
      (dbContext?.data.users || []).map((u) => ({
        name: u.email || u.username || u.id,
        value: u.email || u.username || u.id || '',
      })),
    [dbContext?.data.users]
  );
  const [userFilter, setUserFilter] = useState<string>('');

  useEffect(() => {
    let items = (dbContext?.data.transactions || []).slice();

    // shop filter maps shop name to id like legacy
    if (shopFilter) {
      const filteredShopId = (dbContext?.data.shops || []).find(
        (s) => s.name === shopFilter
      )?.id;
      if (filteredShopId) {
        items = items.filter((it) => it.shop_id?.includes?.(filteredShopId));
      }
    }

    if (userFilter) {
      items = items.filter((it) => (it.user || '').includes(userFilter));
    }

    if (typeFilter) {
      items = items.filter((it) => it.transaction_type === typeFilter);
    }

    if (searchFilter) {
      const lf = searchFilter.toLowerCase();
      items = items.filter((it) => (it.name || '').toLowerCase().includes(lf));
    }

    if (dateFrom) {
      const fromTs = new Date(dateFrom).getTime();
      items = items.filter((it) => (it.docUpdated ?? 0) >= fromTs);
    }
    if (dateTo) {
      const toTs = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1; // inclusive day end
      items = items.filter((it) => (it.docUpdated ?? 0) <= toTs);
    }

    items.sort((a, b) => (b.docUpdated ?? 0) - (a.docUpdated ?? 0));
    setTransactions(items);
  }, [shopFilter, searchFilter, userFilter, typeFilter, dateFrom, dateTo, dbContext?.data.transactions, dbContext?.data.shops]);

  const [modalTemplate, setModalTemplate] = useState<Transaction | null>(null);

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

  const tableLines = transactions.map((tr) => [
    tr.name || '',
    tr.user || '',
    t(tr.transaction_type || ''),
    t(tr.payment_method || ''),
    t(tr.document_type || ''),
    tr.quantity ?? '',
    formatCurrency(tr.cost || 0),
    formatCurrency(tr.net_amount || 0),
    formatCurrency(tr.gross_amount || 0),
    tr.docUpdated
      ? new Date(tr.docUpdated).toISOString().replace(/T/, ' ').slice(0, 16)
      : '?',
    TableViewActions({
      onEdit: () => setModalTemplate(tr),
      onRemove: async () => {
        if (tr.id && window.confirm(t('Are you sure you wish to delete this Transaction?'))) {
          await dbContext?.removeData('transactions', tr.id);
          await dbContext?.refreshData('transactions');
        }
      },
    }),
  ]);

  return (
    <>
      {!modalTemplate && (
        <PageHead
          title={t('Transactions')}
          buttons={[
            {
              value: <BsFillPlusCircleFill />,
              onClick: () =>
                setModalTemplate(
                  modalTemplate
                    ? null
                    : ({
                        id: '',
                        user: dbContext?.data.currentUser?.email || dbContext?.data.currentUser?.id,
                        item_type: 'part',
                        payment_method: paymentMethods[0].value as 'card',
                        document_type: documentTypes[0].value as 'invoice',
                        transaction_type: transactionTypes[0].value as 'sell',
                        cost: 0,
                        net_amount: 0,
                        gross_amount: 0,
                        quantity: 0,
                        name: '',
                      } as Transaction)
                ),
            },
          ]}
          onSearch={setSearchFilter}
          tableLimits={tableLimits}
          setTableLimits={setTableLimits}
          shopFilter={shopFilter}
          setShopFilter={(v: string) => setShopFilter(v || undefined)}
        >
          <div className='flex gap-2 items-center flex-wrap'>
            <div className='w-30 select-no-first'>
              <StyledSelect
                options={[
                  {name: t('All users'), value: ''},
                  ...usersOptions,
                ]}
                name='user'
                value={userFilter || ''}
                defaultLabel={t('All users')}
                onSelect={(e) => setUserFilter((e.target as HTMLSelectElement).value)}
                label={false}
                compact={true}
              />
            </div>
            <div className='w-30 select-no-first'>
              <StyledSelect
                options={[
                  {name: t('All types'), value: ''},
                  ...transactionTypes.map((tOpt) => ({name: t(tOpt.name), value: tOpt.value})),
                ]}
                name='type'
                value={typeFilter || ''}
                defaultLabel={t('All types')}
                onSelect={(e) => setTypeFilter((e.target as HTMLSelectElement).value || undefined)}
                label={false}
                compact={true}
              />
            </div>
            <StyledInput
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              label={t('From')}
            />
            <StyledInput
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              label={t('To')}
            />
          </div>
        </PageHead>
      )}

      <div className='mb-2 mt-1' />

      <TableViewComponent
        lines={tableLines}
        tableLimits={tableLimits}
        header={[
          t('Name'),
          t('User'),
          t('Type'),
          t('Payment'),
          t('Document'),
          t('Qty.'),
          t('Cost'),
          t('Net Amount'),
          t('Gross Amount'),
          t('Date'),
          t('Actions'),
        ]}
      />

      <div className='flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1'>
        <TransactionModal
          onClose={() => setModalTemplate(null)}
          onSave={async (item: Transaction) => {
            await dbContext?.setData('transactions', item);
            await dbContext?.refreshData('transactions');
            setModalTemplate(null);
          }}
          setTransaction={(item: Transaction) => setModalTemplate(item)}
          transaction={modalTemplate}
          inPlace={false}
          shops={dbContext?.data.shops || []}
        />
      </div>
    </>
  );
}
