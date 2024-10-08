import {GeneralButtons} from "../../interfaces/interfaces.ts";
import AlertBox from "../AlertBox.tsx";


export const PageHead = ({buttons, title, error}: {buttons?: GeneralButtons[], title?: string, error?: string}) => {
    return (
        <div className="flex justify-center overflow-x-auto sm:rounded-lg w-full m-auto no-print">
            <div className="flex justify-between max-w-screen-xl m-2 p-2 w-full">
                <h1 className="text-2xl font-bold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-3xl dark:text-white">
                    {title}
                </h1>

                {error && <AlertBox message={error} role={"warning"} /> }
                {
                    (buttons||[]).map((button, index,) => (
                        <button type="button"
                                key={"heading-"+index}
                                className={
                                    button.primary ? "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none " +
                                        "focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-md px-5 py-2.5 " +
                                        "mr-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 " +
                                        "dark:border-gray-700" :
                                        "text-gray-900 bg-white border border-gray-300 focus:outline-none " +
                                        "hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg " +
                                        "text-md px-5 py-2.5 mr-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 " +
                                        "dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                }
                                onClick={(e)=>button.onClick(e)}>
                            {button.value}
                        </button>
                    ))
                }
            </div>
        </div>
    )
}
