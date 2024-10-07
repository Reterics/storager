import {ServiceCompleteData, ServiceData, SettingsItems, Shop, StoreItem, StorePart, UserData} from "./interfaces.ts";


export interface ContextData {
    shops: Shop[],
    items: StoreItem[],
    parts: StorePart[],
    services: ServiceData[],
    completions: ServiceCompleteData[],
    settings: SettingsItems,
    users: UserData[],
    currentUser?: UserData
}


export type ContextDataCollectionType = Shop[]|StoreItem[]|StorePart[]|ServiceData[]|ServiceCompleteData[]|SettingsItems|UserData[]|UserData
export type ContextDataType = 'shop'|'item'|'part'|'services'|'completions'|'settings';
export type ContextDataValueType = Shop|StoreItem|StorePart|ServiceData|ServiceCompleteData|SettingsItems|UserData;

export interface DBContextType {
    data: ContextData,
    setData: (key: 'shops'|'items'|'parts'|'services'|'completions'|'settings'|'users', value: ContextDataValueType) =>  Promise<ContextDataCollectionType | null>,
    use: (id: number, type: ContextDataType) => void,
    refreshImagePointers: (array: StoreItem[] | StorePart[]) => Promise<void>
}
