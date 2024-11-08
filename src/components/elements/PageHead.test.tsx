import {render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {PageHead} from './PageHead'
import {BsFillPlusCircleFill} from "react-icons/bs";

describe('PageHead', () => {
    it.concurrent('renders PageHead correctly with error and search', async () => {
        const search = vi.fn();
        const debounceInterval = 500;
        // Use fake timers to control debounce timing
        vi.useFakeTimers();

        const container = render(
            <PageHead title={'PageHead Test Title'} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: vi.fn()
                }
            ]} error={'PageHead Test Error'} onSearch={search} debounceInterval={1} />
        )

        expect(container.getByRole('heading', { name: 'PageHead Test Title' })).toBeDefined();
        expect(container.queryByRole('alert')).toBeDefined();
        expect(container.queryByRole('textbox')).toBeDefined();
        expect(container.getByText('PageHead Test Error')).toBeDefined();
        expect(container.getByText('PageHead Test Title')).toBeDefined();

        const searchBar = container.getAllByRole('search');

        const button = searchBar[1] as HTMLButtonElement;
        fireEvent.click(button);
        expect(search.mock.calls.length).toEqual(1);
        search.mockReset();

        const input = searchBar[0] as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'T' } });
        fireEvent.keyDown(input, { key: 'T', target: input });

        vi.advanceTimersByTime(debounceInterval);

        expect(search).toHaveBeenCalledWith('T'); // Debounced call
        search.mockReset();

        fireEvent.change(input, { target: { value: 'Test' } });
        fireEvent.keyDown(input, { key: 'Enter', target: input });

        expect(search).toHaveBeenCalledWith('Test');
        expect(input.value).toEqual('Test');

        search.mockReset();
        fireEvent.keyDown(input, { key: 'NoCall', target: false });
        expect(search.mock.calls.length).toEqual(0);

        container.unmount();
    })

    it.concurrent('renders PageHead correctly without error and with search', () => {
        const container = render(
            <PageHead title={'PageHead Test Title'} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: vi.fn()
                }
            ]} error={undefined} onSearch={vi.fn()} debounceInterval={false}/>
        )

        expect(container.getByRole('heading', { name: 'PageHead Test Title' })).toBeDefined();
        expect(container.queryByRole('alert')).toBeNull();
        expect(container.queryByRole('textbox')).toBeDefined();
        expect(container.queryByText('PageHead Test Error')).toBeNull();
        expect(container.getByText('PageHead Test Title')).toBeDefined();
        container.unmount();
    })

    it.concurrent('renders PageHead correctly without error and search', () => {
        const container = render(
            <PageHead title={'PageHead Test Title'} buttons={[
                {
                    value: <BsFillPlusCircleFill/>,
                    onClick: vi.fn(),
                    primary: true
                }
            ]} />
        )

        expect(container.getByRole('heading', { name: 'PageHead Test Title' })).toBeDefined();
        expect(container.queryByRole('alert')).toBeNull();
        expect(container.queryByRole('textbox')).toBeNull();
        expect(container.queryByText('PageHead Test Error')).toBeNull();
        expect(container.getByText('PageHead Test Title')).toBeDefined();

        const searchBar = container.queryAllByRole('search');
        expect(searchBar.length).toEqual(0);

        container.unmount();
    })
})
