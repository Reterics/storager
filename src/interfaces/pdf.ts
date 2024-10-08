
interface PDFKVPair {
    [key: string]: string;
}

type PDFCol = PDFKVPair | string | unknown;
type PDFRow = PDFCol[];
export type PDFData = Array<PDFRow | PDFCol | string>;
