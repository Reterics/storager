import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files
import translationEN from './locales/en/translation.json';
import translationHU from './locales/hu/translation.json';  // Example for Hungarian

// Define resources
const resources = {
    en: { translation: translationEN },
    hu: { translation: translationHU },
};

i18n
    .use(LanguageDetector) // Detects user language
    .use(initReactI18next)  // Passes i18n instance to react-i18next
    .init({
        resources,
        fallbackLng: 'hu', // Fallback language if detection fails
        interpolation: {
            escapeValue: false, // React already protects from XSS
        },
        debug: false, // Enable debug mode
    });

export default i18n;
