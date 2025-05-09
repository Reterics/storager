import {TFunction} from 'i18next';
import {StyledSelectOption} from '../interfaces/interfaces.ts';

export const getTranslatedSelectOptions = (
  list: string[] | readonly string[],
  t: TFunction,
  prefix?: string
): StyledSelectOption[] => {
  return list.map((item) => ({
    name: t((prefix ?? '') + item),
    value: item,
  }));
};
