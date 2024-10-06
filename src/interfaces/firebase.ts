import {ServiceCompleteData, ServiceData, SettingsItems, Shop, StoreItem, StorePart} from "./interfaces.ts";


export interface ContextData {
    shops: Shop[],
    items: StoreItem[],
    parts: StorePart[],
    services: ServiceData[],
    completions: ServiceCompleteData[],
    settings: SettingsItems
}

export type ContextDataType = 'shop'|'item'|'part'|'services'|'completions'|'settings';

export interface DBContextType {
    data: ContextData,
    setData: (key: string, value: unknown) => void,
    use: (id: number, type: ContextDataType) => void,
    refreshImagePointers: (array: StoreItem[] | StorePart[]) => Promise<void>
}
