import type {
  GeneralButtons,
  StyledSelectOption,
} from '../../interfaces/interfaces.ts';
import AlertBox from '../AlertBox.tsx';
import { BsSearch } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { debounce } from 'throttle-debounce';
import { useCallback, useContext, useRef } from 'react';
import StyledSelect from './StyledSelect.tsx';
import { tableViewOptions } from '../../interfaces/constants.ts';
import { DBContext } from '../../database/DBContext.ts';

export const PageHead = ({
  buttons,
  title,
  error,
  onSearch,
  debounceInterval = 500,
  tableLimits,
  setTableLimits,
  shopFilter,
  setShopFilter,
  activeFilter,
  setActiveFilter,
  children,
}: {
  buttons?: GeneralButtons[];
  title?: string | React.ReactNode;
  error?: string;
  onSearch?: (value: string) => void;
  tableLimits?: number;
  setTableLimits?: (value: number) => void;
  shopFilter?: string | null;
  setShopFilter?: (value: string) => void;
  activeFilter?: boolean | null;
  setActiveFilter?: (value: boolean) => void;
  debounceInterval?: false | number;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement>(null);
  const dbContext = useContext(DBContext);
  const shopOptions: StyledSelectOption[] =
    dbContext?.data.shops?.map((shop) => {
      return {
        value: shop.name ?? '',
        name: shop.name ?? '',
      };
    }) || [{ value: shopFilter ?? '', name: shopFilter ?? '' }] ||
    [];

  shopOptions.unshift({ value: '', name: t('All shop') });

  const activeOptions = [
    { value: '', name: t('No filter') },
    { value: 'true', name: t('Only active') },
  ];

  const onClickSearch = () => {
    if (ref.current && onSearch) {
      onSearch(ref.current.value);
    }
  };

  const debounceFunc = debounce(
    debounceInterval || 500,
    (value: string) => {
      if (onSearch) {
        onSearch(ref.current ? ref.current.value : value);
      }
    },
    { atBegin: false },
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!onSearch || !e.target) return;
      if (e.key === 'Enter') {
        onSearch((e.target as HTMLInputElement).value);
      } else if (typeof debounceInterval === 'number') {
        debounceFunc((e.target as HTMLInputElement).value);
      }
    },
    [debounceFunc, debounceInterval, onSearch],
  );

  return (
    <div className="flex self-center max-w-screen-xl w-full no-print min-h-fit">
      <div className="flex justify-between items-center w-full px-0 py-1 gap-1 flex-wrap">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          {title && (
            <h1 className="ps-1 text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
          {children}
          {error && <AlertBox message={error} role={'warning'} />}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {setActiveFilter && (
            <StyledSelect
              options={activeOptions}
              name="active"
              value={activeFilter ? 'true' : undefined}
              defaultLabel={activeOptions[0].name}
              onSelect={(e) =>
                setActiveFilter(!!(e.target as HTMLSelectElement).value)
              }
              label={false}
              compact={true}
            />
          )}
          {setShopFilter && (
            <StyledSelect
              options={shopOptions}
              name="shop"
              value={shopFilter || undefined}
              defaultLabel={shopOptions[0].name}
              onSelect={(e) =>
                setShopFilter((e.target as HTMLSelectElement).value)
              }
              label={false}
              compact={true}
            />
          )}
          {setTableLimits && tableLimits && (
            <StyledSelect
              options={tableViewOptions}
              name="tableLimit"
              value={tableLimits || tableViewOptions[0].value}
              defaultLabel={tableViewOptions[0].name}
              onSelect={(e) =>
                setTableLimits(Number((e.target as HTMLSelectElement).value))
              }
              label={false}
              compact={true}
            />
          )}

          {onSearch && (
            <div className="flex">
              <input
                ref={ref}
                onKeyDown={handleKeyPress}
                type="text"
                data-testid="searchInput"
                className="block w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-l-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder={t('Search...')}
              />
              <button
                onClick={onClickSearch}
                type="button"
                data-testid="searchButton"
                className="px-2.5 py-2 text-white bg-gray-800 hover:bg-gray-900 rounded-r-md focus:ring-2 focus:ring-gray-400 focus:outline-none"
              >
                <BsSearch size={18} />
              </button>
            </div>
          )}

          {(buttons || []).map((button, index) => (
            <button
              key={'heading-' + index}
              type="button"
              className={
                'text-sm font-medium rounded ' +
                (button.primary
                  ? 'text-white bg-gray-800 hover:bg-gray-900'
                  : 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600') +
                (typeof button.value === 'string'
                  ? ' px-3 py-1.5'
                  : ' px-3 py-2.5')
              }
              onClick={button.onClick}
              data-testid={button.testId}
            >
              {button.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
