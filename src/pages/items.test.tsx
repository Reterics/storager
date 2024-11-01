import {describe, expect, it} from "vitest";
import {render} from "@testing-library/react";
import TestingPageProvider from "../../tests/mocks/TestingPageProvider.tsx";
import Items from "./items.tsx";
import {defaultItems} from "../../tests/mocks/shopData.ts";


describe('Items', () => {
    it('renders the Items page', () => {
        const renderResult = render(<TestingPageProvider><Items /></TestingPageProvider>);

        const trList = renderResult.container.querySelectorAll('table > tbody > tr');

        expect(trList.length).toEqual(defaultItems.length);

        defaultItems.forEach((item, index) => {
            expect(trList[index].children[1].innerHTML).toEqual(item.sku);
        });
    })
})
