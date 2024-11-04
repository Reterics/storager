import {ChangeEvent, SyntheticEvent} from "react";
import {StoreItem, StorePart} from "../interfaces/interfaces.ts";
import {getShopIndex} from "./storage.ts";



export const changeStoreType = (
    e: ChangeEvent<HTMLInputElement>|SyntheticEvent<HTMLSelectElement>,
    key: string,
    item: StoreItem|StorePart|null,
    shopId?: string,
    ) => {
    const value = e.currentTarget ? e.currentTarget.value : (e.target as HTMLInputElement).value;

    let obj: StoreItem|StorePart;
    if (item) {
        if (!['storage_limit', 'shop_id', 'storage'].includes(key)) {
            obj = {
                ...item,
                [key]: value
            };
        } else {
            const storeKey = key as 'storage_limit'|'shop_id'|'storage';
            obj = {
                ...item,
                [key]: item?.[storeKey] || []
            };

            if (!Array.isArray(obj[storeKey])) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                obj[storeKey] = [obj[storeKey]]
            }
            const shopIndex = item ? getShopIndex(item, shopId) : -1;
            if (obj[storeKey]) {
                obj[storeKey][shopIndex] = value;
            }
        }
        return obj;
    }

    return null;
};

