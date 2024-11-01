import {describe, expect, it, vi} from "vitest";
import {fireEvent, render} from "@testing-library/react";
import PartModal from "./PartModal.tsx";
import {defaultParts, defaultTypes} from "../../../tests/mocks/shopData.ts";
import DBContextProviderMock from "../../../tests/mocks/DBContextProviderMock.tsx";

describe('PartModal', () => {
    const onClose = vi.fn();
    const setPart = vi.fn();
    const onSave = vi.fn();

    it.concurrent('Should not render the modal', () => {
        const container = render(
            <PartModal
                onClose={onClose}
                onSave={onSave}
                setPart={setPart}
                part={null}
                inPlace={false}
            />
        )

        expect(container.container.innerHTML).toEqual('');

        container.unmount();
    })

    it.concurrent('Should show modal item as popup and fill the fields', () => {

        const container = render(
            <DBContextProviderMock>
                <PartModal
                    onClose={onClose}
                    onSave={onSave}
                    setPart={setPart}
                    part={defaultParts[0]}
                    inPlace={false}
                />
            </DBContextProviderMock>
        )

        const inputs = container.getAllByRole('textbox');
        setPart.mockReset();

        inputs.forEach(input => {
            fireEvent.change(input, { target: { value: 'Test12' } });
        });

        const numbers = container.container.querySelectorAll('input[type=number]');
        numbers.forEach(input => {
            fireEvent.change(input, { target: { value: '16789' } });
        });

        fireEvent.change(container.getByRole('combobox'), { target: { value: defaultTypes[1].name } });

        const select = container.container.querySelector('select');

        expect(select).toBeDefined();

        if (select) fireEvent.select(select, { target: { value: defaultTypes[1].name } });

        expect(setPart.mock.calls.length).toEqual(7);

        const buttons = container.queryAllByRole('button');

        const saveButton = buttons.find(b=> b.innerHTML === 'Save');
        expect(saveButton).toBeDefined();

        onSave.mockReset();
        if (saveButton) fireEvent.click(saveButton)
        expect(onSave.mock.calls.length).toEqual(1)

        container.unmount();
    })

    it.concurrent('Should render in place and close', () => {
        const container = render(
            <DBContextProviderMock>
                <PartModal
                    onClose={onClose}
                    onSave={onSave}
                    setPart={setPart}
                    part={defaultParts[0]}
                    inPlace={true}
                />
            </DBContextProviderMock>
        )

        const buttons = container.queryAllByRole('button');

        const closeButton = buttons.find(b=> b.innerHTML === 'Cancel');
        expect(closeButton).toBeDefined();

        onClose.mockReset();
        if (closeButton) fireEvent.click(closeButton)
        expect(onClose.mock.calls.length).toEqual(1)
        container.unmount();
    });
})
