import type { User } from 'firebase/auth';
import type {
  ChangeEventHandler,
  MouseEventHandler,
  ReactEventHandler,
} from 'react';
import type { GeoPoint } from 'firebase/firestore';
import type { PDFData } from './pdf.ts';
import type { ContextDataType } from './firebase.ts';

export type onClickReturn = void | false | Promise<void | false>;

export interface GeneralCollectionEntry {
  docType?: ContextDataType;
  docParent?: string;
  docUpdated?: number;
  deleted?: boolean;
}
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface UserFormValues {
  email: string;
  password: string;
  displayName: string;
}

//IAuth context
export interface IAuth {
  user?: User | null; //type User comes from firebase
  loading: boolean;
  SignIn: (credentials: LoginFormValues) => void;
  SignUp: (credentials: UserFormValues) => void;
  SignOut: () => void;
  error: string | null;
}

export interface Template {
  id: string;
  name?: string;
  path?: string;
  content?: string;
}

export interface GeneralStringObject {
  [key: string]: string;
}

export interface ContractDocument {
  id: string;
  name?: string;
  created?: string;
  template?: string;
  content?: GeneralStringObject;
}

export interface TemplateRaw {
  file: File;
  html?: string;
  document: Template;
}

export interface TSXComponentArgument {
  children?: React.ReactNode;
}

export type TableLineElementType = string | React.ReactNode;
export type TableLineType = TableLineElementType[];

export interface TableViewLineArguments {
  line: TableLineType;
  index: number;
  header?: TableViewHeader;
  onChange?: TableOnChangeMethod;
  onClick?: (index: number) => void;
  isSelected?: boolean;
}

export interface TableViewActionArguments extends TSXComponentArgument {
  onPaste?: MouseEventHandler<HTMLButtonElement>;
  onOpen?: MouseEventHandler<HTMLButtonElement>;
  onEdit?: MouseEventHandler<HTMLButtonElement>;
  onRemove?: MouseEventHandler<HTMLButtonElement>;
  onCreate?: MouseEventHandler<HTMLButtonElement>;
  onPrint?: MouseEventHandler<HTMLButtonElement>;
  onSave?: MouseEventHandler<HTMLButtonElement>;
  onCode?: MouseEventHandler<HTMLButtonElement>;
}

export type TableViewHeader = (string | TableHead)[];

export type TableOnChangeMethod = (
  index: number,
  key: string | number,
  value: unknown,
) => void;

export type TableOnEditMethod = (
  tableLine: TableLineType,
  key: string | number,
  value: unknown,
) => void;

export interface TableViewArguments extends TSXComponentArgument {
  lines: TableLineType[];
  header?: TableViewHeader;
  onEdit?: TableOnEditMethod;
  onClick?: (index: number) => void;
  selectedIndexes?: { [key: number]: boolean | undefined };
  isHighlighted?:
    | ((line: TableLineType, index: number) => boolean)
    | boolean
    | number;
  tableLimits?: number;
}

export interface GeneralModalArguments extends TSXComponentArgument {
  visible?: boolean;
  id?: string;
  onClose?: () => void;
  title?: string;
  onSave?: () => void;
  buttons?: GeneralModalButtons[];
  inPlace?: boolean;
}

export interface ModalArguments {
  visible?: boolean;
  title?: string;
  onClose?: () => void;
  selected?: null | Template;
}

export interface GeneralModalButtons {
  value: string;
  onClick: (e?: React.MouseEvent) => onClickReturn;
  primary?: boolean;
  id?: string;
  testId?: string;
}

export interface StyledInputArgs {
  value?: string | number | readonly string[];
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  onEnter?: () => void;
  type?: string;
  name?: string;
  label?: string | number;
  placeholder?: string;
  pattern?: string;
  maxLength?: number;
  min?: string;
  max?: string;
  step?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface StyledSelectOption {
  name: string;
  value: string;
}

export interface StyledSelectArgs {
  value?: string | number | readonly string[];
  onSelect?: ReactEventHandler<HTMLSelectElement>;
  type?: string;
  name?: string;
  label?: string | number | boolean;
  options: StyledSelectOption[];
  className?: string;
  compact?: boolean;
  defaultLabel?: string;
}

export interface Shop extends GeneralCollectionEntry {
  id: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  coordinates?: GeoPoint;
}

export interface ShopModalInput {
  onClose: () => void;
  shop: Shop | null;
  onSave: (currentShop: Shop) => onClickReturn;
  setShop: (shop: Shop) => void;
  inPlace?: boolean;
}

export interface StoreItem extends GeneralCollectionEntry {
  id: string;
  name?: string;
  sku?: string;
  description?: string;
  image?: string;
  price?: number[];
  type?: string;
  storage?: number[];
  shop_id?: string[];
  storage_limit?: number[];

  // Frontend restricted keys:
  cost?: number;
  net_price?: number;
}

export interface ItemModalInput {
  onClose: () => void;
  item: StoreItem | null;
  onSave: (currentItem: StoreItem) => unknown;
  setItem: (item: StoreItem | null) => void;
  inPlace?: boolean;
  selectedShopId?: string;
}

export interface StorePart extends GeneralCollectionEntry {
  id: string;
  name?: string;
  sku?: string;
  description?: string;
  image?: string;
  price?: number[];
  category?: string;
  storage?: number[];
  shop_id?: string[];
  storage_limit?: number[];

  // Frontend restricted keys:
  cost?: number;
  net_price?: number;
}

export interface ShopType extends GeneralCollectionEntry {
  id: string;
  name?: string;
  translations?: GeneralStringObject;
  category?: string;
}

export interface InventoryModalData {
  selectedItems: StoreItem[] | StorePart[];
}

export type PaymentMethod = 'card' | 'cash' | 'transfer';
export type DocumentType = 'invoice' | 'receipt' | 'other';
export type TransactionType = 'sell' | 'buy' | 'revert' | 'labor';
export type ItemType = 'part' | 'item' | 'other';

export interface Transaction extends GeneralCollectionEntry {
  id: string;
  name?: string;
  shop_id?: string[];
  cost?: number;
  item_type?: ItemType;
  item_id?: string;
  quantity?: number;
  net_amount?: number;
  gross_amount?: number;
  payment_method?: PaymentMethod;
  document_type?: DocumentType;
  transaction_type?: TransactionType;
  user?: string;
}

export type InvoiceStatus = 'created' | 'done';

export interface InvoiceType extends GeneralCollectionEntry {
  id: string;
  name?: string;
  address?: string;
  phone?: string;
  tax?: string;
  notes?: string;
  status?: InvoiceStatus;
  shop_id?: string[];
  email?: string;
  payment_method?: PaymentMethod;
  total?: string;
  created?: number;
  done?: number;
  invoice_subject?: string;
  purchase_cost?: string;
}

export interface TypeModalInput {
  onClose: () => void;
  type: ShopType | null;
  onSave: (currentType: ShopType) => onClickReturn;
  setType: (type: ShopType) => void;
  inPlace?: boolean;
}

export interface InvoiceModalInput {
  onClose: () => void;
  invoice: InvoiceType | null;
  onSave: (currentType: InvoiceType) => onClickReturn;
  setInvoice: (type: InvoiceType) => void;
  inPlace?: boolean;
  shops: ShopType[];
}

export interface PartModalInput {
  onClose: () => void;
  part: StorePart | null;
  onSave: (currentPart: StorePart) => onClickReturn;
  setPart: (part: StorePart | null) => void;
  inPlace?: boolean;
  selectedShopId?: string;
}

// Do not change first and last variable without careful consideration
export const serviceStatusList = [
  'status_accepted',
  'status_in_progress',
  'status_waiting_parts',
  'status_waiting_feedback',
  'status_ready',
  'status_delivered',
] as const;

export type ServiceStatus = (typeof serviceStatusList)[number];

export const leaseStatusList = ['status_leased', 'status_returned'] as const;

export type LeaseStatus = (typeof leaseStatusList)[number];

export interface ServiceLineData {
  id: string;
  name: string;
  completed?: boolean;
  table: TableLineType[];
}

export interface ServiceData extends GeneralCollectionEntry {
  id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  service_name?: string;
  service_address?: string;
  service_email?: string;
  type?: string;
  accessories?: string;
  guaranteed?: 'yes' | 'no';
  repair_description?: string;
  expected_cost?: string;
  note?: string;
  address?: string;
  phone?: string;
  description?: string;
  coordinates?: GeoPoint;
  serviceStatus?: ServiceStatus;
  signature?: string;
  date?: string;

  onUpdate?: boolean;
}

export interface ServiceModalInput {
  id?: string;
  onClose: () => void;
  service: ServiceData | null;
  onSave: (currentService: ServiceData) => onClickReturn;
  setService: (shop: ServiceData) => void;
  inPlace?: boolean;
  settings?: SettingsItems;
}

export interface ServiceCompleteData extends GeneralCollectionEntry {
  service_id?: string;
  id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  service_name?: string;
  service_address?: string;
  service_email?: string;
  type?: string;
  accessories?: string;
  service_date?: string;
  guaranteed?: 'yes' | 'no';

  description?: string;
  repair_cost?: string;
  repair_description?: string;

  date?: string;

  signature?: string;
}

export interface ServiceCompletionModalInput {
  id?: string;
  onClose: () => void;
  formData: ServiceCompleteData | null;
  onSave: (currentService: ServiceCompleteData) => onClickReturn;
  setFromData: (shop: ServiceCompleteData) => void;
  inPlace?: boolean;
}

export interface Lease extends GeneralCollectionEntry {
  id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_identity_card?: string;
  client_resident_card?: string;
  service_name?: string;
  service_address?: string;
  service_email?: string;
  description?: string;
  note?: string;
  accessories?: string;
  lease_status?: LeaseStatus;

  expected_cost?: string;
  type?: string;
  signature?: string;
  date?: string;
  onUpdate?: boolean;
}

export interface LeaseCompletion extends GeneralCollectionEntry {
  lease_id?: string;
  id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  service_name?: string;
  service_address?: string;
  service_email?: string;

  description?: string;
  accessories?: string;
  lease_date?: string;
  rental_cost?: string;
  rental_description?: string;
  date?: string;
  signature?: string;
}

export interface LeaseModalProps {
  id?: string;
  onClose: () => void;
  lease: Lease;
  onSave: (currentLease: Lease) => onClickReturn;
  setLease: (lease: Lease) => void;
  inPlace?: boolean;
  settings?: SettingsItems;
}

export interface LeaseCompletionModalProps {
  id?: string;
  onClose: () => void;
  formData: LeaseCompletion;
  onSave: (currentLease: LeaseCompletion) => onClickReturn;
  setFromData: (lease: LeaseCompletion) => void;
  inPlace?: boolean;
}

export interface GeneralButtons {
  value: string | React.ReactNode;
  onClick: (e?: React.MouseEvent) => void;
  primary?: boolean;
  testId?: string;
}

export type TableRowType = 'steps' | 'text' | 'number' | 'checkbox' | 'select';

export interface TableHead {
  sortable?: boolean;
  value: string | React.ReactNode;
  editable?: boolean;
  type?: TableRowType;
  options?: StyledSelectOption[];
  postFix?: string;
}

export type OrderType = 'ASC' | 'DSC';

export interface SettingsItems extends GeneralCollectionEntry {
  id: string;
  companyName?: string;
  address?: string;
  taxId?: string;
  registrationNumber?: string;
  bankAccount?: string;
  phone?: string;
  email?: string;
  smtpServer?: string;
  port?: string;
  username?: string;
  password?: string;
  useSSL?: boolean;

  vatPercent?: number; // e.g., 27 means 27%

  serviceAgreement?: string;
  rentalConditions?: string;
  itemTypes?: string;
  partTypes?: string;
  serviceTypes?: string;

  // Feature toggles
  enableLogs?: boolean;
  enableTransactions?: boolean;
  enableLeasing?: boolean;
  enableInvoiceNotes?: boolean;
  enableExtendedInvoices?: boolean;

  // Optional Hosting info override fields
  hostingProvider?: string;
  hostingHq?: string;
  hostingBranch?: string;
  hostingTax?: string;
  hostingVat?: string;
  hostingReg?: string;
  hostingAccount?: string;
  hostingSwift?: string;
  hostingIban?: string;
  hostingWebsite?: string;
  hostingEmail?: string;
  hostingPhone?: string;
}

export interface UserData extends GeneralCollectionEntry {
  username?: string;
  email?: string;
  shop_id?: string[];
  role?: string;
  id: string;
  password?: string;
  password_confirmation?: string;
}

export interface UserModalInput {
  onClose: () => void;
  user: UserData | null;
  onSave: (currentUser: UserData) => unknown;
  setUser: (user: UserData) => void;
  inPlace?: boolean;
  shops?: Shop[];
}

export interface PrintableModalInput {
  onClose?: () => void;
  formData: { data: PDFData; signature?: string; printNow?: boolean } | null;
}

export interface ListModalArguments {
  buttons?: GeneralModalButtons[];
  lines: TableLineType[];
  header?: TableViewHeader;
  inPlace?: boolean;
  title?: string;
}

export interface TextFile {
  value: string | ArrayBuffer | null;
  file_input?: File;
}

export interface StorageInfo {
  shopIndex: number;
  storage: number;
  price: number;
  storageLimit: number;
  lowStorageAlert: boolean;
}

export interface ImportShopDataArguments {
  inPlace?: boolean;
  title?: string;
  onClose: () => void;
  shop?: Shop;
}

export interface MediaModalArguments {
  inPlace?: boolean;
  title?: string;
  onClose: () => void;
  setFile: (file: string | null) => void;
}
