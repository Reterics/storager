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
        const stLimitA = a.storage_limit && a.storage_limit[indexA];

        const storageB = b.storage && b.storage[indexB];
        const stLimitB = b.storage_limit && b.storage_limit[indexB];

        const warningA = !storageA || storageA < (stLimitA || 5);
        const warningB = !storageB || storageB < (stLimitB || 5);

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
