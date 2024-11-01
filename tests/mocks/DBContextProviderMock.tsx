import {DBContext} from '../../src/database/DBContext'
import {
    ContextData
} from "../../src/interfaces/firebase";
import {useState} from "react";
import {defaultContextData} from "./shopData";
import { vi } from 'vitest'

const DBContextProviderMock = ({children, ctxDataOverride}:{
    children: React.ReactNode,
    ctxDataOverride?: ContextData
}) => {
    //const authContext = {user: currentUserMock};
    /*const shopContext = {
        shop: defaultShop,
        setShop: vi.fn()
    };*/

    const [ctxData] = useState<ContextData|null>(ctxDataOverride || defaultContextData);


    /*const setData = async (key: ContextDataType, value: ContextDataValueType, archive?: boolean): Promise<ContextDataCollectionType | null> => {
        if (ctxData && ctxData[key] && key !== 'settings') {
            const indexOf = ctxData[key].findIndex(data => data.id === value.id);
            if (indexOf !== -1) {
                if (archive) {
                    ctxData.archive.push({...ctxData[key][indexOf]})
                }

                ctxData[key][indexOf] = value;
            } else {
                ctxData[key].push(value);
            }
        }
        setCtxData(ctxData ? {
            ...ctxData,
        } : null);

        return ctxData ? ctxData[key] : null;
    }*/

    return (
        <DBContext.Provider value={{
            data: ctxData as ContextData,
            refreshData: vi.fn(),
            setData: vi.fn(),
            removeData: vi.fn(),
            removePermanentData: vi.fn(),
            refreshImagePointers: vi.fn(),
            uploadDataBatch: vi.fn(),
            getType: vi.fn()
        }}>{children}</DBContext.Provider>
    )
}

export default DBContextProviderMock;
