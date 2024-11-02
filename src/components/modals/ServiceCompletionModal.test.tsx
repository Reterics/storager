import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";
import {fireEvent, render} from "@testing-library/react";
import ServiceCompletionModal from "./ServiceCompletionModal.tsx";
import DBContextProviderMock from "../../../tests/mocks/DBContextProviderMock.tsx";
import {serviceCompletionDataList} from "../../../tests/mocks/serviceData.ts";



describe('ServiceCompletionModal', () => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        HTMLCanvasElement.prototype.getContext = vi.fn(() => {
            return {
                fillRect: vi.fn(),
                clearRect: vi.fn(),
            };
        });
    })

    afterAll(() => {
        HTMLCanvasElement.prototype.getContext = originalGetContext;
    })

    const onClose = vi.fn();
    const setFromData = vi.fn();
    const onSave = vi.fn();

    it.concurrent('Should not render the modal', () => {
        const container = render(
            <ServiceCompletionModal
                onClose={onClose}
                onSave={onSave}
                setFromData={setFromData}
                formData={null}
                inPlace={true}
            />
        )
        expect(container.container.innerHTML).toEqual('');

        container.unmount();
    })

    it.concurrent('Should render the modal as popup and fill the fields', () => {
        const container = render(
            <DBContextProviderMock>
                <ServiceCompletionModal
                    onClose={onClose}
                    onSave={onSave}
                    setFromData={setFromData}
                    formData={serviceCompletionDataList[0]}
                    inPlace={false}
                />
            </DBContextProviderMock>
        )

        const inputs = container.getAllByRole('textbox');
        setFromData.mockReset();

        inputs.forEach(input => {
            fireEvent.change(input, { target: { value: 'TestServiceCompletion' } });
        });

        const guaranteedBox = container.getByRole('combobox', {name: 'Guaranteed'})

        expect(guaranteedBox).toBeDefined();
        fireEvent.change(guaranteedBox, {target: { value: 'no' } });

        const multiSelectBox = container.getByRole('listbox', {name: 'Type'})
        fireEvent.change(multiSelectBox, {target: { value: 'Back' } });

        expect(setFromData.mock.calls.length).equal(10);

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
                <ServiceCompletionModal
                    onClose={onClose}
                    onSave={onSave}
                    setFromData={setFromData}
                    formData={{...serviceCompletionDataList[0], type: undefined}}
                    inPlace={false}
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
    })
})