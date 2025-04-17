import {ChangeEvent, useState} from 'react';
import {fileToDataURL} from '../../utils/general.ts';

export default function StyledFile({
  name,
  label,
  onChange,
  accept,
  defaultPreview,
  preview,
}: {
  name: string;
  label?: string;
  onChange: (file: File) => void;
  accept?: string;
  preview?: boolean;
  defaultPreview?: string;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(
    defaultPreview || null
  ); // Add state for the image source

  const reloadPreview = async (file: File) => {
    const screenshot = (await fileToDataURL(file)) as string;
    if (screenshot) {
      setImageSrc(screenshot);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      void reloadPreview(file);
      onChange(file);
    }
  };

  return (
    <div className='relative z-0 w-full group'>
      <div className='relative'>
        {label && (
          <label
            className='block mb-2 text-sm font-medium text-left text-gray-900 dark:text-gray-300'
            htmlFor={name}
          >
            {label}
          </label>
        )}
        <input
          className='block w-full text-sm border border-gray-300 rounded-lg cursor-pointer bg-gray-50
                       text-gray-900 dark:text-gray-300 focus:outline-none dark:bg-gray-700 dark:border-gray-600
                       dark:placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
                       file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-500 hover:file:bg-gray-300
                       dark:file:bg-gray-600 dark:file:text-gray-300 hover:dark:file:bg-gray-500'
          id={name}
          type='file'
          name={name}
          onChange={handleFileChange}
          accept={accept}
        />
      </div>

      {preview && (
        <div className='mt-1 flex align-middle justify-center'>
          {imageSrc && (
            <img
              src={imageSrc}
              alt='Preview'
              className='max-w-full h-auto rounded-lg shadow-md max-h-32'
            />
          )}
        </div>
      )}
    </div>
  );
}
