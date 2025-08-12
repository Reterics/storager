import {DBContext} from '../../src/database/DBContext'
import type {
    ContextData, ContextDataCollectionType, ContextDataValueType
} from "../../src/interfaces/firebase";
import {defaultContextData} from "./shopData";
import type {Mock} from 'vitest';
import { vi} from 'vitest'
import type {StyledSelectOption} from "../../src/interfaces/interfaces.ts";

const DBContextProviderMock = ({children, ctxDataOverride,
    refreshData= vi.fn(),
    setData= vi.fn(),
    removeData= vi.fn(),
    restoreData= vi.fn(),
    removePermanentData= vi.fn(),
    removePermanentDataList= vi.fn(),
    refreshImagePointers= vi.fn(),
    uploadDataBatch= vi.fn(),
    updateLatest = vi.fn(),
}:{
    children: React.ReactNode,
    ctxDataOverride?: ContextData,
    refreshData?: Mock<()=>Promise<void>>,
    setData?: Mock<()=>Promise<ContextDataCollectionType | null>>,
    removeData?: Mock<()=>Promise<ContextDataValueType[] | null>>,
    restoreData?: Mock<()=>Promise<ContextDataValueType[] | null>>,
    removePermanentData?: Mock<()=>Promise<ContextDataValueType[] | null>>,
    removePermanentDataList?: Mock<()=>Promise<ContextDataValueType[] | null>>,
    refreshImagePointers?: Mock<()=>Promise<void>>,
    uploadDataBatch?: Mock<()=>Promise<ContextDataCollectionType | null>>,
    updateLatest?: Mock<()=>Promise<ContextDataCollectionType | null>>,
}) => {
    //const authContext = {user: currentUserMock};
    /*const shopContext = {
        shop: defaultShop,
        setShop: vi.fn()
    };*/

    const ctxData = ctxDataOverride || defaultContextData;


    const getType = (type: 'part'|'item'|'service', lang: 'hu'|'en' = 'hu'): StyledSelectOption[] => {
        if (ctxData.types) {
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
            refreshData: refreshData,
            setData: setData,
            removeData: removeData,
            restoreData: restoreData,
            removePermanentData: removePermanentData,
            removePermanentDataList: removePermanentDataList,
            refreshImagePointers: refreshImagePointers,
            uploadDataBatch: uploadDataBatch,
            getType: getType,
            updateLatest: updateLatest
        }}>{children}</DBContext.Provider>
    )
}

export default DBContextProviderMock;
