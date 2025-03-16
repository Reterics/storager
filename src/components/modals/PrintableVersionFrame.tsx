import {
    GeneralModalButtons, PrintableModalInput
} from "../../interfaces/interfaces.ts";
import {useTranslation} from "react-i18next";
import PrintablePaper from "../elements/PrintablePaper.tsx";
import {useEffect, useRef} from "react";
import {downloadElementAsPDF} from "../../utils/printViewHandler.ts";

export default function PrintableVersionFrame({ onClose, formData }: Readonly<PrintableModalInput>) {
    const { t } = useTranslation();

    const printRef = useRef<HTMLDivElement>(null);

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=> {
                if (printRef.current) {
                    void downloadElementAsPDF(printRef.current);
                }
            },
            value: t('Print')
        },
        {
            onClick: ()=> {
                if (typeof onClose === "function") {
                    onClose();
                } else {
                    window.close();
                }
            },
            value: t('Cancel')
        }
    ];

    const buttonClasses = {
        primary: "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none " +
            "focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-3 py-1.5 " +
            "dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 " +
            "dark:border-gray-700",
        default: "text-gray-900 bg-white border border-gray-300 focus:outline-none " +
            "hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg " +
            "text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 " +
            "dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
    };

    useEffect(() => {
        if (formData?.printNow && printRef.current) {
            downloadElementAsPDF(printRef.current).then(() => {
                if (typeof onClose === "function") {
                    onClose();
                } else {
                    window.close();
                }
            })
        }
    }, [formData, onClose]);

    if (!formData) return null;

    return (
        <div
            id={'printable-modal'}
            className={
                "flex justify-center items-center flex-col"
            }
            style={{zIndex: 999}}
        >
            <div className="flex justify-between mb-2 min-w-60 no-print">
                {
                    (buttons || []).map((button, index) => (
                        <button key={'print_top_' + index}
                                type="button"
                                className={ button.primary ? buttonClasses.primary : buttonClasses.default }
                                onClick={(e) => button.onClick(e)}>
                            {button.value}
                        </button>
                    ))
                }
            </div>
            <div className={"text-gray-900"} style={{paddingTop: '20mm', background: 'white'}}>
                <PrintablePaper data={formData.data} ref={printRef}>
                    {formData.signature && <img alt={'Signature'} src={formData.signature}/>}
                </PrintablePaper>
            </div>
            <div className="flex justify-between mt-2 min-w-60 no-print">
                {
                    (buttons || []).map((button, index) => (
                        <button type="button"
                                key={'print_bottom_' + index}
                                className={ button.primary ? buttonClasses.primary : buttonClasses.default }
                                onClick={(e) => button.onClick(e)}>
                            {button.value}
                        </button>
                    ))
                }
            </div>
        </div>
    )
}
