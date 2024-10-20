import {
    ServiceCompleteData,
    ServiceData,
    SettingsItems,
    Shop, ShopType,
    StoreItem,
    StorePart,
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
    types: ShopType[]
}


export type ContextDataCollectionType = Shop[]|StoreItem[]|StorePart[]|ShopType[]|ServiceData[]|ServiceCompleteData[]|SettingsItems|UserData[]|UserData
export type ContextDataType = 'shops'|'items'|'parts'|'services'|'completions'|'settings'|'users'|'types';
export type ContextDataValueType = Shop|StoreItem|StorePart|ServiceData|ServiceCompleteData|SettingsItems|UserData|ShopType;

export interface DBContextType {
    data: ContextData,
    setData: (key: ContextDataType, value: ContextDataValueType, archive?: boolean) =>  Promise<ContextDataCollectionType | null>,
    removeData: (key: ContextDataType, id: string) => Promise<ContextDataCollectionType | null>,
    refreshImagePointers: (array: StoreItem[] | StorePart[]) => Promise<void>
}

export interface CommonCollectionData {
    id: string,
    [key: string]: string | number | undefined
}

export interface KVCollectionStore {
    [key: string]: CommonCollectionData[]
}
