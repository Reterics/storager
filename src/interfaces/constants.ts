import {InvoiceStatus} from "./interfaces.ts";

export const userRoleOptions = [
    {"value": "member", "name": "Felhasználó"},
    {"value": "admin", "name": "Admin"},
]


export const typeModalOptions = [
    {"value": "part", "name": "Part Types"},
    {"value": "item", "name": "Item Types"},
    {"value": "service", "name": "Service Types"},
];

export const storeTableKeyOrder = ['image', 'sku', 'name', 'storage', 'price', 'shop'];

export const tableViewOptions = [
    {"value": "50", "name": "50"},
    {"value": "100", "name": "100"},
    {"value": "10000", "name": "All"},
]

export const invoiceStatusCodes: InvoiceStatus[] = ['created', 'done'];
