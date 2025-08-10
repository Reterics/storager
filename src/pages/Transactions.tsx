import { useCallback, useContext, useEffect, useState } from 'react';
import { DBContext } from '../database/DBContext.ts';
import { useTranslation } from 'react-i18next';
import type {
  Shop,
  ShopType,
  StyledSelectOption,
  Transaction,
} from '../interfaces/interfaces.ts';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import { PageHead } from '../components/elements/PageHead.tsx';
import { BsBarChartLine, BsFillPlusCircleFill } from 'react-icons/bs';
import TransactionModal from '../components/modals/TransactionModal.tsx';
import {
  documentTypes,
  paymentMethods,
  transactionItemTypes,
  transactionTypes,
} from '../interfaces/constants.ts';
import {
  getIconForDocumentType,
  getIconForPaymentMethod,
  getIconForTransactionType,
} from '../utils/typedIcons.tsx';
import { formatCurrency } from '../utils/data.ts';
import { useNavigate } from 'react-router-dom';
import StyledSelect from '../components/elements/StyledSelect.tsx';

export default function Transactions() {
  const dbContext = useContext(DBContext);
  const { t } = useTranslation();
  const [shops] = useState<Shop[]>(dbContext?.data.shops || []);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const navigate = useNavigate();

  const filterItems = useCallback(
    (
      shopFilter: string | undefined,
      searchFilter?: string,
      userFilter?: string,
    ) => {
      let items = dbContext?.data.transactions ?? [];

      if (shopFilter) {
        const filteredShopId = shops.find(
          (shop) => shop.name === shopFilter,
        )?.id;
        if (filteredShopId) {
          items = items.filter((item) => {
            return item.shop_id && item.shop_id.includes(filteredShopId);
          });
        }
      }

      if (userFilter) {
        items = items.filter(
          (item) => item.user && item.user.includes(userFilter),
        );
      }

      if (searchFilter) {
        const lowerCaseFilter = searchFilter.toLowerCase();

        items = items.filter((item) =>
          item.name?.toLowerCase().includes(lowerCaseFilter),
        );
      }

      items.sort((a, b) => (b.docUpdated ?? 0) - (a.docUpdated ?? 0));

      return items;
    },
    [dbContext?.data.transactions, shops],
  );

  const [shopFilter, setShopFilter] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>(
    filterItems(shopFilter),
  );

  const [modalTemplate, setModalTemplate] = useState<Transaction | null>(null);
  const [tableLimits, setTableLimits] = useState<number>(100);

  const usersOptions = (dbContext?.data.users || []).map((key) => {
    return {
      name: key.email,
      value: key.email,
    } as StyledSelectOption;
  });

  useEffect(() => {
    setTransactions(filterItems(shopFilter, searchFilter, userFilter));
  }, [shopFilter, searchFilter, userFilter, filterItems]);

  const saveTransaction = async (type: Transaction) => {
    const updatedTransactions = await dbContext?.setData(
      'transactions',
      type as Transaction,
    );
    setTransactions(updatedTransactions as Transaction[]);
    setModalTemplate(null);
  };

  const deletePart = async (item: ShopType) => {
    if (
      item.id &&
      window.confirm(t('Are you sure you wish to delete this Transaction?'))
    ) {
      const updatedItems = (await dbContext?.removeData(
        'transactions',
        item.id,
      )) as ShopType[];
      setTransactions(updatedItems);
    }
  };

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

  const tableLines = transactions.map((transaction) => {
    return [
      transaction.name,
      transaction.user,
      getIconForTransactionType(transaction.transaction_type),
      getIconForPaymentMethod(transaction.payment_method),
      getIconForDocumentType(transaction.document_type),
      transaction.quantity || '',
      formatCurrency(transaction.cost || 0),
      formatCurrency(transaction.net_amount || 0),
      formatCurrency(transaction.gross_amount || 0),
      transaction.docUpdated
        ? new Date(transaction.docUpdated)
            .toISOString()
            .replace(/T/, ' ')
            .slice(0, 16)
        : '?',
      TableViewActions({
        onRemove: () => deletePart(transaction),
        onEdit: () => setModalTemplate(transaction),
      }),
    ];
  });

  return (
    <>
      <PageHead
        title={t('Transactions')}
        buttons={[
          {
            value: <BsFillPlusCircleFill />,
            onClick: () =>
              setModalTemplate(
                modalTemplate
                  ? null
                  : {
                      id: '',
                      user:
                        dbContext?.data.currentUser?.email ||
                        dbContext?.data.currentUser?.id,
                      item_type: transactionItemTypes[0].value as 'part',
                      payment_method: paymentMethods[0].value as 'card',
                      document_type: documentTypes[0].value as 'invoice',
                      transaction_type: transactionTypes[0].value as 'sell',
                      cost: 0,
                      net_amount: 0,
                      gross_amount: 0,
                      quantity: 0,
                      name: '',
                    },
              ),
          },
        ]}
        onSearch={setSearchFilter}
        tableLimits={tableLimits}
        setTableLimits={setTableLimits}
        shopFilter={shopFilter}
        setShopFilter={setShopFilter}
      >
        <div className="flex flex-1" />
        <button
          className="flex items-center gap-1 text-sm font-medium rounded
          text-gray-900 bg-white border border-gray-300 hover:bg-gray-100
          dark:bg-gray-700 dark:text-white dark:border-gray-600 px-3 py-1.5"
          onClick={() => navigate('?page=reports', { replace: true })}
        >
          <BsBarChartLine /> {t('Reports')}
        </button>
        <div className="w-30 select-no-first">
          <StyledSelect
            options={[
              {
                name: t('All users'),
                value: '',
              },
              ...usersOptions,
            ]}
            name="type"
            value={userFilter || undefined}
            defaultLabel={t('All users')}
            onSelect={(e) =>
              setUserFilter((e.target as HTMLSelectElement).value)
            }
            label={false}
            compact={true}
          />
        </div>
      </PageHead>
      <div className="mb-2 mt-1" />

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

      <div className="flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1">
        <TransactionModal
          onClose={() => setModalTemplate(null)}
          onSave={(item: ShopType) => saveTransaction(item)}
          setTransaction={(item: ShopType) => setModalTemplate(item)}
          transaction={modalTemplate}
          inPlace={false}
          shops={shops}
        ></TransactionModal>
      </div>
    </>
  );
}
