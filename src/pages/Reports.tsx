import {useContext, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {useTranslation} from 'react-i18next';
import {Shop, Transaction} from '../interfaces/interfaces.ts';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import {PageHead} from '../components/elements/PageHead.tsx';
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
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts';
import {
  BsCashStack,
  BsGraphUpArrow,
  BsBoxSeam,
  BsCoin,
  BsCartCheck,
  BsListUl,
} from 'react-icons/bs';
import {
  groupTransactions,
  transactionInterval,
} from '../utils/transactionUtils.ts';
import StyledSelect from '../components/elements/StyledSelect.tsx';
import {formatCurrency} from '../utils/data.ts';
import {useNavigate} from 'react-router-dom';

export default function Reports() {
  const dbContext = useContext(DBContext);
  const {t} = useTranslation();
  const [shops] = useState<Shop[]>(dbContext?.data.shops || []);
  const [shopFilter, setShopFilter] = useState<string>('');
  const [groupBy, setGroupBy] = useState<transactionInterval>('daily');
  const pieColors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00bcd4',
    '#f06292',
  ];
  const navigate = useNavigate();

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

  const [transactions, setTransactions] = useState<Transaction[]>(
    filterItems(shopFilter)
  );

  const selectShopFilter = (shop: string) => {
    setShopFilter(shop);
    setTransactions(filterItems(shop));
  };

  if (!dbContext?.data.currentUser) {
    return <UnauthorizedComponent />;
  }

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
        title={t('Reports')}
        shopFilter={shopFilter}
        setShopFilter={selectShopFilter}
        buttons={[
          {
            value: <BsListUl />,
            onClick: () => {
              navigate('?page=transactions', {replace: true});
            },
          },
        ]}
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

      <div className='grid grid-cols-1 gap-4 p-4'>
        <div className='flex flex-col h-[40vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
            {t('Summary Dashboard')}
          </h2>
          <div className='flex-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart data={groupTransactions(transactions, groupBy)}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis yAxisId='left' />
                <YAxis yAxisId='right' orientation='right' />
                <Tooltip
                  formatter={(value: number) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar
                  yAxisId='left'
                  dataKey='count'
                  fill='#8884d8'
                  name={t('Products Sold')}
                  barSize={20}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='cost'
                  stroke='#ff7300'
                  name={t('Cost')}
                  strokeWidth={2}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='net'
                  stroke='#00bcd4'
                  name={t('Net')}
                  strokeWidth={2}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='gross'
                  stroke='#82ca9d'
                  name={t('Gross')}
                  strokeWidth={2}
                />
                <Area
                  yAxisId='right'
                  type='monotone'
                  dataKey='margin'
                  fill='rgba(136, 132, 216, 0.3)'
                  stroke='#8884d8'
                  name={t('Profit')}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4'>
        <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
            {t('Cost Overview')}
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
                  strokeWidth={2}
                  dot={{r: 3}}
                  activeDot={{r: 5}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
            {t('Net Income Overview')}
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
                  dataKey='net'
                  stroke='#00bcd4'
                  name={t('Net Income')}
                  strokeWidth={2}
                  dot={{r: 3}}
                  activeDot={{r: 5}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
            {t('Gross Revenue Overview')}
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
                  dataKey='gross'
                  stroke='#82ca9d'
                  name={t('Gross Revenue')}
                  strokeWidth={2}
                  dot={{r: 3}}
                  activeDot={{r: 5}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
            {t('Profit Overview')}
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
                  dataKey='margin'
                  stroke='#ff7300'
                  name={t('Profit')}
                  strokeWidth={2}
                  dot={{r: 3}}
                  activeDot={{r: 5}}
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
            {t('Profit Margin Analysis')}
          </h2>
          <div className='flex-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart data={groupTransactions(transactions, groupBy)}>
                <defs>
                  <linearGradient id='colorNet' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id='colorMarginPercent'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#82ca9d' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#82ca9d' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id='colorGrossMarginPercent'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor='#ff7300' stopOpacity={0.8} />
                    <stop offset='95%' stopColor='#ff7300' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey='date' />
                <YAxis
                  yAxisId='left'
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                />
                <CartesianGrid strokeDasharray='3 3' />
                <Tooltip
                  formatter={(value: number, name) => {
                    if (
                      name === t('Margin % (ROI)') ||
                      name === t('Gross Margin %')
                    ) {
                      return [`${value.toFixed(1)}%`, name];
                    }
                    return [formatCurrency(Number(value)), name];
                  }}
                />
                <Legend />
                <Area
                  yAxisId='left'
                  type='monotone'
                  dataKey='margin'
                  stroke='#8884d8'
                  fillOpacity={0.6}
                  fill='url(#colorNet)'
                  name={t('Profit Margin')}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='marginPercent'
                  stroke='#82ca9d'
                  strokeWidth={2}
                  dot={{r: 3}}
                  activeDot={{r: 5}}
                  name={t('Margin % (ROI)')}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='grossMarginPercent'
                  stroke='#ff7300'
                  strokeWidth={2}
                  dot={{r: 3}}
                  activeDot={{r: 5}}
                  name={t('Gross Margin %')}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
            {t('Products Sold Over Time')}
          </h2>
          <div className='flex-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={groupTransactions(transactions, groupBy)}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip
                  content={({active, payload, label}) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className='bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-md'>
                          <p className='font-semibold'>{label}</p>
                          <p>{`${t('Total Products')}: ${data.count}`}</p>
                          {data.products &&
                            Object.entries(data.products).map(
                              ([name, count], idx) => (
                                <p key={idx}>{`${name}: ${count}`}</p>
                              )
                            )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey='count' fill='#8884d8' name={t('Products Sold')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='flex flex-col h-[35vh] p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
            {t('Products Sold by Name')}
          </h2>
          <div className='flex-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={(() => {
                  // Aggregate products across all time periods
                  const productCounts: Record<string, number> = {};
                  const groupedData = groupTransactions(transactions, groupBy);

                  groupedData.forEach((period) => {
                    if (period.products) {
                      Object.entries(period.products).forEach(
                        ([name, count]) => {
                          productCounts[name] =
                            (productCounts[name] || 0) + (count as number);
                        }
                      );
                    }
                  });

                  // Convert to array format for the chart
                  return Object.entries(productCounts)
                    .map(([name, count]) => ({name, count}))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10); // Show top 10 products
                })()}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='count' fill='#82ca9d' name={t('Quantity Sold')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
