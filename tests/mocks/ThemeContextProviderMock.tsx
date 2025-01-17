import {ThemeContext} from '../../src/store/ThemeContext';
import { vi } from 'vitest'

const toggleTheme = vi.fn();
const ThemeContextProviderMock = ({children}:{children: React.ReactNode}) => {
    return (
        <ThemeContext.Provider value={
            {
                theme: toggleTheme.mock.calls.length % 1 ? 'dark' : 'light',
                toggleTheme: toggleTheme
            }
        }>{children}</ThemeContext.Provider>
    )
}


export default ThemeContextProviderMock;
