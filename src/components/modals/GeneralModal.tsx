import {GeneralModalArguments} from "../../interfaces/interfaces.ts";
import './GeneralModal.css';

export default function GeneralModal({
                                         visible,
                                         title,
                                         buttons,
                                         children,
                                         inPlace,
                                         id
                                     } :GeneralModalArguments
) {

    const modalId = id || "GeneralModal";

    const formClasses = {
        inPlace: "flex flex-col max-h-[45vh] overflow-y-auto modalForm pe-1",
        default: "flex flex-col max-h-[60vh] overflow-y-auto modalForm pe-1"
    }

    if (visible === false) return null;

    return (
        <div
            id={modalId}
            className={
                inPlace ?
                    "flex justify-center items-center" :
                    "fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center"
            }
            style={{zIndex:999}}
        >
            <div className="bg-white p-4 rounded dark:bg-gray-900 min-w-[50vw]">
                <h1 className="font-semibold text-center text-xl text-gray-700 mb-4 dark:text-gray-200">
                    {title || ''}
                </h1>

                <form className={inPlace ? formClasses.inPlace : formClasses.default}>
                    {children}
                </form>
                <div className="flex justify-between mt-2">
                    {
                        (buttons||[]).map((button, index)=> (
                            <button type="button"
                                    id={button.id}
                                    key={modalId + "_button_" + index}
                                    className={
                                        button.primary ? "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none " +
                                            "focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-3 py-1.5 " +
                                            "dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 " +
                                            "dark:border-gray-700" :
                                            "text-gray-900 bg-white border border-gray-300 focus:outline-none " +
                                            "hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg " +
                                            "text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 " +
                                            "dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                    }
                                    onClick={(e)=>button.onClick(e)}>
                                {button.value}
                            </button>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
