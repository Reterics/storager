import React from 'react';

interface StyledToggleProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
}

const StyledToggle: React.FC<StyledToggleProps> = ({
  label,
  name,
  checked,
  onChange,
  description,
}) => {
  return (
    <div className='flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3'>
      <div className='flex flex-col'>
        <label
          htmlFor={name}
          className='text-sm font-medium text-gray-700 dark:text-gray-300'
        >
          {label}
        </label>
        {description && (
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
            {description}
          </p>
        )}
      </div>
      <label
        htmlFor={name}
        className='relative inline-flex items-center cursor-pointer'
      >
        <input
          type='checkbox'
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          className='sr-only peer'
        />
        <div className='w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-checked:bg-blue-500 transition-colors duration-300'></div>
        <div className='absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform duration-300 transform peer-checked:translate-x-full dark:border-gray-600'></div>
      </label>
    </div>
  );
};

export default StyledToggle;
