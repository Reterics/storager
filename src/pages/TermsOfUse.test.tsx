import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Provide a local mock for react-i18next tailored for this test BEFORE importing the component
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key.endsWith('.items')) {
        return ['a', 'b']; // return an array for list renderers
      }
      return key; // return the key for headings/text
    },
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

import TermsOfUse from './TermsOfUse';

describe('TermsOfUse Page', () => {
  it('renders System Requirements section with expected keys', () => {
    render(<TermsOfUse />);

    // Section title
    expect(screen.getByText('system.title')).toBeInTheDocument();

    // Subsection titles
    expect(screen.getByText('system.browser.title')).toBeInTheDocument();
    expect(screen.getByText('system.tablet.title')).toBeInTheDocument();
    expect(screen.getByText('system.device.title')).toBeInTheDocument();
  });
});
