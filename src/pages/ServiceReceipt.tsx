import {PageHead} from "../components/elements/PageHead.tsx";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {useContext, useState} from "react";
import {FirebaseContext} from "../firebase/FirebaseContext.ts";
import {useTranslation} from "react-i18next";


function ServiceReceipt() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const firebaseContext = useContext(FirebaseContext);
    const { t } = useTranslation();


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [servicedItems] = useState<unknown[]>([]);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [editMode, setEditMode] = useState(false);

    const index = 1;
    const date = new Date();

    return (
        <>
            <PageHead title={t('ServiceReceipt')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick:() => console.log('To be implemented')
                }
            ]}/>

            <div>
                Number: {String(index).padStart(6, '0')}
                Date: {date.toLocaleString()}

                <h3>Client</h3>
                Name:
                Phone:
                Email:

                <h3>Service</h3>
                Name:
                Address:
                Email:

                <h3>Item and service details</h3>
                Type:
                Description:
                Received Accessories:
                Guaranteed:
                Repair description:
                Expected cost:
                Note:


                <p>Appendix</p>

                Signature box

                Download PDF button
            </div>
        </>
    )
}

export default ServiceReceipt;
