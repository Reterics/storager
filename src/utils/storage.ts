import {StorageInfo, StoreItem, StorePart} from "../interfaces/interfaces.ts";

export const getShopIndex = (item: StoreItem|StorePart, shopId?: string) => {
    if (item.shop_id && shopId) {
        return item.shop_id.indexOf(shopId);
    }
    return -1;
};

export const extractStorageInfo = (item: StoreItem|StorePart, shopId?: string): StorageInfo => {
    const shopIndex = getShopIndex(item, shopId);
    const storage = item.storage && item.storage[shopIndex];
    const stLimit = item.storage_limit &&
    (item.storage_limit[shopIndex] || item.storage_limit[shopIndex] === 0) ? Number(item.storage_limit[shopIndex]) : 5;

    return {
        shopIndex: shopIndex,
        storage: Number(storage || 0),
        storageLimit: stLimit,
        lowStorageAlert: storage === undefined || Number(storage) < stLimit
    }
}

export const sortItemsByWarn = (items: StoreItem[]|StorePart[], shopId?: string) => {
    const warnings: string[] = [];
    items.sort((a:StoreItem|StorePart, b:StoreItem|StorePart) => {
        const warningA = extractStorageInfo(a, shopId).lowStorageAlert;
        const warningB = extractStorageInfo(b, shopId).lowStorageAlert;

        if (warningA && !warnings.includes(a.id)) {
            warnings.push(a.id);
        }

        if (warningB && !warnings.includes(b.id)) {
            warnings.push(b.id);
        }

        return warningA && !warningB ? -1 : 1;
    });

    return warnings;
};
