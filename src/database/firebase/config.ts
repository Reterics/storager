import { getAuth } from 'firebase/auth';
import FirebaseDBModel from "./FirebaseDBModel.ts";

const refreshRate = {
    minutes: 60000,
    hours: 3600000
}

const storageTTL = {
    hot: refreshRate.hours,
    warm: refreshRate.hours * 24,
    cold: refreshRate.hours * 48,
}

export const firebaseModel = new FirebaseDBModel({
    ttl: {
        users: storageTTL.cold,
        settings: storageTTL.cold,
        services: storageTTL.cold,
        completions: storageTTL.cold,
        shops: storageTTL.cold,
        items: storageTTL.hot,
        parts: storageTTL.hot,
        archive: storageTTL.cold,
        types: storageTTL.cold,
    }
});

const app = firebaseModel.getApp();
export const db = firebaseModel.getDB()
export const firebaseAuth = getAuth(app);

export const firebaseCollections = {
    shops: import.meta.env.VITE_FIREBASE_DB_SHOPS || 'shops',
    items: import.meta.env.VITE_FIREBASE_DB_ITEMS || 'items',
    parts: import.meta.env.VITE_FIREBASE_DB_PARTS || 'parts',
    services: import.meta.env.VITE_FIREBASE_DB_SERVICES || 'services',
    completions: import.meta.env.VITE_FIREBASE_DB_COMPLETIONS || 'completions',
    settings: import.meta.env.VITE_FIREBASE_DB_SETTINGS || 'settings',
    users: import.meta.env.VITE_FIREBASE_DB_USERS || 'users',
    archive: import.meta.env.VITE_FIREBASE_DB_ARCHIVE || 'archive',
    types: import.meta.env.VITE_FIREBASE_DB_TYPES || 'types',
};


export const getCollection = (table: string)=>{
    return firebaseModel.getAll(table);
};

export const getById = (id: string, table: string) => {
    return firebaseModel.get(id, table);
};

export default app;
