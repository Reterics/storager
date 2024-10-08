import {
    GeneralModalButtons, PrintableModalInput
} from "../../interfaces/interfaces.ts";
import {useTranslation} from "react-i18next";
import PrintablePaper from "../elements/PrintablePaper.tsx";
import {useRef} from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PrintableVersionModal({ id, onClose, formData, inPlace }: PrintableModalInput) {
    const { t } = useTranslation();

    const printRef = useRef<HTMLDivElement>(null);
    const handleDownloadPdf = async () => {
        const element = printRef.current;
        if (!element) return;
        const canvas = await html2canvas(element, {
            scale: 2, // Increase scale for better quality
            useCORS: true, // Enable cross-origin images
        });
        const dataUrl = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('contract.pdf');
    };

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=>handleDownloadPdf(),
            value: t('Print')
        },
        {
            onClick: onClose,
            value: t('Cancel')
        }
    ];

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
                    (buttons || []).map(button => (
                        <button type="button"
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
                                onClick={(e) => button.onClick(e)}>
                            {button.value}
                        </button>
                    ))
                }
            </div>
            <PrintablePaper data={formData} ref={printRef}/>
            <div className="flex justify-between mt-2 min-w-60 no-print">
                {
                    (buttons || []).map(button => (
                        <button type="button"
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
                                onClick={(e) => button.onClick(e)}>
                            {button.value}
                        </button>
                    ))
                }
            </div>
        </div>
    )
}
