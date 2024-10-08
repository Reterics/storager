
interface PDFKVPair {
    [key: string]: string;
}

type PDFCol = PDFKVPair | string | undefined;
type PDFRow = PDFCol[];
export type PDFData = Array<PDFRow | PDFCol | string>;
