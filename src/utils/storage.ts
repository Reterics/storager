import {StoreItem, StorePart} from "../interfaces/interfaces.ts";

export const getShopIndex = (item: StoreItem|StorePart, shopId?: string) => {
    if (item.shop_id && shopId) {
        return item.shop_id.indexOf(shopId);
    }
    return -1.
};

export const sortItemsByWarn = (items: StoreItem[]|StorePart[], shopId?: string) => {
    const warnings: string[] = [];
    items.sort((a:StoreItem|StorePart, b:StoreItem|StorePart) => {
        const indexA = getShopIndex(a, shopId);
        const indexB = getShopIndex(b, shopId);

        const storageA = a.storage && a.storage[indexA];
        const stLimitA = a.storage_limit &&
            (a.storage_limit[indexA] || a.storage_limit[indexA] === 0) ? Number(a.storage_limit[indexA]) : 5;

        const storageB = b.storage && b.storage[indexB];
        const stLimitB = b.storage_limit &&
            (b.storage_limit[indexB] || b.storage_limit[indexB] === 0) ? Number(b.storage_limit[indexB]) : 5;

        const warningA = storageA === undefined || Number(storageA) < (stLimitA);
        const warningB = storageB === undefined || Number(storageB) < (stLimitB);

        if (warningA && !warnings.includes(a.id)) {
            warnings.push(a.id);
        }

        if (warningB && !warnings.includes(b.id)) {
            warnings.push(a.id);
        }

        return warningA && !warningB ? -1 : 1;
    });

    return warnings;
};
