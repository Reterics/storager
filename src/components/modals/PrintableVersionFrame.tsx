import {
    GeneralModalButtons, PrintableModalInput
} from "../../interfaces/interfaces.ts";
import {useTranslation} from "react-i18next";
import PrintablePaper from "../elements/PrintablePaper.tsx";
import {useEffect, useRef} from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PrintableVersionFrame({ onClose, formData }: Readonly<PrintableModalInput>) {
    const { t } = useTranslation();

    const printRef = useRef<HTMLDivElement>(null);

    function adjustPageHeight(canvas: HTMLCanvasElement, sourceY: number, initialPageHeight: number, ctx: CanvasRenderingContext2D) {
        let pageHeight = initialPageHeight;
        const canvasHeight = canvas.height;
        const maxIncrease = 50; // Maximum number of pixels to increase
        let increaseCount = 0;

        while (sourceY + pageHeight < canvasHeight && increaseCount < maxIncrease) {
            const imageData = ctx.getImageData(0, sourceY + pageHeight - 1, canvas.width, 1);
            if (lineContainsNonWhitePixels(imageData.data)) {
                pageHeight += 1; // Increase pageHeight by one pixel
                increaseCount += 1;
            } else {
                // Found a clear (white) line
                break;
            }
        }

        // Ensure pageHeight does not exceed canvas height
        if (sourceY + pageHeight > canvasHeight) {
            pageHeight = canvasHeight - sourceY;
        }

        return pageHeight;
    }

    function lineContainsNonWhitePixels(data: Uint8ClampedArray) {
        // data is a Uint8ClampedArray containing RGBA values
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            // Check if pixel is not white and fully opaque
            if (!(r === 255 && g === 255 && b === 255 && a === 255)) {
                return true;
            }
        }
        return false;
    }

    const handleDownloadPdf = async () => {
        const element = printRef.current;
        if (!element) return;

        // Define padding in PDF units (millimeters)
        const padding = {
            top: 12,     // Top margin
            right: 10,   // Right margin
            bottom: 28,  // Bottom margin
            left: 10,    // Left margin
        };

        // Capture the element as a canvas
        const canvas = await html2canvas(element, {
            // scale: 2, // Increase scale for better quality
            scale: 1,
            useCORS: true, // Enable cross-origin images
        });

        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate available width and height after subtracting margins
        const contentWidth = pdfWidth - padding.left - padding.right;
        const contentHeight = pdfHeight - padding.top - padding.bottom;

        // Calculate image dimensions in PDF units
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Calculate the number of pages
        const totalPages = Math.ceil(imgHeight / contentHeight);

        // Create a temporary canvas to store each page's portion
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');

        if (!pageCtx) {
            throw SyntaxError('Canvas rendering context error');
        }

        // Set dimensions of the temporary canvas
        pageCanvas.width = canvas.width;
        pageCanvas.height = (canvas.width * contentHeight) / imgWidth;

        for (let i = 0; i < totalPages; i++) {
            const sourceY = i * pageCanvas.height;
            let pageHeight = pageCanvas.height;

            // Adjust page height if it's the last page
            if (sourceY + pageHeight > canvas.height) {
                pageHeight = canvas.height - sourceY;
                pageCanvas.height = pageHeight;
            }

            // **Adjust page height to prevent text from being cut off**
            pageHeight = adjustPageHeight(canvas, sourceY, pageHeight, pageCtx);

            // Update the height of the temporary canvas
            pageCanvas.height = pageHeight;

            // Clear the context to avoid drawing over previous pages
            pageCtx.clearRect(0, 0, pageCanvas.width, pageHeight);

            // Draw the current page's portion of the canvas
            pageCtx.drawImage(
                canvas,
                0,
                sourceY,
                canvas.width,
                pageHeight,
                0,
                0,
                canvas.width,
                pageHeight
            );

            // Convert the page canvas to an image
            const imgData = pageCanvas.toDataURL('image/png');

            // Add a new page if we're not on the first page
            if (i > 0) {
                pdf.addPage();
            }

            // Add the image to the PDF with padding
            pdf.addImage(
                imgData,
                'PNG',
                padding.left,
                padding.top,
                imgWidth,
                (pageHeight * imgWidth) / pageCanvas.width
            );
        }

        pdf.save('contract.pdf');
    };

    const buttons: GeneralModalButtons[] = [
        {
            primary: true,
            onClick: ()=>handleDownloadPdf(),
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
        if (formData?.printNow) {
            handleDownloadPdf().then(() => {
                if (typeof onClose === "function") {
                    onClose();
                } else {
                    window.close();
                }
            })
        }
    }, [formData]);

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
