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

    vi.mock('react-signature-pad-wrapper', () => {
        const { forwardRef, useImperativeHandle } = require('react');
        const SignaturePad = forwardRef((_props, ref) => {
            useImperativeHandle(ref, () => ({
                isEmpty: () => true,
                clear: () => {},
                toDataURL: () => '',
                fromDataURL: () => {},
            }));
            return require('react').createElement('canvas', { 'data-testid': 'signature-pad' });
        });
        SignaturePad.displayName = 'SignaturePad';
        return { default: SignaturePad };
    });
});
