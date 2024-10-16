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
import PrintableVersionModal from "../components/modals/PrintableVersionModal.tsx";
import {PDFData} from "../interfaces/pdf.ts";
import ListModal from "../components/modals/ListModal.tsx";
import {serviceDataToPrintable} from "../utils/print.tsx";


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


    const addServiceItem = async (serviceData?: ServiceData, archive = true) => {
        const updatedItems = await dbContext?.setData('services', serviceData as ServiceData, archive) as ServiceData[];
        if (serviceData) {
            updatedItems.push(serviceData);
        }
        setServicedItems(updatedItems as ServiceData[]);
        setModalTemplate(null);
    };

    const saveCompletionForm = async (serviceCompleteData: ServiceCompleteData) => {
        if (!serviceCompleteData || !serviceCompleteData.service_id) {
            return;
        }

        const updatedItems = await dbContext?.setData('completions', serviceCompleteData as ServiceCompleteData);

        setCompletionForms(updatedItems as ServiceCompleteData[]);
        setCompletedModalTemplate(null);

        if (serviceCompleteData.service_id) {
            const serviceData = servicedItems.find(existingItem => existingItem.id === serviceCompleteData.service_id);
            if (serviceData) {
                serviceData.serviceStatus = "status_delivered";
                await addServiceItem(serviceData, false);
            }
        }
    };

    const tableLines = servicedItems.map(item => {

        let onEdit = undefined;

        const completionFormId = item.id + '_cd';
        const completionForm = completionForms.find((completionForm) => completionForm.id === completionFormId);

        if (!completionForm) {
            onEdit = () => {
                setModalTemplate({...item, onUpdate: true});
                if (selectedServiceLines) {
                    setSelectedServiceLines(null);
                }
            }
        }

        return [
            item.id,
            item.client_name,
            (item.type || '').split(',').join(', '),
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
                            if (completionForm && index === list.length - 1) {
                                version = 1;
                                name = t('Service Completion Form');
                            }


                            return [index+1, name, version, serviceData.docUpdated ?
                                new Date(serviceData.docUpdated).toISOString().split('.')[0].replace('T', ' ') :
                                serviceData.date,
                                TableViewActions({
                                    onPrint: () => {
                                        if (completionForm && index === list.length - 1) {
                                            alert('Not implemented');
                                        } else {
                                            setPrintViewData(serviceDataToPrintable(item, dbContext?.data.settings || {} as SettingsItems, t, true));
                                            // setSelectedServiceLines(null);
                                        }
                                    },
                                    onOpen: () => {
                                        if (completionForm && index === list.length - 1) {
                                            alert('Not implemented');
                                        } else {
                                            setPrintViewData(serviceDataToPrintable(item, dbContext?.data.settings || {} as SettingsItems, t, false));
                                            // setSelectedServiceLines(null);
                                        }
                                    }
                                })];
                        })
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    },
                onEdit: onEdit
            })
        ];
    });

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    return (
        <>
            {!printViewData && <PageHead title={t('Serviced Items')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: () => setModalTemplate(modalTemplate ? null : {
                        id: (servicedItems.length + 1).toString().padStart(5, '0'),
                        serviceStatus: 'status_accepted',
                        date: new Date().toISOString().split('T')[0],
                        service_address: shop?.address || '',
                        service_name: shop?.name || '',
                        service_email: shop?.email || '',
                    })
                }
            ]}/> }

            <div className={"relative flex justify-center w-full m-auto"}>
                <div className={"mb-2 mt-1"}>
                    <ServiceModal
                        onClose={() => setModalTemplate(null)}
                        onSave={(item: ServiceData) => addServiceItem(item)}
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

                    {printViewData && <PrintableVersionModal
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
                                            type: sourceItem.type,
                                            accessories: sourceItem.accessories || '',
                                            repair_cost: item.expected_cost,
                                            guaranteed: sourceItem.guaranteed || 'no',
                                            repair_description: sourceItem.repair_description || ''
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

            {!modalTemplate && !completedModalTemplate && !printViewData &&
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

            <div className="relative flex justify-center w-full m-auto mt-1 flex-1 no-print">
            </div>
        </>
    )
}

export default Service;
