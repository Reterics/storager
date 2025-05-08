import { afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

let currentLanguage = 'en';

const changeLanguageMock = vi.fn((lang) => {
    currentLanguage = lang;
    return Promise.resolve(); // mimic async behavior
});

afterEach(() => {
    cleanup();
    currentLanguage = 'en'; // reset language after each test
    changeLanguageMock.mockClear();
});

beforeAll(() => {
    vi.mock('react-i18next', () => ({
        useTranslation: () => {
            return {
                t: (key) => key,
                i18n: {
                    language: currentLanguage,
                    changeLanguage: changeLanguageMock,
                },
            };
        },
    }));
});
