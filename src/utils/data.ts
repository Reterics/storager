import {ServiceData, Shop} from "../interfaces/interfaces.ts";
import {ContextDataValueType} from "../interfaces/firebase.ts";


export const toUserDateTime = (date: Date) => {
    const datePart = date.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const timePart = date.toLocaleTimeString('hu-HU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return `${datePart} ${timePart}`;
}


export const generateServiceId = (
    servicedItems: ServiceData[],
    currentShopId?: string,
    shops: Shop[] = [],
    deleted: ContextDataValueType[] = []) => {

    const shopIndex = Math.max(0, shops.findIndex(s => s.id === currentShopId));
    const shopLength = Math.max(1, shops.length);

    const existingIds = new Set([
        ...(deleted || [])
            .filter(d => d.docType !== 'archive' && /^\d+$/.test(d.id))
            .map(d => parseInt(d.id)),
        ...servicedItems
            .filter(item => /^\d+$/.test(item.id))
            .map(item => parseInt(item.id))
    ]);

    let lastNumber = Math.max(...existingIds, 0);
    lastNumber += (shopIndex - (lastNumber % shopLength) + shopLength) % shopLength;

    const id = (lastNumber + 1).toString().padStart(5, '0');

    console.log('Generated new ID for service: ', id)

    return id;
}

export const normalizeString = (str: string) => {
    // Normalize to NFD form which separates base characters and diacritics
    // Then remove all combining marks (accents), and convert to lowercase
    // Finally remove all non-alphanumeric characters.
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // Remove diacritics
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');       // Keep only letters and numbers
}

export const compareNormalizedStrings = (str1: string, str2: string) => {
    const normalized1 = normalizeString(str1);
    const normalized2 = normalizeString(str2);
    return normalized1 === normalized2;
}
