import {useContext, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {useTranslation} from 'react-i18next';
import {Shop, ShopType, Transaction} from '../interfaces/interfaces.ts';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import TableViewComponent, {
  TableViewActions,
} from '../components/elements/TableViewComponent.tsx';
import {PageHead} from '../components/elements/PageHead.tsx';
import {BsBarChartLine, BsFillPlusCircleFill, BsListUl} from 'react-icons/bs';
import TransactionModal from '../components/modals/TransactionModal.tsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BsCashStack,
  BsGraphUpArrow,
  BsBoxSeam,
  BsCoin,
  BsCartCheck,
} from 'react-icons/bs';

import {
  groupTransactions,
  transactionInterval,
} from '../utils/transactionUtils.ts';
import StyledSelect from '../components/elements/StyledSelect.tsx';
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
import {formatCurrency} from '../utils/data.ts';

export default function Transactions() {
  const dbContext = useContext(DBContext);
  const {t} = useTranslation();
  const [shops] = useState<Shop[]>(dbContext?.data.shops || []);
  const pieColors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00bcd4',
    '#f06292',
  ];

  const filterItems = (shopFilter: string | undefined) => {
    let items = dbContext?.data.transactions ?? [];

    if (shopFilter) {
      const filteredShopId = shops.find((shop) => shop.name === shopFilter)?.id;
      if (filteredShopId) {
        items = items.filter((item) => {
          return item.shop_id && item.shop_id.includes(filteredShopId);
        });
      }
    }

    items.sort((a, b) => (b.docUpdated ?? 0) - (a.docUpdated ?? 0));

    return items;
  };

  const [shopFilter, setShopFilter] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>(
    filterItems(shopFilter)
  );

  const [modalTemplate, setModalTemplate] = useState<Transaction | null>(null);
  const [pageMode, setPageMode] = useState<'list' | 'chart'>('list');
  const [groupBy, setGroupBy] = useState<transactionInterval>('daily');

  const selectShopFilter = (shop: string) => {
    setShopFilter(shop);
    setTransactions(filterItems(shop));
  };

  const saveTransaction = async (type: Transaction) => {
    const updatedTransactions = await dbContext?.setData(
      'transactions',
      type as Transaction
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
        item.id
      )) as ShopType[];
      setTransactions(updatedItems);
    }
  };

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

  const tableLines = transactions.map((transaction) => {
    return [
      transaction.user,
      getIconForTransactionType(transaction.transaction_type),
      getIconForPaymentMethod(transaction.payment_method),
      getIconForDocumentType(transaction.document_type),
      formatCurrency(transaction.cost || 0),
      formatCurrency(transaction.net_amount || 0),
      formatCurrency(transaction.gross_amount || 0),
      new Date(transaction.docUpdated!)
        .toISOString()
        .replace(/T/, ' ')
        .slice(0, 16),
      TableViewActions({
        onRemove: () => deletePart(transaction),
        onEdit: () => setModalTemplate(transaction),
      }),
    ];
  });

  const transactionPieData = Object.entries(
    transactions.reduce(
      (acc, cur) => {
        const key = t(cur.transaction_type || 'Unknown');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    )
  ).map(([name, value]) => ({name, value}));

  return (
    <>
      <PageHead
        title={t('Transactions')}
        buttons={[
          {
            value: pageMode === 'list' ? <BsBarChartLine /> : <BsListUl />,
            onClick: () => {
              setPageMode((prevState) => {
                if (prevState === 'list') {
                  return 'chart';
                }
                return 'list';
              });
            },
          },
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
                      name: '',
                    }
              ),
          },
        ]}
        shopFilter={shopFilter}
        setShopFilter={selectShopFilter}
      >
        <div className='w-30 select-no-first'>
          <StyledSelect
            options={[
              {
                name: t('Daily'),
                value: 'daily',
              },
              {
                name: t('Weekly'),
                value: 'weekly',
              },
              {
                name: t('Monthly'),
                value: 'monthly',
              },
            ]}
            name='type'
            value={groupBy || undefined}
            onSelect={(e) =>
              setGroupBy(
                (e.target as HTMLSelectElement).value as transactionInterval
              )
            }
            label={false}
            compact={true}
          />
        </div>
      </PageHead>

      {pageMode === 'list' && (
        <TableViewComponent
          lines={tableLines}
          header={[
            t('User'),
            t('Type'),
            t('Payment'),
            t('Document'),
            t('Cost'),
            t('Net Amount'),
            t('Gross Amount'),
            t('Date'),
            t('Actions'),
          ]}
        />
      )}

      {pageMode === 'chart' && (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-4 mt-2'>
          {[
            {
              label: t('Total Revenue'),
              icon: <BsCashStack className='text-green-500 text-xl' />,
              value: formatCurrency(
                transactions.reduce(
                  (sum, tx) => sum + Number(tx.gross_amount || 0),
                  0
                )
              ),
            },
            {
              label: t('Net Income'),
              icon: <BsGraphUpArrow className='text-blue-500 text-xl' />,
              value: formatCurrency(
                transactions.reduce(
                  (sum, tx) => sum + Number(tx.net_amount || 0),
                  0
                )
              ),
            },
            {
              label: t('Total Cost'),
              icon: <BsBoxSeam className='text-orange-500 text-xl' />,
              value: formatCurrency(
                transactions.reduce((sum, tx) => sum + Number(tx.cost || 0), 0)
              ),
            },
            {
              label: t('Total Profit'),
              icon: <BsCoin className='text-yellow-500 text-xl' />,
              value: formatCurrency(
                transactions.reduce(
                  (sum, tx) =>
                    sum + (Number(tx.net_amount || 0) - Number(tx.cost || 0)),
                  0
                )
              ),
            },
            {
              label: t('Products Sold'),
              icon: <BsCartCheck className='text-purple-500 text-xl' />,
              value: transactions.length.toLocaleString(),
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className='flex items-center gap-3 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            >
              <div className='p-2 rounded-full bg-gray-100 dark:bg-gray-700'>
                {card.icon}
              </div>
              <div className='flex flex-col'>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  {card.label}
                </span>
                <span className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {card.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {pageMode === 'chart' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4'>
          <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
            <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
              {t('Financial Overview')}
            </h2>
            <div className='flex-1'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={groupTransactions(transactions, groupBy)}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='cost'
                    stroke='#8884d8'
                    name={t('Cost')}
                  />
                  <Line
                    type='monotone'
                    dataKey='net'
                    stroke='#00bcd4'
                    name={t('Net')}
                  />
                  <Line
                    type='monotone'
                    dataKey='gross'
                    stroke='#82ca9d'
                    name={t('Gross')}
                  />
                  <Line
                    type='monotone'
                    dataKey='margin'
                    stroke='#ff7300'
                    name={t('Profit')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
            <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
              {t('Transaction Types')}
            </h2>
            <div className='flex-1 flex items-center justify-center'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={transactionPieData}
                    dataKey='value'
                    nameKey='name'
                    cx='50%'
                    cy='50%'
                    outerRadius={80}
                    label
                  >
                    {transactionPieData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
            <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
              {t('Profit Margin')}
            </h2>
            <div className='flex-1'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={groupTransactions(transactions, groupBy)}>
                  <defs>
                    <linearGradient id='colorNet' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                      <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey='date' />
                  <YAxis />
                  <CartesianGrid strokeDasharray='3 3' />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Number(value))}
                  />
                  <Area
                    type='monotone'
                    dataKey='margin'
                    stroke='#8884d8'
                    fillOpacity={1}
                    fill='url(#colorNet)'
                    name={t('Profit Margin')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
            <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
              {t('Products Sold')}
            </h2>
            <div className='flex-1'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={groupTransactions(transactions, groupBy)}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey='count'
                    fill='#8884d8'
                    name={t('Products Sold')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-center h-80 overflow-x-auto sm:rounded-lg w-full m-auto mt-2 flex-1'>
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
