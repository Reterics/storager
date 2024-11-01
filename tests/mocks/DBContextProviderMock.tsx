import {DBContext} from '../../src/database/DBContext'
import {
    ContextData, ContextDataCollectionType, ContextDataType
} from "../../src/interfaces/firebase";
import {useState} from "react";
import {defaultContextData} from "./shopData";
import { vi } from 'vitest'
import {StyledSelectOption} from "../../src/interfaces/interfaces.ts";

const DBContextProviderMock = ({children, ctxDataOverride}:{
    children: React.ReactNode,
    ctxDataOverride?: ContextData
}) => {
    //const authContext = {user: currentUserMock};
    /*const shopContext = {
        shop: defaultShop,
        setShop: vi.fn()
    };*/

    const [ctxData, setCtxData] = useState<ContextData|null>(ctxDataOverride || defaultContextData);


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

    const removeData = async (key: ContextDataType, id: string): Promise<ContextDataCollectionType | null> => {
        if (ctxData && Array.isArray(ctxData[key]) && key !== 'settings') {
            const filteredData = ctxData[key].filter(item => item.id !== id);
            ctxData[key] = [...filteredData];

            setCtxData({
                ...ctxData,
            });
            return filteredData
        }

        return ctxData ? ctxData[key] : null;
    }

    const getType = (type: 'part'|'item'|'service', lang: 'hu'|'en' = 'hu'): StyledSelectOption[] => {
        if (ctxData && ctxData.types) {
            return ctxData.types
                .filter(t => t.category === type)
                .map(type => {
                    return {
                        "value": type.name || '',
                        "name": (type.translations? type.translations[lang] : type.name) || ''
                    };
                })
        }
        return [];
    }

    return (
        <DBContext.Provider value={{
            data: ctxData as ContextData,
            refreshData: vi.fn(),
            setData: vi.fn(),
            removeData: removeData,
            removePermanentData: vi.fn(),
            refreshImagePointers: vi.fn(),
            uploadDataBatch: vi.fn(),
            getType: getType
        }}>{children}</DBContext.Provider>
    )
}

export default DBContextProviderMock;
