import {useContext, useMemo, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {PageHead} from "../components/elements/PageHead.tsx";
import {ServiceCompleteData, ServiceData, SettingsItems, TableLineType} from "../interfaces/interfaces.ts";
import ServiceModal from "../components/modals/ServiceModal.tsx";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import ServiceCompletionModal from "../components/modals/ServiceCompletionModal.tsx";
import {ShopContext} from "../store/ShopContext.tsx";
import UnauthorizedComponent from "../components/Unauthorized.tsx";
import PrintableVersionFrame from "../components/modals/PrintableVersionFrame.tsx";
import {PDFData} from "../interfaces/pdf.ts";
import ListModal from "../components/modals/ListModal.tsx";
import {completionFormToPrintable, serviceDataToPrintable} from "../utils/print.tsx";
import {compareNormalizedStrings, generateServiceId, toUserDateTime} from "../utils/data.ts";
import StyledSelect from "../components/elements/StyledSelect.tsx";


function Service() {
    const dbContext = useContext(DBContext);
    const {shop} = useContext(ShopContext);
    const { t } = useTranslation();

    const [tableLimits, setTableLimits] = useState<number>(100);
    const [shopFilter, setShopFilter] = useState<string>();
    const [searchFilter, setSearchFilter] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<boolean>(false);
    const [typeFilter, setTypeFilter] = useState<string|undefined>();

    const [completionForms, setCompletionForms] = useState<ServiceCompleteData[]>(dbContext?.data.completions || []);
    const completionFormsById = completionForms
        .reduce((all, currentValue)=> {
            all[currentValue.id] = currentValue;
            return all
        }, {} as Record<string, ServiceCompleteData>);

    const filterItems = (shopFilter: string|undefined, searchFilter:string, onlyActive?: boolean, typeFilter?: string) => {
        let items = dbContext?.data.services ?? [];

        if (shopFilter) {
            items = items.filter(item => item.service_name === shopFilter);
        }

        if (searchFilter) {
            const lowerCaseFilter = searchFilter.toLowerCase();

            items = items
                .filter(item => item.client_name?.toLowerCase().includes(lowerCaseFilter) ||
                    item.client_phone?.toLowerCase().includes(lowerCaseFilter))
        }

        if (onlyActive) {
            items = items.filter(item => !completionFormsById[item.id + '_cd'] && item.serviceStatus !== 'status_delivered')
        }

        if (typeFilter) {
            items = items.filter(item => (item.type && item.type.includes(typeFilter)));
        }

        items.sort((a, b) => (b.docUpdated ?? 0) - (a.docUpdated ?? 0));

        return items;
    };

    const [servicedItems, setServicedItems] = useState<ServiceData[]>(filterItems(shopFilter, searchFilter));

    const availableTypes: string[] = useMemo(() => {
        return servicedItems.reduce((types, item) => {
            (item.type || '').split(',').forEach(item => {
                if (item.trim() && !types.includes(item)) {
                    types.push(item);
                }
            });
            return types;
        }, [] as string[])
        // eslint-disable-next-line
    }, []);

    const [modalTemplate, setModalTemplate] = useState<ServiceData|null>(null);
    const [completedModalTemplate, setCompletedModalTemplate] = useState<ServiceCompleteData|null>(null);
    const [printViewData, setPrintViewData] = useState<{
        data: PDFData,
        signature?: string,
        printNow?: boolean
    }|null>(null);

    const [selectedServiceLines, setSelectedServiceLines] = useState<{
        id: string,
        name: string,
        completed?: boolean,
        table: TableLineType[]}|null>(null);


    const searchItems = (filterBy: string) => {
        setSearchFilter(filterBy)
        setServicedItems(filterItems(shopFilter, filterBy, activeFilter, typeFilter));
    };

    const selectShopFilter = (shop: string) => {
        setShopFilter(shop)
        setServicedItems(filterItems(shop, searchFilter, activeFilter, typeFilter));
    };

    const selectActiveFilter = (activeOnly: boolean) => {
        setActiveFilter(activeOnly);
        setServicedItems(filterItems(shopFilter, searchFilter, activeOnly, typeFilter));
    };

    const selectTypeFilter = (typeFilter: string) => {
        setTypeFilter(typeFilter)
        setServicedItems(filterItems(shopFilter, searchFilter, activeFilter, typeFilter));
    }

    const deleteServiceHistoryFor = async (item: ServiceData) => {
        if (item.id && window.confirm(t('Are you sure you wish to delete this Service and all of its history?'))) {

            const completions = completionForms?.filter((c) => c.service_id === item.id);
            if (completions.length) {
                let completionUpdates;
                for (const element of completions) {
                    completionUpdates = await dbContext?.removeData('completions', element.id) as ServiceCompleteData[];
                }
                if (completionUpdates) {
                    setCompletionForms(completionUpdates);
                }
            }

            const history = (dbContext?.data.archive || []).filter(a => a.docParent === item.id);
            if (history.length) {
                for (let i = 0; i < history.length; i++) {
                    await dbContext?.removeData('archive', history[i].id).catch(e => {
                        console.error(e);
                    })
                }
            }

            const servicedItems = await dbContext?.removeData('services', item.id) as ServiceData[];
            setServicedItems(servicedItems);
        }
    };

    const saveServiceItem = async (serviceData: ServiceData, archive = true) => {
        let updatedItems = await dbContext?.updateLatest('services') as ServiceData[];
        // validate id
        const currentItem = updatedItems.find(item => item.id === serviceData.id);
        if (currentItem?.client_name && serviceData.client_name &&
            !compareNormalizedStrings(currentItem.client_name, serviceData.client_name)) {

            if (confirm(t('Do you want to save this item as a new service form?'))) {
                // if there is an item with different client names, we regenerate the id
                serviceData.id = generateServiceId(updatedItems, shop?.id, dbContext?.data.shops, dbContext?.data.deleted)
            }
        }

        updatedItems = await dbContext?.setData('services', serviceData, archive) as ServiceData[];
        setServicedItems(updatedItems);
        setModalTemplate(null);
    };

    const saveCompletionForm = async (serviceCompleteData: ServiceCompleteData) => {
        if (!serviceCompleteData?.service_id) {
            return false;
        }

        const updatedItems = await dbContext?.setData('completions', serviceCompleteData)
            .catch((e: Error) => {
                console.error(e.message);
                alert('Server Error');
            })

        if (updatedItems) {
            setCompletionForms(updatedItems as ServiceCompleteData[]);
            setCompletedModalTemplate(null);
        }
    };

    const tableLines = servicedItems.map(item => {
        const type = item.type?.startsWith(',') ? item.type.substring(1) : (item.type || '');
        const serviceCompletion = completionFormsById[item.id + '_cd'];

        return [
            <span key={'status_' + item.id} className={serviceCompletion ? 'status_delivered' : item.serviceStatus}>{item.id}</span>,
            item.client_name,
            type.replace(/,/g, ', '),
            item.expected_cost || 0,
            item.service_name ?? '?',
            item.date || '',
            TableViewActions({
                onOpen: () => {
                    if (selectedServiceLines && selectedServiceLines.id === item.id) {
                        setSelectedServiceLines(null);
                        return;
                    }
                    const completionFormId = item.id + '_cd';
                    const serviceForm = item;
                    const completionForm = completionForms.find((completionForm) => completionForm.id === completionFormId);

                    const list = (dbContext?.data.archive || [])
                        .filter(data => data.docParent === serviceForm.id);


                    list.sort((b, a) => {
                        if (!b.docUpdated || !a.docUpdated) {
                            return 0;
                        }
                        return b.docUpdated - a.docUpdated;
                    });


                    if (!list.find(d => d.docUpdated === serviceForm.docUpdated)) {
                        list.push(serviceForm);
                    }
                    if (completionForm) {
                        list.push(completionForm);
                    }
                    setSelectedServiceLines({
                        id: item.id,
                        name: item.client_name || item.id,
                        completed: !! completionForm,
                        table: list.map((data, index) => {
                            const serviceData = data as ServiceData;

                            let version = index+1;
                            let name = t('Service Form');
                            const isCompletionForm = completionForm && index === list.length - 1;
                            if (isCompletionForm) {
                                version = 1;
                                name = t('Service Completion Form');
                            }

                            return [index+1, name, version, serviceData.docUpdated ?
                                toUserDateTime(new Date(serviceData.docUpdated)) :
                                serviceData.date,
                                TableViewActions({
                                    onPrint: () => {
                                        if (isCompletionForm) {
                                            setPrintViewData(completionFormToPrintable(data,  t, true));
                                        } else {
                                            setPrintViewData(serviceDataToPrintable(data, dbContext?.data.settings || {} as SettingsItems, t, true));
                                        }

                                        // const docType = data.docType || (isCompletionForm ? 'completions' : 'services');
                                        //
                                        // window.open(`?page=print&id=${data.id}&type=${docType}&print=true`, '_blank')
                                    },
                                    onOpen: () => {
                                        if (isCompletionForm) {
                                            setPrintViewData(completionFormToPrintable(data,  t, true));
                                        } else {
                                            setPrintViewData(serviceDataToPrintable(data, dbContext?.data.settings || {} as SettingsItems, t, false));
                                        }
                                        // const docType = data.docType || (isCompletionForm ? 'completions' : 'services');
                                        //
                                        // window.open(`?page=print&id=${data.id}&type=${docType}`, '_blank');

                                    }
                                })];
                        })
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    },
                onEdit: () => {
                    setModalTemplate({...item, onUpdate: true});
                    if (selectedServiceLines) {
                        setSelectedServiceLines(null);
                    }
                },
                onRemove: () => deleteServiceHistoryFor(item)
            })
        ];
    });

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    const noModalActive = !modalTemplate && !completedModalTemplate && !printViewData;

    return (
        <>
            {noModalActive && <PageHead title={t('Serviced Items')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: () => {
                        const id = generateServiceId(
                            servicedItems,
                            shop?.id,
                            dbContext?.data.shops,
                            dbContext?.data.deleted);

                        setModalTemplate(modalTemplate ? null : {
                            id: id,
                            serviceStatus: 'status_accepted',
                            date: new Date().toISOString().split('T')[0],
                            service_address: shop?.address || '',
                            service_name: shop?.name || '',
                            service_email: shop?.email || '',
                            docType: 'services'
                        });
                    }
                }
            ]}
                onSearch={searchItems}
                tableLimits={tableLimits}
                setTableLimits={setTableLimits}
                shopFilter={shopFilter}
                setShopFilter={selectShopFilter}
                activeFilter={activeFilter}
                setActiveFilter={selectActiveFilter}
            >
                <div className='w-30 select-no-first'>
                    <StyledSelect
                        options={[
                            {
                                name: t('All type'), value:''
                            },
                            ...availableTypes.map(type => ({value: type, name: type}))
                        ]}
                        name='type'
                        value={typeFilter || undefined}
                        defaultLabel={t('All type')}
                        onSelect={(e) => selectTypeFilter((e.target as HTMLSelectElement).value)}
                        label={false}
                        compact={true}
                    />

                </div>
            </PageHead>}

            <div className={"relative flex justify-center w-full m-auto"}>
                <div className={"mb-2 mt-1"}>
                    <ServiceModal
                        onClose={() => setModalTemplate(null)}
                        onSave={(item: ServiceData) => saveServiceItem(item)}
                        setService={(item: ServiceData) => setModalTemplate(item)}
                        service={modalTemplate}
                        inPlace={true}
                        settings={dbContext?.data.settings}
                    />
                    <ServiceCompletionModal
                        onClose={() => setCompletedModalTemplate(null)}
                        onSave={(item: ServiceCompleteData) => saveCompletionForm(item)}
                        setFromData={(item: ServiceCompleteData) => setCompletedModalTemplate(item)}
                        formData={completedModalTemplate}
                        inPlace={true}
                    />

                    {printViewData && <PrintableVersionFrame
                        formData={printViewData}
                        onClose={() => setPrintViewData(null)}
                    />}

                    {selectedServiceLines && printViewData && <div className={"mb-8"}></div>}
                    {selectedServiceLines && <ListModal
                        title={t('List Documents: ') + (selectedServiceLines.name || selectedServiceLines.id)}
                        inPlace={true}
                        lines={selectedServiceLines.table}
                        buttons={
                        [
                            {
                                id: selectedServiceLines.completed ? 'completedListButton' : '',
                                onClick: () => {
                                    const item = servicedItems.find((item) => item.id === selectedServiceLines.id)
                                    if (!item) {
                                        return;
                                    }
                                    const completionFormId = item.id + '_cd';
                                    const completionForm = completionForms.find((completionForm) => completionForm.id === completionFormId);
                                    const sourceItem = completionForm || item;

                                    if (!completionForm) {
                                        setCompletedModalTemplate({
                                            id: item.id + '_cd',
                                            service_id: item.id,
                                            service_date: item.date,
                                            date: new Date().toISOString().split('T')[0],
                                            service_address: sourceItem.service_address || shop?.address || '',
                                            service_name: sourceItem.service_name || shop?.name || '',
                                            service_email: sourceItem.service_email || shop?.email || '',
                                            client_name: sourceItem.client_name || '',
                                            client_email: sourceItem.client_email || '',
                                            client_phone: sourceItem.client_phone || '',
                                            type: sourceItem.type || '',
                                            accessories: sourceItem.accessories || '',
                                            repair_cost: item.expected_cost || '',
                                            guaranteed: sourceItem.guaranteed || 'no',
                                            description: sourceItem.description || '',
                                            repair_description: sourceItem.repair_description || '',
                                            docType: 'completions'
                                        });
                                        setSelectedServiceLines(null);
                                    } else {
                                        alert(t('You already completed the form'))
                                    }
                                },
                                value: t('Fill Completion Form')
                            },
                            {
                                onClick: () => setSelectedServiceLines(null),
                                value: t('Cancel')
                            }
                        ]
                        }
                        header={['#', t('Name'), t('Version'), t('Date'), t('Actions')]}></ListModal>}


                </div>
            </div>


            {noModalActive &&
                <div className='service-table self-center'>
                    <TableViewComponent
                        lines={tableLines}
                        tableLimits={tableLimits}
                        header={[
                            t('ID'),
                            t('Name'),
                            {
                                value: t('Type'),
                                type: 'text',
                                sortable: true,
                                editable: false
                            },
                            {
                                value: <span className="text-xxs">{t('Expected cost')}</span>,
                                type: 'number',
                                postFix: ' Ft',
                                sortable: true,
                                editable: false
                            },
                            {
                                value: t('Shop'),
                                type: 'text',
                                sortable: true,
                                editable: false
                            },
                            {
                                value: t('Date'),
                                type: 'text',
                                sortable: true,
                                editable: false
                            },
                            t('Actions')]}
                /></div>
            }

            <div className="relative flex justify-center w-full m-auto flex-1 no-print">
            </div>
        </>
    )
}

export default Service;
