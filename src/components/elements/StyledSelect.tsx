import {StyledSelectArgs, StyledSelectOption} from "../../interfaces/interfaces.ts";
import {useTranslation} from "react-i18next";

export const textToOptions = (strings: string[], names: string[]|undefined):  StyledSelectOption[] => {
    return strings.map((string, index) => {
        return {value: string, name: names ? names[index] : string}
    });
}


export default function StyledSelect({
                                         value,
                                         onSelect,
                                         name,
                                         label,
                                         options,
                                     }: StyledSelectArgs) {
    const { t } = useTranslation();

    return (
        <div className={label !== false ? "relative z-0 w-full group" : "relative z-0 w-full group"}>
            {label !== false && (
                <label
                    htmlFor={name}
                    className="block mb-1 text-sm font-medium text-left text-gray-700 dark:text-gray-300"
                >
                    {label || name}
                </label>
            )}
            <select
                name={name}
                id={name}
                value={value}
                onChange={onSelect}
                className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700
                  dark:text-white dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
            >
                <option defaultChecked={true}>{t('Please Select')}</option>
                {options.map((option, index) => (
                    <option key={`${name}_${option.value}_${index}`} value={option.value}>
                        {option.name}
                    </option>
                ))}
            </select>

        </div>
    );
}
