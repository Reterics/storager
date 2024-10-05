import {useContext, useState} from "react";
import {DBContext} from "../database/DBContext.ts";
import {useTranslation} from "react-i18next";
import {PageHead} from "../components/elements/PageHead.tsx";
import {BsFillPlusCircleFill} from "react-icons/bs";


function Parts() {
    const firebaseContext = useContext(DBContext);
    const { t } = useTranslation();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [parts, setParts] = useState<unknown[]>(firebaseContext?.data.parts || []);


    return (
        <>
            <PageHead title={t('Parts')} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick:() => console.log('To be implemented')
                }
            ]}/>
        </>
    )

}

export default Parts;
