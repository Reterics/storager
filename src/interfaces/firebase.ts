import {Shop, StoreItem} from "./interfaces.ts";


export interface FirebaseContextData {
    shops: Shop[],
    items: StoreItem[],
    parts: unknown[]
}

export type FirebaseContextDataType = 'shop'|'item'|'part';

export interface FirebaseContextType {
    data: FirebaseContextData,
    setData: (key: string, value: unknown) => void,
    use: (id: number, type: FirebaseContextDataType) => void
}
