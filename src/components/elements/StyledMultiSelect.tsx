import { StyledSelectOption } from "../../interfaces/interfaces.ts";

interface StyledMultiSelectArgs {
    value: string[];
    onSelect: (selectedValues: string[]) => void;
    name: string;
    label?: string | false;
    options: StyledSelectOption[];
}

export default function StyledMultiSelect({
  value,
  onSelect,
  name,
  label,
  options,
}: StyledMultiSelectArgs) {

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(event.target.selectedOptions).map(
            (option) => option.value
        );
        onSelect(selectedOptions);
    };

    return (
        <div
            className={
                label !== false ? "relative z-0 w-full group" : "relative z-0 w-full group"
            }
        >
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
                onChange={handleChange}
                multiple
                className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700
          dark:text-white dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500 h-48"
                required
            >
                {options.map((option, index) => (
                    <option key={`${name}_${option.value}_${index}`} value={option.value}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
