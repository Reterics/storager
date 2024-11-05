import {afterEach, vi, beforeAll} from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

const changeLanguageMock = vi.fn();

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
})

beforeAll(async () => {
    vi.mock('react-i18next', () => ({
        useTranslation: ()=> {
            return {
                t: (s) => s,
                i18n: {
                    language: changeLanguageMock.mock.calls.length % 1 ? 'hu' : 'en',
                    changeLanguage: changeLanguageMock,
                }
            }
        }
    }));
})
