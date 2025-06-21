import {getAuth, Auth} from 'firebase/auth';
import FirebaseDBModel from './FirebaseDBModel.ts';
import {FirebaseError} from 'firebase/app';
import STLogger from '../../utils/logger.ts';
import {ContextDataCollectionType} from '../../interfaces/firebase.ts';

const refreshRate = {
  minutes: 60000,
  hours: 3600000,
};

const storageTTL = {
  hot: refreshRate.hours * 12,
  warm: refreshRate.hours * 24 * 2,
  cold: refreshRate.hours * 24 * 7,
};

export const modules = {
  storageLogs: import.meta.env.VITE_STORAGE_LOGS === 'true',
  transactions: import.meta.env.VITE_TRANSACTIONS === 'true',
  leasing: import.meta.env.VITE_LEASING === 'true',
  advancedInvoices: import.meta.env.VITE_ADVANCED_INVOICES === 'true',
};

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
  invoices: import.meta.env.VITE_FIREBASE_DB_INVOICES || 'invoices',
  logs: import.meta.env.VITE_FIREBASE_DB_LOGS || 'logs',
  transactions: import.meta.env.VITE_FIREBASE_DB_TRANSACTIONS || 'transactions',
  leases: import.meta.env.VITE_FIREBASE_DB_LEASES || 'leases',
  leaseCompletions:
    import.meta.env.VITE_FIREBASE_DB_LEASE_COMPLETIONS || 'leaseCompletions',
};

export const logger = new STLogger();

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
    leases: storageTTL.cold,
    leaseCompletions: storageTTL.cold,
  },
  storageLogs: modules.storageLogs,
  transactions: modules.transactions,
  collectionsToLog: ['parts', 'items', 'shops'],
});

const app = firebaseModel.getApp();
export const db = firebaseModel.getDB();

let _firebaseAuth: Auth | null = null;
let _firebaseAuthError: FirebaseError | null = null;
try {
  _firebaseAuth = getAuth(app);
} catch (err: unknown) {
  _firebaseAuthError = err as FirebaseError;
}

export const firebaseAuth = _firebaseAuth;
export const firebaseAuthError = _firebaseAuthError;

export const getCollection = async <T extends ContextDataCollectionType>(
  table: string,
  force?: boolean
) => {
  return (await firebaseModel.getAll(table, force)) as unknown as T[];
};

export const getById = (id: string, table: string) => {
  return firebaseModel.get(id, table);
};

export default app;
