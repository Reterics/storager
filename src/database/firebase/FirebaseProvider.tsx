import {ReactNode, useEffect, useState} from "react";
import {ContextDataType, ContextData} from "../../interfaces/firebase.ts";
import {firebaseCollections, getCollection} from "../../firebase/BaseConfig.ts";
import {Shop, StoreItem} from "../../interfaces/interfaces.ts";
import PageLoading from "../../components/PageLoading.tsx";
import {getFileURL} from "../../firebase/storage.ts";
import {DBContext} from "../DBContext.ts";


export const FirebaseProvider = ({children}: {
    children: ReactNode
}) => {

    const [ctxData, setCtxData] = useState<ContextData|null>(null);
    const [error, setError] = useState<Error | null>(null);

    const getContextData = async () => {
        const shops = await getCollection(firebaseCollections.shops).catch(setError) as Shop[];
        const items = await getCollection(firebaseCollections.items).catch(setError) as StoreItem[];
        const parts = await getCollection(firebaseCollections.parts).catch(setError) as unknown[];

        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].name && items[i].image && items[i].image?.startsWith('screenshots/')) {
                    items[i].image = await getFileURL(items[i].image || '');
                }
            }
        }

        setCtxData({
            shops,
            items,
            parts,
        })
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateContextData = async (key: string, value: unknown)=> {
        // TODO: To be implemented
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const use = (id: number, type: ContextDataType) => {
        // TODO: To be implemented
    };

    useEffect(() => {
        console.error('Load context data');
        void getContextData();
    }, []);

    return <DBContext.Provider value={{
        data: ctxData as ContextData,
        setData: updateContextData,
        use: use
    }}>
        {!error && ctxData && children}
        {!error && !ctxData && <PageLoading/>}
        {error && <div>Error: {error.message}</div>}
    </DBContext.Provider>;
};
