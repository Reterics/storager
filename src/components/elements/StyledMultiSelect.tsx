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

    const handleCheckboxChange = (selectedValue: string) => {
        const updatedSelectedValues = value.includes(selectedValue)
            ? value.filter((val) => val !== selectedValue)
            : [...value, selectedValue];
        onSelect(updatedSelectedValues);
    };

    return (
        <div className="relative z-0 w-full group">
            {label !== false && (
                <label
                    htmlFor={name}
                    className="block mb-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300"
                >
                    {label || name}
                </label>
            )}
            <div className="flex flex-col border border-gray-300 rounded-md p-3 dark:border-gray-600 max-h-48 overflow-y-auto">
                {options.map((option, index) => (
                    <div key={`${name}_${option.value}_${index}`} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            role="checkbox"
                            id={`${name}_${option.value}`}
                            checked={value.includes(option.value)}
                            onChange={() => handleCheckboxChange(option.value)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500"
                        />
                        <label
                            htmlFor={`${name}_${option.value}`}
                            className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                        >
                            {option.name}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
