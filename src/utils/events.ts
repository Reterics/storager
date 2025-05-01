import {ChangeEvent, SyntheticEvent} from 'react';
import {StoreItem, StorePart} from '../interfaces/interfaces.ts';
import {getShopIndex} from './storage.ts';

export const multiShopKeys = [
  'storage_limit',
  'shop_id',
  'storage',
  'price',
] as const;

export const changeStoreType = (
  e: ChangeEvent<HTMLInputElement> | SyntheticEvent<HTMLSelectElement>,
  key: string,
  item: StoreItem | StorePart | null,
  shopId?: string
) => {
  if (!item) return null;

  const value = (e.currentTarget as HTMLInputElement | HTMLSelectElement).value;

  if (!multiShopKeys.includes(key as (typeof multiShopKeys)[number])) {
    return {
      ...item,
      [key]: value,
    };
  }

  const storeKey = key as (typeof multiShopKeys)[number];
  const shopIndex = getShopIndex(item, shopId);

  if (shopIndex < 0) return {...item};

  const currentArray = Array.isArray(item[storeKey])
    ? [...item[storeKey]]
    : [item[storeKey]];

  currentArray[shopIndex] = value;

  return {
    ...item,
    [storeKey]: currentArray,
  };
};
