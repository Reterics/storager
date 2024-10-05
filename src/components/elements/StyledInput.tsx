import { StyledInputArgs } from "../../interfaces/interfaces.ts";
import {ChangeEvent} from "react";

export default function StyledInput({
                                        value,
                                        onChange,
                                        type = "text",
                                        name,
                                        label,
                                        placeholder,
                                        pattern,
                                        maxLength,
                                        min,
                                        max,
                                        className,
                                    }: StyledInputArgs) {
    // TODO: Pattern validation

    const validateOnFocusLoss = () => {
        if (pattern && value) {
            if (new RegExp(pattern as string, "g").test(value.toString())) {
                console.log(value + " is matching with " + pattern);
                return;
            }
            console.warn("Value is not matching with " + pattern);
        }
    };

    return (
        <div className={"relative z-0 w-full group " + (className || "")}>
            {label && (
                <label
                    htmlFor={name}
                    className="block mb-1 text-sm text-left font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
            )}
            {type !== 'textarea' &&
                <input
                    type={type}
                    name={name}
                    id={name}
                    value={value === undefined ? "" : value}
                    onChange={onChange}
                    onBlur={validateOnFocusLoss}
                    className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700
                       dark:text-white dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder={placeholder || ""}
                    min={min}
                    max={max}
                    maxLength={maxLength}
                    pattern={pattern}
                    required
                /> }
            {type === "textarea" &&
                <textarea
                    name={name}
                    id={name}
                    value={value === undefined ? "" : value}
                    onChange={(e)=> onChange ? onChange(e as unknown as ChangeEvent<HTMLInputElement>) : undefined}
                    onBlur={validateOnFocusLoss}
                    className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700
                   dark:text-white dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500 h-48"
                    placeholder={placeholder || ""}
                    maxLength={maxLength}
                    required
                > </textarea>
            }

        </div>
    );
}
