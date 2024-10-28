import { GeneralButtons } from "../../interfaces/interfaces.ts";
import AlertBox from "../AlertBox.tsx";
import {BsSearch} from "react-icons/bs";
import {useTranslation} from "react-i18next";
import { debounce } from 'throttle-debounce';
import {useCallback, useRef} from "react";


export const PageHead = ({ buttons, title, error, onSearch, debounceInterval = 500 }:
    {
        buttons?: GeneralButtons[],
        title?: string,
        error?: string,
        onSearch?: (value: string) => void,
        debounceInterval?: false | number
    }) => {
    const { t } = useTranslation();
    const ref = useRef<HTMLInputElement>(null);

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
        { atBegin: false }
    );

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!onSearch || !e.target) {
            return;
        }
        if (e.key === "Enter") {
            onSearch((e.target as HTMLInputElement).value as string);
        } else if (typeof debounceInterval === "number") {
            debounceFunc((e.target as HTMLInputElement).value as string)
        }
    }, [debounceFunc, debounceInterval, onSearch]);

    return (
        <div className="flex justify-center overflow-x-auto sm:rounded-lg w-full m-auto no-print">
            <div className="flex justify-between items-center max-w-screen-xl m-1 mt-0 p-2 pt-1 w-full">
                <h1 className="text-2xl font-bold leading-none tracking-tight text-gray-900 lg:text-3xl dark:text-white">
                    {title}
                </h1>

                {error && <AlertBox message={error} role={"warning"} />}

                <div className="flex items-center space-x-2">
                    {onSearch &&
                    <div className="flex">
                        <input
                            ref={ref}
                            onKeyDown={handleKeyPress}
                            type="text"
                            className="block w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                            placeholder={t('Search...')}
                        />
                        <button
                            onClick={onClickSearch}
                            type="button"
                            className="px-2.5 py-2 text-white bg-gray-800 hover:bg-gray-900 rounded-r-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        >
                            <BsSearch size={18} />
                        </button>
                    </div>}

                    {/* Buttons */}
                    {(buttons || []).map((button, index) => (
                        <button
                            key={"heading-" + index}
                            type="button"
                            className={
                                button.primary
                                    ? "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-md px-5 py-2.5 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                                    : "text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-md px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                            }
                            onClick={button.onClick}
                        >
                            {button.value}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
