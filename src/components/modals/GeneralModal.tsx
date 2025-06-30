import {GeneralModalArguments} from '../../interfaces/interfaces.ts';
import './GeneralModal.css';
import LoadingIcon from '../elements/LoadingIcon.tsx';
import {useState} from 'react';

export default function GeneralModal({
  visible,
  title,
  buttons,
  children,
  inPlace,
  id,
}: GeneralModalArguments) {
  const modalId = id || 'GeneralModal';
  const [throttled, setThrottled] = useState(false);

  const formClasses = {
    inPlace: 'flex flex-col max-h-[58vh] overflow-y-auto modalForm',
    default: 'flex flex-col max-h-[60vh] overflow-y-auto modalForm',
  };

  if (visible === false) return null;

  return (
    <div
      id={modalId}
      data-testid={modalId}
      className={
        inPlace
          ? 'flex justify-center items-center w-full max-w-screen-xl'
          : 'fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'
      }
      style={{zIndex: 999}}
      role={'dialog'}
    >
      <div className={
        inPlace ?
          'bg-white p-3 sm:p-4 rounded dark:bg-gray-900 w-full' :
          'bg-white p-3 sm:p-4 rounded dark:bg-gray-900 w-[95vw] sm:w-auto sm:min-w-[50vw] max-w-[95vw] sm:max-w-[80vw]'
      }>
        {title && (
          <h1 className='font-semibold text-center text-lg sm:text-xl text-gray-700 mb-3 sm:mb-4 dark:text-gray-200'>
            {title}
          </h1>
        )}

        <form className={inPlace ? formClasses.inPlace : formClasses.default}>
          {children}
        </form>
        <div className='hidden loading-parent'>
          <LoadingIcon />
        </div>
        <div className='flex flex-col sm:flex-row sm:justify-between gap-3 mt-4 sm:mt-2'>
          {(buttons || []).map((button, index) => (
            <button
              type='button'
              id={button.id}
              key={modalId + '_button_' + index}
              data-testid={button.testId}
              className={
                button.primary
                  ? 'text-white bg-gray-800 hover:bg-gray-900 focus:outline-none ' +
                    'focus:ring-4 focus:ring-gray-300 font-medium rounded-md text-sm px-3 py-1.5 ' +
                    'dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 ' +
                    'dark:border-gray-700'
                  : 'text-gray-900 bg-white border border-gray-300 focus:outline-none ' +
                    'hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-md ' +
                    'text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 ' +
                    'dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700'
              }
              onClick={async (e) => {
                if (!throttled) {
                  setThrottled(true);
                  setTimeout(() => {
                    setThrottled(false);
                  }, 2000);
                } else {
                  return;
                }
                const loadingIcon = document.querySelector(
                  '.loading-parent > svg'
                );
                if (loadingIcon) {
                  (e.target as HTMLButtonElement).innerHTML = '';
                  (e.target as HTMLButtonElement).appendChild(loadingIcon);
                }
                const validationResult = await button.onClick(e);
                if (validationResult === false) {
                  setThrottled(false);
                  if (loadingIcon) {
                    const loadingParent = document.querySelector(
                      '.loading-parent'
                    ) as HTMLElement;
                    if (loadingParent) {
                      loadingParent.appendChild(loadingIcon);
                    }
                    (e.target as HTMLButtonElement).innerHTML = button.value;
                  }
                }
              }}
            >
              {button.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
