import { User } from 'firebase/auth';
import {ChangeEventHandler, MouseEventHandler, ReactEventHandler} from "react";
import { GeoPoint} from "firebase/firestore";


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
export  interface  IAuth {
    user:  User  |  null;  //type User comes from firebase
    loading:  boolean;
    SignIn: (credentials:  LoginFormValues) =>  void;
    SignUp: (credentials:  UserFormValues) =>  void;
    SignOut: () =>  void;
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
    line: TableLineType
    index: number
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
export interface TableViewArguments extends TSXComponentArgument {
    lines: TableLineType[]
    header?: string[]
}

export interface GeneralModalArguments extends TSXComponentArgument{
    visible?:boolean
    onClose?: ()=>void
    title?: string
    onSave?: ()=>void
    buttons?: GeneralModalButtons[]
}

export interface ModalArguments {
    visible?:boolean
    title?: string
    onClose?: ()=>void
    selected?: null|Template
}
export interface GeneralModalButtons {
    value: string
    onClick: (e?: React.MouseEvent)=>void
    primary: boolean
}


export interface StyledInputArgs {
    value?: string | number | readonly string[]
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined,
    type?: string,
    name?: string,
    label?: string|number,
    placeholder?: string,
    pattern?: string,
    maxLength?: number,
    min?: string,
    max?: string,
    step?: string,
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
    label?: string|number,
    options: StyledSelectOption[]
}

export interface Shop {
    id: string,
    name?: string,
    address?: string,
    phone?: string,
    description?: string,
    coordinates?: GeoPoint
}

export interface ShopModalInput {
    onClose: ()=>void,
    shop: Shop | null,
    onSave: (currentShop: Shop) => unknown
    setShop: (shop: Shop) => void
    inPlace?: boolean
}
