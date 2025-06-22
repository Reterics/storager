import {useContext, useState} from 'react';
import {DBContext} from '../database/DBContext.ts';
import {useTranslation} from 'react-i18next';
import {Shop, Transaction} from '../interfaces/interfaces.ts';
import UnauthorizedComponent from '../components/Unauthorized.tsx';
import {PageHead} from '../components/elements/PageHead.tsx';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BsBarChartLine,
  BsBoxArrowInLeft,
  BsBoxSeam,
  BsCartCheck,
  BsCashStack,
  BsCoin,
  BsGraphUpArrow,
  BsGrid1X2,
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
  const [activeTab, setActiveTab] = useState<'general' | 'items'>('general');
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

  const groupedData = groupTransactions(transactions, groupBy);
  const lastNonEmpty = [...groupedData]
    .reverse()
    .find((g) => g.products && Object.keys(g.products).length > 0);

  const transactionTypeMap: Record<string, number> = {};

  for (const group of groupedData) {
    if (group.types) {
      for (const [type, count] of Object.entries(group.types)) {
        transactionTypeMap[type] = (transactionTypeMap[type] || 0) + count;
      }
    }
  }

  const transactionPieData = Object.entries(transactionTypeMap).map(
    ([name, value]) => ({
      name: t(name),
      value,
    })
  );

  // For items page show actual day
  const gross =
    activeTab === 'items'
      ? lastNonEmpty?.gross || 0
      : groupedData.reduce((sum, g) => sum + (g.gross || 0), 0);
  const net =
    activeTab === 'items'
      ? lastNonEmpty?.net || 0
      : groupedData.reduce((sum, g) => sum + (g.net || 0), 0);
  const cost =
    activeTab === 'items'
      ? lastNonEmpty?.cost || 0
      : groupedData.reduce((sum, g) => sum + (g.cost || 0), 0);
  const count = activeTab === 'items' ? lastNonEmpty?.count || 0 : net - cost;
  const profit =
    activeTab === 'items'
      ? net - cost
      : groupedData.reduce((sum, g) => sum + (g.count || 0), 0);

  return (
    <>
      <PageHead
        title={null}
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
        <div className='flex flex-1 gap-2 border-b border-gray-200 dark:border-gray-700'>
          <button
            className={`py-2 px-3 text-sm font-medium flex items-center gap-2 rounded-md transition-colors bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700`}
            onClick={() => navigate('?page=transactions', {replace: true})}
          >
            <BsBoxArrowInLeft /> {t('Back')}
          </button>
          {[
            {
              key: 'general',
              label: t('General Reports'),
              icon: <BsBarChartLine />,
            },
            {key: 'items', label: t('Item Reports'), icon: <BsGrid1X2 />},
          ].map(({key, label, icon}) => {
            const isActive = activeTab === key;

            return (
              <button
                key={key}
                className={`py-2 px-3 text-sm font-medium flex items-center gap-2 rounded-md transition-colors
            ${
              isActive
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
                onClick={() => setActiveTab(key as typeof activeTab)}
              >
                {icon} {label}
              </button>
            );
          })}
          <div className='text-sm text-gray-500 dark:text-gray-400 align-middle flex-1 content-center'>
            {lastNonEmpty && activeTab === 'items'
              ? t('Showing data for')
              : activeTab === 'items'
                ? t('No product sales data available')
                : null}
            {lastNonEmpty && activeTab === 'items' && (
              <strong className='ms-1'>{lastNonEmpty.date}</strong>
            )}
          </div>
        </div>
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
              {
                name: t('Yearly'),
                value: 'yearly',
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

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-2'>
        {[
          {
            label: t('Total Revenue'),
            icon: <BsCashStack className='text-green-500 text-xl' />,
            value: formatCurrency(gross),
          },
          {
            label: t('Net Income'),
            icon: <BsGraphUpArrow className='text-blue-500 text-xl' />,
            value: formatCurrency(net),
          },
          {
            label: t('Total Cost'),
            icon: <BsBoxSeam className='text-orange-500 text-xl' />,
            value: formatCurrency(cost),
          },
          {
            label: t('Total Profit'),
            icon: <BsCoin className='text-yellow-500 text-xl' />,
            value: formatCurrency(profit),
          },
          {
            label: t('Products Sold'),
            icon: <BsCartCheck className='text-purple-500 text-xl' />,
            value: count.toLocaleString(),
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

      {activeTab === 'general' ? (
        <>
          <div className='grid grid-cols-1 gap-4 py-4'>
            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
              <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4'>
                {t('Summary Dashboard')}
              </h2>
              <div className='flex-1'>
                <ResponsiveContainer width='100%' height='100%'>
                  <ComposedChart
                    data={groupTransactions(transactions, groupBy)}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis yAxisId='left' />
                    <YAxis yAxisId='right' orientation='right' />
                    <Tooltip
                      formatter={(value: number) =>
                        formatCurrency(Number(value))
                      }
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

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pb-4'>
            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
              <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
                {t('Profit Margin Analysis')}
              </h2>
              <div className='flex-1'>
                <ResponsiveContainer width='100%' height='100%'>
                  <ComposedChart
                    data={groupTransactions(transactions, groupBy)}
                  >
                    <defs>
                      <linearGradient id='colorNet' x1='0' y1='0' x2='0' y2='1'>
                        <stop
                          offset='5%'
                          stopColor='#8884d8'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='#8884d8'
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id='colorMarginPercent'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#82ca9d'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='#82ca9d'
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id='colorGrossMarginPercent'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#ff7300'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='#ff7300'
                          stopOpacity={0}
                        />
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

            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
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

            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
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
                      formatter={(value: number) =>
                        formatCurrency(Number(value))
                      }
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

            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
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
                      formatter={(value: number) =>
                        formatCurrency(Number(value))
                      }
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

            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
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
                      formatter={(value: number) =>
                        formatCurrency(Number(value))
                      }
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

            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
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
                      formatter={(value: number) =>
                        formatCurrency(Number(value))
                      }
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
          </div>
        </>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 py-4'>
            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
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
                    <Bar
                      dataKey='count'
                      fill='#8884d8'
                      name={t('Products Sold')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
              <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
                {t('Products Sold by Name')}
              </h2>

              <div className='flex-1'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={(() => {
                      const productCounts: Record<string, number> = {};

                      if (lastNonEmpty?.products) {
                        Object.entries(lastNonEmpty.products).forEach(
                          ([name, count]) => {
                            productCounts[name] = count;
                          }
                        );
                      }

                      return Object.entries(productCounts)
                        .map(([name, count]) => ({name, count}))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 10);
                    })()}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey='count'
                      fill='#82ca9d'
                      name={t('Quantity Sold')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
              <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
                {t('Item Revenue Contribution')}
              </h2>
              <div className='flex-1'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Tooltip
                      formatter={(value: number) =>
                        formatCurrency(Number(value))
                      }
                    />
                    <Legend />
                    <Pie
                      data={(() => {
                        return Object.entries(
                          lastNonEmpty?.productsRevenue || {}
                        )
                          .map(([name, value]) => ({name, value}))
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 8);
                      })()}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      label
                    >
                      {Array(8)
                        .fill(0)
                        .map((_entry, index) => (
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

            <div className='flex flex-col h-[35vh] p-2 pt-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
              <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2'>
                {t('Item Profit Margin Comparison')}
              </h2>
              <div className='flex-1'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={(() => {
                      const productMargins: Record<
                        string,
                        {revenue: number; cost: number}
                      > = {};

                      if (
                        lastNonEmpty?.productsRevenue &&
                        lastNonEmpty?.productsCost
                      ) {
                        Object.keys(lastNonEmpty.productsRevenue).forEach(
                          (name) => {
                            const revenue =
                              lastNonEmpty.productsRevenue?.[name] || 0;
                            const cost = lastNonEmpty.productsCost?.[name] || 0;

                            if (!productMargins[name]) {
                              productMargins[name] = {revenue: 0, cost: 0};
                            }

                            productMargins[name].revenue += revenue;
                            productMargins[name].cost += cost;
                          }
                        );
                      }

                      return Object.entries(productMargins)
                        .map(([name, data]) => {
                          const margin = data.revenue - data.cost;
                          return {
                            name,
                            margin,
                            marginPercent:
                              data.cost > 0 ? (margin / data.cost) * 100 : 0,
                          };
                        })
                        .sort((a, b) => b.margin - a.margin)
                        .slice(0, 10);
                    })()}
                    layout='vertical'
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis dataKey='name' type='category' width={100} />
                    <Tooltip
                      formatter={(value: number, name) => {
                        if (name === t('Margin %')) {
                          return [`${value.toFixed(1)}%`, name];
                        }
                        return [formatCurrency(Number(value)), name];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey='margin'
                      fill='#8884d8'
                      name={t('Profit Margin')}
                    />
                    <Bar
                      dataKey='marginPercent'
                      fill='#82ca9d'
                      name={t('Margin %')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
