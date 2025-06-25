import {
  completionFormToPrintable,
  PrintableDataProps,
  serviceDataToPrintable,
} from './print.tsx';
import {DBContextType} from '../interfaces/firebase.ts';
import {
  ServiceCompleteData,
  ServiceData,
  SettingsItems,
} from '../interfaces/interfaces.ts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {TFunction} from 'i18next';

export const getPrintableData = (
  dbContext: DBContextType | null,
  id: string,
  t: TFunction,
  docType?: string,
  printNow?: boolean
): PrintableDataProps | null => {
  if (!dbContext?.data) return null;

  const {services, completions, settings, archive} = dbContext.data;

  let serviceData: ServiceData | undefined;
  let completionData: ServiceCompleteData | undefined;

  if (docType === 'services') {
    serviceData =
      services.find((item) => item.id === id) ||
      archive.find((item) => item.id === id);
  } else if (docType === 'completions') {
    completionData =
      completions.find((item) => item.id === id) ||
      archive.find((item) => item.id === id);
  } else {
    // If we didn't provide type, we search in all collections.
    // CompletionData id differs from serviceData
    serviceData = services.find((item) => item.id === id);
    if (!serviceData) {
      completionData = completions.find((item) => item.id === id);
    }
  }

  if (serviceData) {
    return serviceDataToPrintable(
      serviceData,
      settings || ({} as SettingsItems),
      t,
      printNow
    );
  } else if (completionData) {
    return completionFormToPrintable(completionData, t, printNow);
  }

  return null;
};

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

export const adjustPageHeight = (
  canvas: HTMLCanvasElement,
  sourceY: number,
  initialPageHeight: number,
  ctx: CanvasRenderingContext2D
) => {
  let pageHeight = initialPageHeight;
  const canvasHeight = canvas.height;
  const maxIncrease = 50; // Maximum number of pixels to increase
  let increaseCount = 0;

  while (sourceY + pageHeight < canvasHeight && increaseCount < maxIncrease) {
    const imageData = ctx.getImageData(
      0,
      sourceY + pageHeight - 1,
      canvas.width,
      1
    );
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
};

export const downloadElementAsPDF = async (element: HTMLDivElement) => {
  // Define padding in PDF units (millimeters)
  const padding = {
    top: 12, // Top margin
    right: 10, // Right margin
    bottom: 28, // Bottom margin
    left: 10, // Left margin
  };

  // Capture the element as a canvas
  const canvas = await html2canvas(element, {
    // scale: 2, // Increase scale for better quality
    scale: 1,
    useCORS: true, // Enable cross-origin images
    allowTaint: true,
    backgroundColor: '#FFFFFF',
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
  const pageCtx = pageCanvas.getContext('2d', {willReadFrequently: true});

  if (!pageCtx) {
    throw SyntaxError('Canvas rendering context error');
  }

  // Set dimensions of the temporary canvas
  pageCanvas.width = canvas.width;
  pageCanvas.height = (canvas.width * contentHeight) / imgWidth;

  let sourceY = 0;
  for (let i = 0; i < totalPages; i++) {
    // const sourceY = i * pageCanvas.height;
    let pageHeight = Math.min(pageCanvas.height, canvas.height - sourceY);

    // Adjust page height if it's the last page
    if (sourceY + pageHeight > canvas.height) {
      pageHeight = canvas.height - sourceY;
      pageCanvas.height = pageHeight;
    }

    // **Adjust page height to prevent text from being cut off**
    pageHeight = adjustPageHeight(canvas, sourceY, pageHeight, pageCtx);
    if (pageHeight <= 0) {
      console.warn(`Skipping empty page at iteration ${i}, sourceY=${sourceY}`);
      continue;
    }
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
    sourceY += pageHeight;
  }

  pdf.save('contract.pdf');
};
