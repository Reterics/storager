import {DBContext} from '../../src/database/DBContext'
import {
    ContextData, ContextDataCollectionType, ContextDataValueType
} from "../../src/interfaces/firebase";
import {defaultContextData} from "./shopData";
import {Mock, vi} from 'vitest'
import {StyledSelectOption} from "../../src/interfaces/interfaces.ts";

const DBContextProviderMock = ({children, ctxDataOverride,
    refreshData= vi.fn(),
    setData= vi.fn(),
    removeData= vi.fn(),
    restoreData= vi.fn(),
    removePermanentData= vi.fn(),
    refreshImagePointers= vi.fn(),
    uploadDataBatch= vi.fn()
}:{
    children: React.ReactNode,
    ctxDataOverride?: ContextData,
    refreshData?: Mock<()=>Promise<void>>,
    setData?: Mock<()=>Promise<ContextDataCollectionType | null>>,
    removeData?: Mock<()=>Promise<ContextDataValueType[] | null>>,
    restoreData?: Mock<()=>Promise<ContextDataValueType[] | null>>,
    removePermanentData?: Mock<()=>Promise<ContextDataValueType[] | null>>,
    refreshImagePointers?: Mock<()=>Promise<void>>,
    uploadDataBatch?: Mock<()=>Promise<ContextDataCollectionType | null>>,
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
            refreshImagePointers: refreshImagePointers,
            uploadDataBatch: uploadDataBatch,
            getType: getType
        }}>{children}</DBContext.Provider>
    )
}

export default DBContextProviderMock;
