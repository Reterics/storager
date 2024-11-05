import {describe, expect, it} from "vitest";
import {render} from "@testing-library/react";
import PageLoading from "./PageLoading.tsx";


describe('PageLoading', () => {
    it('should render PageLoading', () => {
        const {getByText} = render(
            <PageLoading />);

        expect(getByText('Loading...')).toBeDefined();
    });
})
