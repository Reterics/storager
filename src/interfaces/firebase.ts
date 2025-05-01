import {
  InvoiceType,
  Lease,
  LeaseCompletion,
  ServiceCompleteData,
  ServiceData,
  SettingsItems,
  Shop,
  ShopType,
  StoreItem,
  StorePart,
  StyledSelectOption,
  Transaction,
  UserData,
} from './interfaces.ts';
import {LogEntry} from '../database/firebase/FirebaseDBModel.ts';

export interface ContextData {
  shops: Shop[];
  items: StoreItem[];
  parts: StorePart[];
  services: ServiceData[];
  completions: ServiceCompleteData[];
  settings: SettingsItems;
  users: UserData[];
  currentUser?: UserData;
  archive: ContextDataValueType[];
  types: ShopType[];
  deleted: ContextDataValueType[];
  invoices: InvoiceType[];
  logs: LogEntry[];
  transactions: Transaction[];
  leases: Lease[];
  leaseCompletions: LeaseCompletion[];
}

export type ContextDataCollectionType =
  | Shop[]
  | StoreItem[]
  | StorePart[]
  | ShopType[]
  | ServiceData[]
  | ServiceCompleteData[]
  | SettingsItems
  | UserData[]
  | UserData
  | InvoiceType[]
  | LogEntry[]
  | Transaction[]
  | Lease[]
  | LeaseCompletion[];
export type ContextDataType =
  | 'shops'
  | 'items'
  | 'parts'
  | 'services'
  | 'completions'
  | 'settings'
  | 'users'
  | 'types'
  | 'archive'
  | 'invoices'
  | 'logs'
  | 'transactions'
  | 'leases'
  | 'leaseCompletions';
export type GenericContextEntityType =
  | StoreItem
  | StorePart
  | UserData
  | InvoiceType
  | LogEntry
  | Transaction;
export type ContextDataValueType =
  | Shop
  | ShopType
  | ServiceData
  | ServiceCompleteData
  | SettingsItems
  | Lease
  | LeaseCompletion
  | GenericContextEntityType;

export interface DBContextType {
  data: ContextData;
  refreshData: (key?: ContextDataType) => Promise<void>;
  setData: (
    key: ContextDataType,
    value: ContextDataValueType,
    archive?: boolean
  ) => Promise<ContextDataCollectionType | null>;
  removeData: (
    key: ContextDataType,
    id: string
  ) => Promise<ContextDataCollectionType | null>;
  restoreData: (id: string) => Promise<ContextDataCollectionType | null>;
  removePermanentData: (id: string) => Promise<ContextDataValueType[] | null>;
  refreshImagePointers: (array: StoreItem[] | StorePart[]) => Promise<void>;
  uploadDataBatch: (
    key: ContextDataType,
    values: ContextDataValueType[]
  ) => Promise<ContextDataCollectionType | null>;
  getType: (
    type: 'part' | 'item' | 'service',
    lang: 'hu' | 'en'
  ) => StyledSelectOption[];
  updateLatest: (
    key: ContextDataType
  ) => Promise<SettingsItems | ContextDataValueType[] | null>;
}

export interface CommonCollectionData {
  id: string;
  [key: string]: string | number | boolean | undefined; // TODO: Add array here
}

export interface KVCollectionStore {
  [key: string]: CommonCollectionData[];
}

export interface TTLData {
  [key: string]: number;
}

export interface FirebaseImageData {
  id: string;
  url: string;
  base64?: string;
}
export interface ImageStore {
  [key: string]: FirebaseImageData;
}
