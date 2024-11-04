import {
    ServiceCompleteData,
    ServiceData,
    SettingsItems,
    Shop, ShopType,
    StoreItem,
    StorePart, StyledSelectOption,
    UserData
} from "./interfaces.ts";


export interface ContextData {
    shops: Shop[],
    items: StoreItem[],
    parts: StorePart[],
    services: ServiceData[],
    completions: ServiceCompleteData[],
    settings: SettingsItems,
    users: UserData[],
    currentUser?: UserData,
    archive: ContextDataValueType[],
    types: ShopType[],
    deleted: ContextDataValueType[]
}


export type ContextDataCollectionType = Shop[]|StoreItem[]|StorePart[]|ShopType[]|ServiceData[]|ServiceCompleteData[]|SettingsItems|UserData[]|UserData
export type ContextDataType = 'shops'|'items'|'parts'|'services'|'completions'|'settings'|'users'|'types'|'archive';
export type ContextDataValueType = Shop|StoreItem|StorePart|ServiceData|ServiceCompleteData|SettingsItems|UserData|ShopType;

export interface DBContextType {
    data: ContextData,
    refreshData: (key?: ContextDataType) => Promise<void>,
    setData: (key: ContextDataType, value: ContextDataValueType, archive?: boolean) =>  Promise<ContextDataCollectionType | null>,
    removeData: (key: ContextDataType, id: string) => Promise<ContextDataCollectionType | null>,
    restoreData: (id: string) => Promise<ContextDataCollectionType | null>,
    removePermanentData: (id: string) => Promise<ContextDataValueType[] | null>,
    refreshImagePointers: (array: StoreItem[] | StorePart[]) => Promise<void>
    uploadDataBatch: (key: ContextDataType, values: ContextDataValueType[]) =>  Promise<ContextDataCollectionType | null>,
    getType: (type: 'part'|'item'|'service', lang: 'hu'|'en') => StyledSelectOption[]
}

export interface CommonCollectionData {
    id: string,
    [key: string]: string | number | boolean | undefined
}

export interface KVCollectionStore {
    [key: string]: CommonCollectionData[]
}

export interface TTLData {
    [key: string]: number
}
