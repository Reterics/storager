import {User} from 'firebase/auth';
import {ChangeEventHandler, MouseEventHandler, ReactEventHandler} from "react";
import {GeoPoint} from "firebase/firestore";
import {PDFData} from "./pdf.ts";
import {ContextDataType} from "./firebase.ts";

export type onClickReturn = void|false|Promise<void|false>;

export interface GeneralCollectionEntry {
    docType?: ContextDataType,
    docParent?: string,
    docUpdated?: number,
    deleted?: boolean
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
    user?: User | null;  //type User comes from firebase
    loading: boolean;
    SignIn: (credentials: LoginFormValues) => void;
    SignUp: (credentials: UserFormValues) => void;
    SignOut: () => void;
    error: string | null
}

export interface Template {
    id: string
    name?: string
    path?: string
    content?: string
}

export interface GeneralStringObject {
    [key: string]: string
}

export interface ContractDocument {
    id: string
    name?: string
    created?: string
    template?: string
    content?: GeneralStringObject
}


export interface TemplateRaw {
    file: File,
    html?: string,
    document: Template
}

export interface TSXComponentArgument {
    children?: React.ReactNode
}

export type TableLineElementType = string | React.ReactNode;
export type TableLineType = TableLineElementType[];

export interface TableViewLineArguments {
    line: TableLineType,
    index: number,
    header?: TableViewHeader,
    onChange?: TableOnChangeMethod,
    onClick?: (index: number) => void,
    isSelected?: boolean
}

export interface TableViewActionArguments extends TSXComponentArgument {
    onPaste?: MouseEventHandler<HTMLButtonElement>
    onOpen?: MouseEventHandler<HTMLButtonElement>
    onEdit?: MouseEventHandler<HTMLButtonElement>
    onRemove?: MouseEventHandler<HTMLButtonElement>
    onCreate?: MouseEventHandler<HTMLButtonElement>
    onPrint?: MouseEventHandler<HTMLButtonElement>
    onSave?: MouseEventHandler<HTMLButtonElement>
    onCode?: MouseEventHandler<HTMLButtonElement>
}

export type TableViewHeader = (string | TableHead)[];

export type TableOnChangeMethod = (index: number, key: string | number, value: unknown) => void

export interface TableViewArguments extends TSXComponentArgument {
    lines: TableLineType[]
    header?: TableViewHeader,
    onChange?: TableOnChangeMethod,
    onClick?: (index: number) => void,
    selectedIndexes?: { [key: number]: boolean | undefined },
    isHighlighted?: ((line: TableLineType, index: number) => boolean) | boolean | number,
    tableLimits?: number,
}

export interface GeneralModalArguments extends TSXComponentArgument {
    visible?: boolean
    id?: string
    onClose?: () => void
    title?: string
    onSave?: () => void
    buttons?: GeneralModalButtons[]
    inPlace?: boolean
}

export interface ModalArguments {
    visible?: boolean
    title?: string
    onClose?: () => void
    selected?: null | Template
}

export interface GeneralModalButtons {
    value: string
    onClick: (e?: React.MouseEvent) => onClickReturn
    primary?: boolean
    id?: string
}

export interface StyledInputArgs {
    value?: string | number | readonly string[]
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined,
    onEnter?: ()=>void,
    type?: string,
    name?: string,
    label?: string | number,
    placeholder?: string,
    pattern?: string,
    maxLength?: number,
    min?: string,
    max?: string,
    step?: string,
    className?: string,
}

export interface StyledSelectOption {
    name: string,
    value: string
}

export interface StyledSelectArgs {
    value?: string | number | readonly string[]
    onSelect?: ReactEventHandler<HTMLSelectElement> | undefined,
    type?: string,
    name?: string,
    label?: string | number | boolean,
    options: StyledSelectOption[],
    className?: string
}

export interface Shop extends GeneralCollectionEntry{
    id: string,
    name?: string,
    address?: string,
    phone?: string,
    email?: string,
    description?: string,
    coordinates?: GeoPoint,
}

export interface ShopModalInput {
    onClose: () => void,
    shop: Shop | null,
    onSave: (currentShop: Shop) => onClickReturn
    setShop: (shop: Shop) => void
    inPlace?: boolean
}

export interface StoreItem extends GeneralCollectionEntry{
    id: string,
    name?: string,
    sku?: string,
    description?: string,
    image?: string,
    price?: number,
    type?: string,
    storage?: number[],
    shop_id?: string[],
    storage_limit?: number[],
}

export interface ItemModalInput {
    onClose: () => void,
    item: StoreItem | null,
    onSave: (currentItem: StoreItem) => unknown
    setItem: (item: StoreItem|null) => void
    inPlace?: boolean,
    selectedShopId?: string
}

export interface StorePart extends GeneralCollectionEntry{
    id: string,
    name?: string,
    sku?: string,
    description?: string,
    image?: string,
    price?: number,
    category?: string,
    storage?: number[],
    shop_id?: string[],
    storage_limit?: number[],
}

export interface ShopType extends GeneralCollectionEntry {
    id: string,
    name?: string,
    translations?: GeneralStringObject
    category?: string
}

export interface InvoiceType extends GeneralCollectionEntry {
    id: string,
    name?: string,
    address?: string,
    phone?: string,
    tax?: string,
    notes?: string,
    status?: string,
    shop_id?: string[],
    email?: string,
    payment_method?: string,
    total?: string
}

export interface TypeModalInput {
    onClose: () => void,
    type: ShopType | null,
    onSave: (currentType: ShopType) => onClickReturn
    setType: (type: ShopType) => void
    inPlace?: boolean
}

export interface InvoiceModalInput {
    onClose: () => void,
    invoice: InvoiceType | null,
    onSave: (currentType: InvoiceType) => onClickReturn,
    setInvoice: (type: InvoiceType) => void,
    inPlace?: boolean,
    shops: ShopType[]
}

export interface PartModalInput {
    onClose: () => void,
    part: StorePart | null,
    onSave: (currentPart: StorePart) => onClickReturn,
    setPart: (part: StorePart|null) => void,
    inPlace?: boolean,
    selectedShopId?: string
}

export type ServiceStatus = 'status_accepted'|'status_in_progress'|'status_waiting_parts'|'status_waiting_feedback'|'status_ready'|'status_delivered';

export interface ServiceData extends GeneralCollectionEntry{
    id: string,
    client_name?: string,
    client_email?: string,
    client_phone?: string,
    service_name?: string,
    service_address?: string,
    service_email?: string,
    type?: string,
    accessories?: string,
    guaranteed?: 'yes'|'no',
    repair_description?: string,
    expected_cost?: string,
    note?: string,
    address?: string,
    phone?: string,
    description?: string,
    coordinates?: GeoPoint,
    serviceStatus?: ServiceStatus,
    signature?: string,
    date?: string,

    onUpdate?: boolean,
}

export interface ServiceModalInput {
    id?: string,
    onClose: () => void,
    service: ServiceData | null,
    onSave: (currentService: ServiceData) => onClickReturn
    setService: (shop: ServiceData) => void
    inPlace?: boolean,
    settings?: SettingsItems
}

export interface ServiceCompleteData extends GeneralCollectionEntry{
    service_id?: string,
    id: string,
    client_name?: string,
    client_email?: string,
    client_phone?: string,
    service_name?: string,
    service_address?: string,
    service_email?: string,
    type?: string,
    accessories?: string,
    service_date?: string,
    guaranteed?: 'yes'|'no',

    description?: string,
    repair_cost?: string,
    repair_description?: string,

    date?: string,

    signature?: string
}

export interface ServiceCompletionModalInput {
    id?: string,
    onClose: () => void,
    formData: ServiceCompleteData | null,
    onSave: (currentService: ServiceCompleteData) => onClickReturn
    setFromData: (shop: ServiceCompleteData) => void
    inPlace?: boolean
}

export interface GeneralButtons {
    value: string | React.ReactNode,
    onClick: (e?: React.MouseEvent) => void
    primary?: boolean
}

export type TableRowType = 'steps'|'text' | 'number' | 'checkbox' | 'select';

export interface TableHead {
    sortable?: boolean,
    value: string,
    editable?: boolean,
    type?: TableRowType,
    options?: StyledSelectOption[],
    postFix?: string,
}

export type OrderType = 'ASC' | 'DSC';


export interface SettingsItems extends GeneralCollectionEntry{
    id: string,
    companyName?: string,
    address?: string,
    taxId?: string,
    bankAccount?: string,
    phone?: string,
    email?: string,
    smtpServer?: string,
    port?: string,
    username?: string,
    password?: string,
    useSSL?: boolean,

    serviceAgreement?: string,
    itemTypes?: string,
    partTypes?: string,
    serviceTypes?: string,
}


export interface UserData extends GeneralCollectionEntry{
    username?: string,
    email?: string,
    shop_id?: string[],
    role?: string,
    id: string
    password?: string
    password_confirmation?: string,
}

export interface UserModalInput {
    onClose: () => void,
    user: UserData | null,
    onSave: (currentUser: UserData) => unknown
    setUser: (user: UserData) => void
    inPlace?: boolean,
    shops?: Shop[]
}

export interface PrintableModalInput {
    onClose?: () => void,
    formData: { data: PDFData, signature?: string, printNow?: boolean } | null,
}


export interface ListModalArguments {
    buttons?: GeneralModalButtons[]
    lines: TableLineType[]
    header?: TableViewHeader,
    inPlace?: boolean,
    title?: string
}

export interface TextFile {
    value: string|ArrayBuffer|null,
    file_input?: File
}

export interface StorageInfo {
    shopIndex: number,
    storage: number,
    storageLimit: number,
    lowStorageAlert: boolean
}

export interface ImportShopDataArguments {
    inPlace?: boolean,
    title?: string,
    onClose: () => void,
    shop?: Shop
}

export interface MediaModalArguments {
    inPlace?: boolean,
    title?: string,
    onClose: () => void,
    setFile: (file: string|null) => void,
}
