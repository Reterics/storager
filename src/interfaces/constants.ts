import {InvoiceStatus} from './interfaces.ts';

export const userRoleOptions = [
  {value: 'member', name: 'Felhasználó'},
  {value: 'admin', name: 'Admin'},
];

export const typeModalOptions = [
  {value: 'part', name: 'Part Types'},
  {value: 'item', name: 'Item Types'},
  {value: 'service', name: 'Service Types'},
];

export const storeTableKeyOrder = [
  'image',
  'sku',
  'name',
  'storage',
  'price',
  'shop',
];

export const tableViewOptions = [
  {value: '50', name: 'Max 50'},
  {value: '100', name: 'Max 100'},
  {value: '10000', name: 'All'},
];

export const invoiceStatusCodes: InvoiceStatus[] = ['created', 'done'];

export const paymentMethods = [
  {value: 'card', name: 'Card'},
  {value: 'cash', name: 'Cash'},
  {value: 'transfer', name: 'Transfer'},
];

export const documentTypes = [
  {value: 'invoice', name: 'Invoice'},
  {value: 'receipt', name: 'Receipt'},
  {value: 'other', name: 'Other'},
];

export const transactionTypes = [
  {value: 'sell', name: 'Sell'},
  {value: 'buy', name: 'Buy'},
  {value: 'revert', name: 'Revert'},
];
export const transactionItemTypes = [
  {value: 'part', name: 'Part'},
  {value: 'item', name: 'Item'},
  {value: 'other', name: 'Other'},
];
