import {afterEach, vi, beforeAll} from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
})

beforeAll(async () => {
    vi.mock('react-i18next', () => ({
        useTranslation: ()=>({ t: (s) => s, i18n: {language: 'en', changeLanguage: vi.fn()} })
    }));
})
