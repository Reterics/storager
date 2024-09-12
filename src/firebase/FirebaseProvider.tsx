import {ReactNode, useEffect, useState} from "react";
import {FirebaseContextData, FirebaseContextDataType} from "../interfaces/firebase.ts";
import {firebaseCollections, getCollection} from "./BaseConfig.ts";
import {Shop, StoreItem} from "../interfaces/interfaces.ts";
import {FirebaseContext} from "./FirebaseContext.ts";
import PageLoading from "../components/PageLoading.tsx";


export const FirebaseProvider = ({children}: {
    children: ReactNode
}) => {

    const [ctxData, setCtxData] = useState<FirebaseContextData|null>(null);
    const [error, setError] = useState<Error | null>(null);

    const getContextData = async () => {
        const shops = await getCollection(firebaseCollections.shops).catch(setError) as Shop[];
        const items = await getCollection(firebaseCollections.items).catch(setError) as StoreItem[];
        const parts = await getCollection(firebaseCollections.parts).catch(setError) as unknown[];
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
    const use = (id: number, type: FirebaseContextDataType) => {
        // TODO: To be implemented
    };

    useEffect(() => {
        console.error('Load context data');
        void getContextData();
    }, []);

    return <FirebaseContext.Provider value={{
        data: ctxData as FirebaseContextData,
        setData: updateContextData,
        use: use
    }}>
        {!error && ctxData && children}
        {!error && !ctxData && <PageLoading/>}
        {error && <div>Error: {error.message}</div>}
    </FirebaseContext.Provider>;
};
