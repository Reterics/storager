import {describe, expect, it} from "vitest";
import {render} from "@testing-library/react";
import TestingPageProvider from "../../tests/mocks/TestingPageProvider.tsx";
import Parts from "./Parts.tsx";
import {defaultContextData, defaultParts} from "../../tests/mocks/shopData.ts";


describe('Parts', () => {
    it('renders the Parts page', () => {
        const renderResult = render(<TestingPageProvider><Parts /></TestingPageProvider>);

        const trList = renderResult.container.querySelectorAll('table > tbody > tr');

        expect(trList.length).toEqual(defaultParts.length);

        defaultParts.forEach((part, index) => {
            expect(trList[index].children[1].innerHTML).toEqual(part.sku);
        });
        renderResult.unmount();
    })
    it('renders the Parts page with proper ordering', () => {
        const ctxDataOverride = {...defaultContextData};
        ctxDataOverride.parts[0] = {...defaultParts[0], storage: [1000]};
        ctxDataOverride.parts[1] = {...defaultParts[1], storage: [0]};
        const renderResult = render(<TestingPageProvider ctxDataOverride={ctxDataOverride}><Parts /></TestingPageProvider>);

        const trList = renderResult.container.querySelectorAll('table > tbody > tr');

        expect(trList.length).toEqual(ctxDataOverride.parts.length);

        expect(trList[0].children[1].innerHTML).toEqual(ctxDataOverride.parts[1].sku);
        expect(trList[1].children[1].innerHTML).toEqual(ctxDataOverride.parts[0].sku);

        renderResult.unmount();
    })
})
