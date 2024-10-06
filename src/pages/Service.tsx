import {useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {PageHead} from "../components/elements/PageHead.tsx";
import {ServiceCompleteData, ServiceData} from "../interfaces/interfaces.ts";
import ServiceModal from "../components/modals/ServiceModal.tsx";
import {collection, doc, setDoc} from "firebase/firestore";
import {db, firebaseCollections} from "../firebase/BaseConfig.ts";
import TableViewComponent, {TableViewActions} from "../components/elements/TableViewComponent.tsx";
import ServiceCompletionModal from "../components/modals/ServiceCompletionModal.tsx";
import {ShopContext} from "../store/ShopContext.tsx";


function Service() {
    const firebaseContext = useContext(DBContext);
    const {shop} = useContext(ShopContext);
    const { t } = useTranslation();

    const [servicedItems, setServicedItems] = useState<ServiceData[]>(firebaseContext?.data.services || []);
    const [completionForms] = useState<ServiceCompleteData[]>(firebaseContext?.data.completions || []);

    const [modalTemplate, setModalTemplate] = useState<ServiceData|null>(null);
    const [completedModalTemplate, setCompletedModalTemplate] = useState<ServiceCompleteData|null>(null);


    const addServiceItem = async (serviceData?: ServiceData) => {
        if (!serviceData) {
            console.error('There is no serviceData defined during saving')
            return;
        }

        let modelRef;

        if (serviceData.id) {
            // If item has an ID, update the existing document
            modelRef = doc(db, firebaseCollections.services, serviceData.id);
        } else {
            // Generate a new document reference with an auto-generated ID
            modelRef = doc(collection(db, firebaseCollections.services));
            serviceData.id = modelRef.id; // Assign the generated ID to your item
        }


        // Use setDoc with { merge: true } to update or create the document
        await setDoc(modelRef, serviceData, { merge: true }).catch(e => {
            console.error(e);
        });


        // Update  local state
        const updatedItems = [...servicedItems];
        const index = updatedItems.findIndex(existingItem => existingItem.id === serviceData.id);
        if (index !== -1) {
            updatedItems[index] = serviceData; // Update existing item
        } else {
            updatedItems.push(serviceData); // Add new item
        }
        setServicedItems(updatedItems);
        setModalTemplate(null);
    };

    const saveCompletionForm = async (serviceCompleteData: ServiceCompleteData) => {
        if (!serviceCompleteData || !serviceCompleteData.service_id) {
            return;
        }
    };
    // const tableKeyOrder = ['id', 'client_name', 'type', 'guaranteed', 'expected_cost', 'date'];

    const tableLines = servicedItems.map(item => {
        return [
            item.id,
            item.client_name,
            item.type || '',
            item.guaranteed || 'no',
            item.expected_cost || 0,
            item.date || '',
            TableViewActions({
                onPrint: () => {
                    // TODO: Print Service Data
                },
                onCode: () => {
                    const completionFormId = item.id + '_cd';
                    const completionForm = completionForms.find((completionForm) => completionForm.id === completionFormId);
                    if(!completionForm) {
                        setCompletedModalTemplate({
                            id: item.id + '_cd',
                            service_id: item.id,
                            service_date: item.date,
                            date: new Date().toISOString().split('T')[0],
                            service_address: shop?.address,
                            service_name: shop?.name,
                            service_email: shop?.email
                        });
                    } else {
                        // TODO: Print Data
                    }

                }
            })
        ];
    });

    return (
        <>
            <PageHead title={t('Serviced Items')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: () => setModalTemplate(modalTemplate ? null : {
                        id: (servicedItems.length + 1).toString().padStart(6, '0'),
                        serviceStatus: 'in_progress',
                        date: new Date().toISOString().split('T')[0],
                        service_address: shop?.address,
                        service_name: shop?.name,
                        service_email: shop?.email
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
                                        value: t('guaranteed'),
                                        type: 'text',
                                        sortable: true,
                                        editable: false
                                    },
                                    {
                                        value: t('Expected Cost'),
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

            <div className="relative flex justify-center w-full m-auto mt-1 flex-1">
            </div>
        </>
    )
}

export default Service;
