import {ThemeContext} from '../../src/store/ThemeContext';
import { vi } from 'vitest'


const ThemeContextProviderMock = ({children}:{children: React.ReactNode}) => {
    return (
        <ThemeContext.Provider value={
            {
                theme: 'light',
                toggleTheme: vi.fn()
            }
        }>{children}</ThemeContext.Provider>
    )
}


export default ThemeContextProviderMock;
