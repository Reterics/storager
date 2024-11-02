import { describe, it, expect } from 'vitest'
import PrintablePaper from './PrintablePaper'
import {render} from "@testing-library/react";
import {mockEmptyPDFData, mockPDFData} from "../../../tests/mocks/printData.ts";
import {PDFData} from "../../interfaces/pdf.ts";
import {RefObject} from "react";
import {serviceDataList} from "../../../tests/mocks/serviceData.ts";

describe('PrintablePaper', () => {
    it.concurrent('renders PrintablePaper', async () => {

        const formData = mockPDFData as {
            data: PDFData,
            signature?: string,
            printNow?: boolean
        };


        formData.data.push({'Name': 'Strong Title Test'});
        formData.data.push(['egy', 'keto', {
            name: 'Nev'
        }]);
        const result = render(
            <div className={"text-gray-900"} style={{paddingTop: '20mm', background: 'white'}}>
                <PrintablePaper data={formData.data} ref={undefined as unknown as RefObject<HTMLDivElement>}>
                    <img alt={'Signature'} src={undefined}/>
                </PrintablePaper>
            </div>
        )

        expect(result.container.children.length).toEqual(1)
        expect(result.container.children[0].children.length).toEqual(1)
        expect(result.container.children[0].children[0].children.length).toEqual(24)


        expect(result.getByText(serviceDataList[0].client_name as string)).toBeDefined()
        expect(result.getByText(serviceDataList[0]?.service_name as string)).toBeDefined()
        expect(result.getByText('Strong Title Test')).toBeDefined()

        result.unmount();
    })

    it.concurrent('Should render an empty page', async () => {
        const formData = mockEmptyPDFData as {
            data: PDFData,
            signature?: string,
            printNow?: boolean
        };

        const result = render(
            <div className={"text-gray-900"} style={{paddingTop: '20mm', background: 'white'}}>
                <PrintablePaper data={formData.data} ref={undefined as unknown as RefObject<HTMLDivElement>}>
                    <img alt={'Signature'} src={undefined}/>
                </PrintablePaper>
            </div>
        )
        expect(result.queryByText(serviceDataList[0].client_name as string)).toBeNull()
        expect(result.queryByText(serviceDataList[0]?.service_name as string)).toBeNull()
        result.unmount();
    })
})