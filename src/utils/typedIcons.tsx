import type {
  DocumentType,
  PaymentMethod,
  TransactionType,
} from '../interfaces/interfaces.ts';
import {
  BsArrowCounterclockwise,
  BsArrowDownLeft,
  BsArrowUpRight,
  BsCash,
  BsCreditCard2Front,
  BsDisplay,
  BsFileEarmark,
  BsFileEarmarkText,
  BsFillSendFill,
  BsPersonLinesFill,
  BsPhone,
  BsReceipt,
  BsTablet,
} from 'react-icons/bs';
import type { DeviceType } from '../database/firebase/FirebaseDBModel.ts';

export const getIconForPaymentMethod = (method?: PaymentMethod) => {
  switch (method) {
    case 'card':
      return <BsCreditCard2Front size={18} />;
    case 'cash':
      return <BsCash size={18} />;
    case 'transfer':
      return <BsFillSendFill size={18} />;
  }
  return '';
};

export const getIconForDocumentType = (documentType?: DocumentType) => {
  switch (documentType) {
    case 'invoice':
      return <BsFileEarmarkText size={18} title={'invoice'} />;
    case 'receipt':
      return <BsReceipt size={18} title={'receipt'} />;
    case 'other':
      return <BsFileEarmark size={18} title={'other'} />;
  }
  return '';
};

export const getIconForTransactionType = (
  transactionType?: TransactionType,
) => {
  switch (transactionType) {
    case 'sell':
      return <BsArrowUpRight size={18} title={'sell'} />;
    case 'buy':
      return <BsArrowDownLeft size={18} title={'buy'} />;
    case 'revert':
      return <BsArrowCounterclockwise size={18} title={'revert'} />;
    case 'labor':
      return <BsPersonLinesFill size={18} title={'labor'} />;
  }
  return '';
};

export const getIconForDeviceType = (type?: DeviceType) => {
  switch (type) {
    case 'desktop':
      return <BsDisplay size={18} />;
    case 'mobile':
      return <BsPhone size={18} />;
    case 'tablet':
      return <BsTablet size={18} />;
  }
  return '';
};
