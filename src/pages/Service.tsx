import {useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {PageHead} from "../components/elements/PageHead.tsx";
import {ServiceData} from "../interfaces/interfaces.ts";
import ServiceModal from "../components/modals/ServiceModal.tsx";


function Service() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const firebaseContext = useContext(DBContext);
    const { t } = useTranslation();


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [servicedItems] = useState<unknown[]>([]);

    const [modalTemplate, setModalTemplate] = useState<ServiceData|null>(null)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const closeItem = (serviceData) => {
        // TODO: TBD
    };

    return (
        <>
            <PageHead title={t('Serviced Items')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: () => setModalTemplate(modalTemplate ? null : {
                        id: ''
                    })
                }
            ]}/>

            <div className="flex-1"></div>
            <div className="relative flex justify-center w-full m-auto mt-1">
                <ServiceModal
                    onClose={() => setModalTemplate(null)}
                    onSave={(item: ServiceData) => closeItem(item)}
                    setService={(item: ServiceData) => setModalTemplate(item)}
                    service={modalTemplate}
                    inPlace={true}
                />
            </div>
        </>
    )
}

export default Service;
