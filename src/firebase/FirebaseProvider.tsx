import {ReactNode, useEffect, useState} from "react";
import {FirebaseContextData, FirebaseContextDataType} from "../interfaces/firebase.ts";
import {firebaseCollections, getCollection} from "./BaseConfig.ts";
import {Shop, StoreItem} from "../interfaces/interfaces.ts";
import {FirebaseContext} from "./FirebaseContext.ts";


export const FirebaseProvider = ({children}: {
    children: ReactNode
}) => {

    const [ctxData, setCtxData] = useState<FirebaseContextData>({
        shops: [],
        items: [],
        parts: []
    });


    const getContextData = async () => {
        const shops = await getCollection(firebaseCollections.shops) as Shop[];
        const items = await getCollection(firebaseCollections.items) as StoreItem[];
        const parts = await getCollection(firebaseCollections.parts) as unknown[];
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
        void getContextData();
    }, []);

    return <FirebaseContext.Provider value={{
        data: ctxData,
        setData: updateContextData,
        use: use
    }}>{children}</FirebaseContext.Provider>;
};
