import {describe, it, expect, vi, beforeAll, MockInstance, afterAll} from 'vitest';
import {screen} from '@testing-library/react'
import {downloadAsFile, fileToDataURL, readJSONFile, readTextFile, uploadFileInputAsText} from "./general.ts";


describe('General Utils', () => {

    let originalObjectURL: (obj: Blob | MediaSource) => string;
    let appendChildSpy: MockInstance;

    beforeAll(() => {
        originalObjectURL = global.URL.createObjectURL;

        global.URL.createObjectURL = vi.fn(() => 'blob:http://example.com/mock-url');
        appendChildSpy = vi.spyOn(document.body, 'appendChild');

    });

    afterAll(()=>{
        global.URL.createObjectURL = originalObjectURL;
        if (appendChildSpy) {
            appendChildSpy.mockRestore()
        }
    })

    it('downloadAsFile should create a download link with the proper URL', async () => {
        downloadAsFile('test-file.txt', 'test body content');

        const anchor = appendChildSpy.mock.calls[0][0];

        expect(anchor.download).toBe('test-file.txt');

        expect(anchor.href).toBe('blob:http://example.com/mock-url');

        expect(screen.queryByText('Download As File')).toBeNull()
    });


    it('fileToDataURL converts a file to a data URL', async () => {
        const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
        const dataURL = 'data:text/plain;base64,' + btoa('file content');

        const fileReaderSpy = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.onload({ target: { result: dataURL } });
        });

        const result = await fileToDataURL(mockFile);

        fileReaderSpy.mockRestore();
        expect(result).toBe(dataURL);
    });

    it('uploadFileInputAsText reads a file as text', async () => {
        const mockFile = new Blob(['file content'], { type: 'text/plain' });
        const readerSpy = vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.onload({ target: { result: 'file content' } });
        });

        const result = await uploadFileInputAsText(mockFile);

        readerSpy.mockRestore();
        expect(result).toBe('file content');
    });

    it('readTextFile creates a file input, reads the file, and resolves with file data', async () => {
        const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
        const appendChildSpy = vi.spyOn(document.body, 'appendChild');
        const readerSpy = vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.onload({ target: { result: 'file content' } });
        });

        const promise = readTextFile();
        const fileInput = appendChildSpy.mock.calls[0][0] as HTMLInputElement;

        Object.defineProperty(fileInput, 'files', {
            value: [mockFile],
            writable: false,
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await fileInput.onchange();

        const result = await promise;
        readerSpy.mockRestore();
        appendChildSpy.mockRestore();
        expect(result).toEqual({
            value: 'file content',
            file_input: mockFile,
        });
    });

    it('readJSONFile reads a JSON file and parses its content', async () => {
        const fileContent = JSON.stringify({ key: 'value' });
        const mockFile = new File([fileContent], 'test.txt', { type: 'text/plain' });

        const readerSpy = vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.onload({ target: { result: fileContent } });
        });
        const appendChildSpy = vi.spyOn(document.body, 'appendChild');


        const result = readJSONFile();
        const fileInput = appendChildSpy.mock.calls[0][0] as HTMLInputElement;

        Object.defineProperty(fileInput, 'files', {
            value: [mockFile],
            writable: false,
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await fileInput.onchange();

        readerSpy.mockRestore();
        appendChildSpy.mockRestore();

        expect(await result).toEqual({ key: 'value' });
    });

    it('readJSONFile returns null if JSON parsing fails', async () => {
        const fileContent = 'invalid json';
        const mockFile = new File(['invalid json'], 'test.json', { type: 'application/json' });

        const readerSpy = vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function () {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.onload({ target: { result: fileContent } });
        });
        const appendChildSpy = vi.spyOn(document.body, 'appendChild');


        const result = readJSONFile();
        const fileInput = appendChildSpy.mock.calls[0][0] as HTMLInputElement;
        Object.defineProperty(fileInput, 'files', {
            value: [mockFile],
            writable: false,
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await fileInput.onchange();

        readerSpy.mockRestore();
        appendChildSpy.mockRestore();
        expect(await result).toBeNull();
    });
});
