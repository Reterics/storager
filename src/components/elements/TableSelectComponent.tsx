import React from 'react';
import {BsPlusCircle, BsDashCircle} from 'react-icons/bs';
import {useTranslation} from 'react-i18next';

export interface TableSelectComponentProps<T> {
  items: T[];
  selectedItems: Record<string, number>;
  onChange: (updated: Record<string, number>, item: T) => void;
  itemRenderer: (item: T) => React.ReactNode[];
  headers: React.ReactNode[];
  getId: (item: T) => string;
  maxCount?: number;
}

export default function TableSelectComponent<T>({
  items,
  selectedItems,
  onChange,
  itemRenderer,
  headers,
  getId,
  maxCount = 99,
}: TableSelectComponentProps<T>) {
  const {t} = useTranslation();

  const handleChange = (id: string, delta: number, item: T) => {
    const current = selectedItems[id] || 0;
    const updatedCount = current + delta;

    const updated: Record<string, number> = {
      ...selectedItems,
      [id]: updatedCount,
    };

    if (updatedCount <= 0) {
      delete updated[id];
    } else if (updatedCount > maxCount) {
      updated[id] = maxCount;
    }

    onChange(updated, item);
  };

  return (
    <table className='w-full table-auto text-sm text-left text-gray-700 dark:text-gray-200 border rounded shadow-md'>
      <thead className='bg-gray-100 dark:bg-gray-800 uppercase text-xs text-gray-600 dark:text-gray-300'>
        <tr>
          {headers.map((head, idx) => (
            <th key={idx} className='px-3 py-2'>
              {head}
            </th>
          ))}
          <th className='px-3 py-2 text-center'>{t('Selected Count')}</th>
          <th className='px-3 py-2 text-center'>{t('Actions')}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const id = getId(item);
          const count = selectedItems[id] || 0;

          return (
            <tr
              key={id}
              className={`border-t dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                count > 0 ? 'bg-yellow-50 dark:bg-yellow-900' : ''
              }`}
            >
              {itemRenderer(item).map((col, idx) => (
                <td key={idx} className='px-3 py-2 whitespace-nowrap'>
                  {col}
                </td>
              ))}

              <td className='px-3 py-2 text-center'>{count}</td>
              <td className='px-3 py-2 text-center flex justify-center items-center gap-3'>
                <button
                  type='button'
                  onClick={() => handleChange(id, -1, item)}
                  className='text-red-600 hover:text-red-800 disabled:opacity-40'
                  disabled={count <= 0}
                >
                  <BsDashCircle size={18} />
                </button>
                <button
                  type='button'
                  onClick={() => handleChange(id, 1, item)}
                  className='text-green-600 hover:text-green-800'
                >
                  <BsPlusCircle size={18} />
                </button>
              </td>
            </tr>
          );
        })}
        {!items.length && (
          <tr>
            <td
              colSpan={headers.length + 2}
              className='px-4 py-6 text-center text-gray-400 dark:text-gray-500'
            >
              No data available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
