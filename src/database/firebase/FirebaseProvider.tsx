import {ReactNode, useEffect, useState} from "react";
import {ContextDataType, ContextData} from "../../interfaces/firebase.ts";
import {firebaseCollections, getCollection} from "../../firebase/BaseConfig.ts";
import {
    ServiceCompleteData,
    ServiceData,
    SettingsItems,
    Shop,
    StoreItem,
    StorePart
} from "../../interfaces/interfaces.ts";
import PageLoading from "../../components/PageLoading.tsx";
import {getFileURL} from "../../firebase/storage.ts";
import {DBContext} from "../DBContext.ts";


export const FirebaseProvider = ({children}: {
    children: ReactNode
}) => {

    const [ctxData, setCtxData] = useState<ContextData|null>(null);
    const [error, setError] = useState<Error | null>(null);

    const refreshImagePointers = async (array: StoreItem[]|StorePart[]) => {
        if (Array.isArray(array)) {
            for (let i = 0; i < array.length; i++) {
                if (array[i].name && array[i].image && array[i].image?.startsWith('screenshots/')) {
                    array[i].image = await getFileURL(array[i].image || '');
                }
            }
        }
    };

    const getContextData = async () => {
        const shops = await getCollection(firebaseCollections.shops).catch(setError) as Shop[];
        const items = await getCollection(firebaseCollections.items).catch(setError) as StoreItem[];
        const parts = await getCollection(firebaseCollections.parts).catch(setError) as StorePart[];
        const services = await getCollection(firebaseCollections.services).catch(setError) as ServiceData[];
        const completions = await getCollection(firebaseCollections.completions).catch(setError) as ServiceCompleteData[];
        const settings = await getCollection(firebaseCollections.settings).catch(setError) as SettingsItems[];

        await refreshImagePointers(items);
        await refreshImagePointers(parts);

        setCtxData({
            shops,
            items,
            parts,
            services,
            completions,
            settings: settings[0]
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
        use: use,
        refreshImagePointers:refreshImagePointers
    }}>
        {!error && ctxData && children}
        {!error && !ctxData && <PageLoading/>}
        {error && <div>Error: {error.message}</div>}
    </DBContext.Provider>;
};
