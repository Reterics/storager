import {useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {BsFillPlusCircleFill} from "react-icons/bs";
import {PageHead} from "../components/elements/PageHead.tsx";


function Service() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const firebaseContext = useContext(DBContext);
    const { t } = useTranslation();


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [settingsItems] = useState<unknown[]>([]);


    return (
        <>
            <PageHead title={t('Settings')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick:() => console.log('To be implemented -> Save Button')
                }
            ]}/>
        </>
    )
}

export default Service;
