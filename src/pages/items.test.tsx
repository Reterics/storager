import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";
import {fireEvent, render} from "@testing-library/react";
import TestingPageProvider from "../../tests/mocks/TestingPageProvider.tsx";
import Items from "./items.tsx";
import {defaultContextData, defaultItems} from "../../tests/mocks/shopData.ts";
import AuthContextProviderMock from "../../tests/mocks/AuthContextProviderMock.tsx";


describe('Items', () => {
    beforeAll(()=>{
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    })
    it.concurrent('Should not render if no user active', ()=>{
        const renderResult = render(<TestingPageProvider
            ctxDataOverride={{...defaultContextData, currentUser: undefined}}>
            <Items />
        </TestingPageProvider>);

        expect(renderResult.container.querySelector('#ItemModal')).toBeNull();
        renderResult.unmount();
    })
    it.concurrent('renders the Items page', () => {
        const renderResult = render(<TestingPageProvider><Items /></TestingPageProvider>);

        const trList = renderResult.container.querySelectorAll('table > tbody > tr');

        expect(trList.length).toEqual(defaultItems.length);

        defaultItems.forEach((item, index) => {
            expect(trList[index].children[1].innerHTML).toEqual(item.sku);
        });

        const buttons = renderResult.queryAllByRole('button');
        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[1]);

        expect(renderResult.container.querySelector('#ItemModal')).toBeDefined();
        renderResult.unmount();
    })

    it('renders the items page without data', () => {
        const renderResult = render(<AuthContextProviderMock><Items /></AuthContextProviderMock>);
        expect(renderResult.container.querySelector('#ItemModal')).toBeDefined();
    })

    afterAll(() => {
        vi.restoreAllMocks();
    });
})
