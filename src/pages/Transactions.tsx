import {useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {Shop, ShopType, Transaction} from "../interfaces/interfaces.ts";
import UnauthorizedComponent from "../components/Unauthorized.tsx";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import {PageHead} from "../components/elements/PageHead.tsx";
import {BsBarChartLine, BsFillPlusCircleFill, BsListUl} from "react-icons/bs";
import TransactionModal from "../components/modals/TransactionModal.tsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';

import {groupTransactions, transactionInterval} from "../utils/transactionUtils.ts";
import StyledSelect from "../components/elements/StyledSelect.tsx";
import {documentTypes, paymentMethods, transactionItemTypes, transactionTypes} from "../interfaces/constants.ts";


export default function Transactions() {
    const dbContext = useContext(DBContext);
    const { t } = useTranslation();
    const [shops] = useState<Shop[]>(dbContext?.data.shops || []);

    const filterItems = (shopFilter: string|undefined) => {
        let items = dbContext?.data.transactions ?? [];

        if (shopFilter) {
            const filteredShopId = shops.find(shop => shop.name === shopFilter)?.id;
            if (filteredShopId) {
                items = items.filter(item => {
                    return item.shop_id && (item.shop_id.includes(filteredShopId));
                });
            }
        }

        items.sort((a, b) => (b.docUpdated ?? 0) - (a.docUpdated ?? 0));

        return items;
    };

    const [shopFilter, setShopFilter] = useState<string>('');
    const [transactions, setTransactions] = useState<Transaction[]>(filterItems(shopFilter));

    const [modalTemplate, setModalTemplate] = useState<Transaction|null>(null)
    const [pageMode, setPageMode] = useState<'list'|'chart'>('list')
    const [groupBy, setGroupBy] = useState<transactionInterval>('daily')

    const selectShopFilter = (shop: string) => {
        setShopFilter(shop)
        setTransactions(filterItems(shop));
    };

    const saveTransaction = async (type: Transaction) => {
        const updatedTransactions = await dbContext?.setData('transactions', type as Transaction);
        setTransactions(updatedTransactions as Transaction[]);
        setModalTemplate(null);
    }

    const deletePart = async (item: ShopType) => {
        if (item.id && window.confirm(t('Are you sure you wish to delete this Transaction?'))) {
            const updatedItems = await dbContext?.removeData('transactions', item.id) as ShopType[];
            setTransactions(updatedItems);
        }
    };

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    const tableLines = transactions.map(transaction => {

        return [
            transaction.user,
            transaction.transaction_type,
            transaction.payment_method,
            transaction.document_type,
            transaction.cost,
            transaction.net_amount,
            transaction.gross_amount,
            new Date(transaction.docUpdated!).toISOString().replace(/T/, " ").slice(0, 16),
            TableViewActions({
                onRemove: () => deletePart(transaction),
                onEdit: () => setModalTemplate(transaction)
            })
        ];
    });


    return <>
        <PageHead title={t('Transactions')} buttons={[
            {
                value: pageMode === 'list' ? <BsBarChartLine /> : <BsListUl />,
                onClick: ()=> {
                    setPageMode(prevState => {
                        if (prevState === 'list') {
                            return 'chart';
                        }
                        return 'list';
                    })
                }
            },
            {
                value: <BsFillPlusCircleFill/>,
                onClick: () => setModalTemplate(modalTemplate ? null : {
                    id: '',
                    user: dbContext?.data.currentUser?.email || dbContext?.data.currentUser?.id,
                    item_type: transactionItemTypes[0].value as 'part',
                    payment_method: paymentMethods[0].value as 'card',
                    document_type: documentTypes[0].value as 'invoice',
                    transaction_type: transactionTypes[0].value as 'sell',
                    cost: 0,
                    net_amount: 0,
                    gross_amount: 0,
                    name: ''
                })
            }
        ]}
            shopFilter={shopFilter}
            setShopFilter={selectShopFilter}
        >
            <div className='w-30 select-no-first'>
                <StyledSelect
                    options={[
                        {
                            name: t('Daily'), value:'daily'
                        },
                        {
                            name: t('Weekly'), value:'weekly'
                        },
                        {
                            name: t('Monthly'), value:'monthly'
                        },
                    ]}
                    name='type'
                    value={groupBy || undefined}
                    onSelect={(e) => setGroupBy((e.target as HTMLSelectElement).value as transactionInterval)}
                    label={false}
                    compact={true}
                />

            </div>
        </PageHead>

        {
            pageMode === 'list' &&
                <TableViewComponent lines={tableLines}
                    header={[
                      t('User'),
                      t('Type'),
                      t('Payment Method'),
                      t('Document Type'),
                      t('Cost'),
                      t('Net Amount'),
                      t('Gross Amount'),
                      t('Date'),
                      t('Actions')
                    ]}
            />
        }

        {
            pageMode === 'chart' && <div style={{ width: '100%', height: '35vh' }} className="bg-white">
                <ResponsiveContainer>
                    <LineChart data={groupTransactions(transactions, groupBy)} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="linear" dataKey="cost" stroke="#8884d8" name="Cost" />
                        <Line type="linear" dataKey="gross" stroke="#82ca9d" name="Gross" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        }
        {
            pageMode === 'chart' && <div style={{ width: '100%', height: '35vh' }} className="bg-white">
                <ResponsiveContainer>
                    <BarChart
                        data={groupTransactions(transactions, groupBy)}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cost" fill="#8884d8" name="Cost" />
                        <Bar dataKey="gross" fill="#82ca9d" name="Gross" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        }

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
}