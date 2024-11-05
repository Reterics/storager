import {describe, expect, it, Mock} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {Footer} from "./Footer.tsx";
import ThemeContextProviderMock from "../../tests/mocks/ThemeContextProviderMock.tsx";
import {useTranslation} from "react-i18next";
import TestingPageProvider from "../../tests/mocks/TestingPageProvider.tsx";


describe('Footer', () => {
    it('should render Footer', async () => {
        const {i18n} = useTranslation();

        const {getByText, rerender} = render(
            <ThemeContextProviderMock><Footer /></ThemeContextProviderMock>);

        const languageSelector = getByText('Hungarian language');
        fireEvent.click(languageSelector);
        fireEvent.click(languageSelector);
        await waitFor(()=> expect((i18n.changeLanguage as Mock).mock.calls.length).toEqual(2))
        await waitFor(()=> expect(getByText('Hungarian language')).toBeDefined())

        const themeSelector = getByText('Dark Mode');
        fireEvent.click(themeSelector);
        fireEvent.click(themeSelector);
        await waitFor(()=> expect(getByText('Dark Mode')).toBeDefined());

        rerender(
            <TestingPageProvider><Footer /></TestingPageProvider>);

        expect(getByText('default')).toBeDefined();
    });
})
