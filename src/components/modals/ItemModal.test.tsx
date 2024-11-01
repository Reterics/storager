import {describe, expect, it, vi} from "vitest";
import {fireEvent, render} from "@testing-library/react";
import ItemModal from "./ItemModal.tsx";
import {defaultItems, defaultTypes} from "../../../tests/mocks/shopData.ts";
import DBContextProviderMock from "../../../tests/mocks/DBContextProviderMock.tsx";


describe('ItemModal', () => {
    const onClose = vi.fn();
    const setItem = vi.fn();
    const onSave = vi.fn();

    it.concurrent('Should not render the modal', () => {
        const container = render(
            <ItemModal
                onClose={onClose}
                onSave={onSave}
                setItem={setItem}
                item={null}
                inPlace={false}
            />
        )

        expect(container.container.innerHTML).toEqual('');

        container.unmount();
    })

    it.concurrent('Should show modal item as popup and fill the fields', () => {

        const container = render(
            <DBContextProviderMock>
                <ItemModal
                    onClose={onClose}
                    onSave={onSave}
                    setItem={setItem}
                    item={defaultItems[0]}
                    inPlace={false}
                />
            </DBContextProviderMock>
        )

        const inputs = container.getAllByRole('textbox');
        setItem.mockReset();

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

        expect(setItem.mock.calls.length).toEqual(7);

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
                <ItemModal
                    onClose={onClose}
                    onSave={onSave}
                    setItem={setItem}
                    item={{...defaultItems[0], type: undefined}}
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
