import {useContext, useState} from "react";
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


function Service() {
    const dbContext = useContext(DBContext);
    const {shop} = useContext(ShopContext);
    const { t } = useTranslation();

    const [servicedItems, setServicedItems] = useState<ServiceData[]>(dbContext?.data.services || []);
    const [completionForms, setCompletionForms] = useState<ServiceCompleteData[]>(dbContext?.data.completions || []);

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

    const filterItems = (filterBy: string) => {
        if (!filterBy) {
            setServicedItems(dbContext?.data.services || []);
        } else {
            const lowerCaseFilter = filterBy.toLowerCase();
            setServicedItems((dbContext?.data.services || []).filter(item => item.client_name?.toLowerCase().includes(lowerCaseFilter) || item.client_phone?.toLowerCase().includes(lowerCaseFilter)))
        }
    };

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
        return [
            item.id,
            item.client_name,
            type.replace(/,/g, ', '),
            t(item.serviceStatus || 'status_accepted'),
            t(item.guaranteed || 'no'),
            item.expected_cost || 0,
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
            ]} onSearch={filterItems}/>}

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
                <TableViewComponent lines={tableLines}
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
                                            value: t('status'),
                                            type: 'text',
                                            sortable: true,
                                            editable: false
                                        },
                                        {
                                            value: t('Guaranteed'),
                                            type: 'text',
                                            sortable: true,
                                            editable: false
                                        },
                                        {
                                            value: t('Expected cost'),
                                            type: 'number',
                                            postFix: ' Ft',
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
                />
            }

            <div className="relative flex justify-center w-full m-auto flex-1 no-print">
            </div>
        </>
    )
}

export default Service;
