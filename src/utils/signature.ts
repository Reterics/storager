import type SignaturePad from 'react-signature-pad-wrapper';

export function exportSignatureAsJpeg(
  signaturePad: SignaturePad,
  quality = 0.92,
): string {
  const sourceCanvas = signaturePad.canvas?.current;
  if (!sourceCanvas) {
    return signaturePad.toDataURL('image/jpeg', quality);
  }

  const flattenedCanvas = document.createElement('canvas');
  flattenedCanvas.width = sourceCanvas.width;
  flattenedCanvas.height = sourceCanvas.height;

  const context = flattenedCanvas.getContext('2d');
  if (!context) {
    return signaturePad.toDataURL('image/jpeg', quality);
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, flattenedCanvas.width, flattenedCanvas.height);
  context.drawImage(sourceCanvas, 0, 0);

  return flattenedCanvas.toDataURL('image/jpeg', quality);
}
