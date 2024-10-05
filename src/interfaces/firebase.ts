import {Shop, StoreItem} from "./interfaces.ts";


export interface ContextData {
    shops: Shop[],
    items: StoreItem[],
    parts: unknown[]
}

export type ContextDataType = 'shop'|'item'|'part';

export interface DBContextType {
    data: ContextData,
    setData: (key: string, value: unknown) => void,
    use: (id: number, type: ContextDataType) => void
}
