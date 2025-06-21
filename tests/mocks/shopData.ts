import {
    SettingsItems,
    Shop, ShopType, StoreItem,
    StorePart
} from "../../src/interfaces/interfaces";
import {ContextData} from "../../src/interfaces/firebase";
import {currentUserMock} from "./userData";


export const defaultShop:Shop = {
    id: '1',
    name: 'Shop',
    address: '8900 Something, Halado street 5',
    phone: '12345678',
    email: 'shop@shop.com',
    description: 'Shop description',
}

export const defaultItems: StoreItem[] = [
    {
        id: 'i1',
        name: 'Item 1',
        sku: 'C4545454',
        description: 'description',
        image: '/image.png',
        price: [1],
        type: 'item',
        storage: [5],
        shop_id: ['1'],
        storage_limit: [5],
    },
    {
        id: 'i2',
        name: 'Item 2',
        sku: 'C4545455',
        description: 'description2',
        image: '/image.png',
        price: [2],
        type: 'item',
        storage: [5],
        shop_id: ['1'],
        storage_limit: [5],
    }
]

export const defaultParts: StorePart[] = [
    {
        id: 'p1',
        name: 'Part',
        sku: 'P232131',
        description: 'description',
        image: '/image.png',
        price: [1],
        category: 'base',
        storage: [3],
        shop_id: ['1'],
        storage_limit: [5]
    },
    {
        id: 'p2',
        name: 'Part2',
        sku: 'P232134',
        description: 'description2',
        image: '/image.png',
        price: [2],
        category: 'base',
        storage: [5],
        shop_id: ['1'],
        storage_limit: [5]
    }
];

export const defaultSettings: SettingsItems = {
    id: 's1',
    companyName: 'default',
    address: 'default',
    taxId: 'default',
    bankAccount: 'default',
    phone: 'default',
    email: 'default',
    smtpServer: 'default',
    port: 'default',
    username: 'default',
    password: 'default',
    useSSL: false,

    serviceAgreement: 'default',
    itemTypes: 'default',
    partTypes: 'default',
    serviceTypes: 'default',

    enableLogs: true,
    enableTransactions: true,
    enableLeasing: true,
    enableInvoiceNotes: true,
    enableExtendedInvoices: false,
}

export const defaultTypes: ShopType[] = [
    {
        category: "item",
        "translations": {
            hu: "Item",
            en: "Item"
        },
        name: "Item",
        id: "012",
    },{
        category: "item",
        "translations": {
            hu: "Item2",
            en: "Item2"
        },
        name: "Item2",
        id: "013",
    },
    {
        category: "service",
        name: "Front",
        translations: {
            en: "Front",
            hu: "Front"
        },
        id: "5214",
    },
    {
        category: "service",
        name: "Back",
        translations: {
            en: "Back",
            hu: "Back"
        },
        id: "515",
    },
    {
        category: "part",
        name: "Part",
        translations: {
            en: "Part",
            hu: "Part"
        },
        id: "T16",
    }
]

export const defaultContextData:ContextData = {
    shops: [defaultShop],
    items: defaultItems,
    parts: defaultParts,
    services: [],
    completions: [],
    settings: defaultSettings,
    users: [currentUserMock],
    currentUser: currentUserMock,
    archive: [],
    types: defaultTypes,
    deleted: [],
    invoices: [],
    logs: [],
    transactions: [],
    leases: [],
    leaseCompletions: []
}
