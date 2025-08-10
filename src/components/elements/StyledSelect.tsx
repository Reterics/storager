import type { StyledSelectArgs } from '../../interfaces/interfaces.ts';
import { useTranslation } from 'react-i18next';

export default function StyledSelect({
  value,
  onSelect,
  name,
  label,
  options,
  compact,
  defaultLabel,
}: Readonly<StyledSelectArgs>) {
  const { t } = useTranslation();

  return (
    <div
      className={
        compact
          ? 'w-auto group flex flex-row items-center justify-between'
          : 'relative z-0 w-full group'
      }
    >
      {label !== false && (
        <label
          htmlFor={name}
          className={
            compact
              ? 'block mr-1 text-sm font-medium text-left text-gray-700 dark:text-gray-300'
              : 'block mb-1 text-sm font-medium text-left text-gray-700 dark:text-gray-300'
          }
        >
          {label || name}
        </label>
      )}
      <select
        name={name}
        id={name}
        value={value}
        onChange={onSelect}
        className={
          (compact ? 'px-2 py-1.5 w-fit' : 'px-3 py-2 w-full') +
          ' block text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm' +
          ' focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700' +
          ' dark:text-white dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500'
        }
        required
      >
        <option defaultChecked={true} disabled hidden={true}>
          {defaultLabel || t('Please Select')}
        </option>
        {options.map((option, index) => (
          <option key={`${name}_${option.value}_${index}`} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
