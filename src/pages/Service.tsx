import {useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {PageHead} from "../components/elements/PageHead.tsx";
import {ServiceCompleteData, ServiceData} from "../interfaces/interfaces.ts";
import ServiceModal from "../components/modals/ServiceModal.tsx";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import ServiceCompletionModal from "../components/modals/ServiceCompletionModal.tsx";
import {ShopContext} from "../store/ShopContext.tsx";
import UnauthorizedComponent from "../components/Unauthorized.tsx";


function Service() {
    const dbContext = useContext(DBContext);
    const {shop} = useContext(ShopContext);
    const { t } = useTranslation();

    const [servicedItems, setServicedItems] = useState<ServiceData[]>(dbContext?.data.services || []);
    const [completionForms, setCompletionForms] = useState<ServiceCompleteData[]>(dbContext?.data.completions || []);

    const [modalTemplate, setModalTemplate] = useState<ServiceData|null>(null);
    const [completedModalTemplate, setCompletedModalTemplate] = useState<ServiceCompleteData|null>(null);


    const addServiceItem = async (serviceData?: ServiceData) => {
        const updatedItems = await dbContext?.setData('services', serviceData as ServiceData);

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
                // TODO: TBD
                serviceData.serviceStatus = "status_delivered";
                await addServiceItem(serviceData);
            }
        }
    };

    const tableLines = servicedItems.map(item => {
        return [
            item.id,
            item.client_name,
            (item.type || '').split(',').join(', '),
            t(item.serviceStatus || 'status_accepted'),
            t(item.guaranteed || 'no'),
            item.expected_cost || 0,
            item.date || '',
            TableViewActions({
                onEdit: () => {
                    setModalTemplate({...item, onUpdate: true})
                },
                onPrint: () => {
                    // TODO: Print Service Data
                },
                onCode: () => {
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
                    } else {
                        alert(t('You already completed the form'))
                    }
                }
            })
        ];
    });

    if (!dbContext?.data.currentUser) {
        return <UnauthorizedComponent />;
    }

    return (
        <>
            <PageHead title={t('Serviced Items')} buttons={[
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
            ]}/>

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
                </div>
            </div>

            {!modalTemplate && !completedModalTemplate &&
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

            <div className="relative flex justify-center w-full m-auto mt-1 flex-1">
            </div>
        </>
    )
}

export default Service;
