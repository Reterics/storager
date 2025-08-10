import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ThemeContextProviderMock from '../../tests/mocks/ThemeContextProviderMock.tsx';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer.tsx';
import { DBContext } from '../database/DBContext.ts';
import type { DBContextType } from '../interfaces/firebase.ts';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams('page=service')],
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

describe('Footer', () => {
  it('should render and handle interactions and conditions', async () => {
    const { i18n } = useTranslation();

    const settingsMock = {
      companyName: 'TestCorp',
      email: 'info@testcorp.com',
    };

    const renderFooter = () =>
      render(
        <ThemeContextProviderMock>
          <DBContext.Provider
            value={
              { data: { settings: settingsMock } } as unknown as DBContextType
            }
          >
            <Footer />
          </DBContext.Provider>
        </ThemeContextProviderMock>,
      );

    const { rerender } = renderFooter();

    const languageToggle = screen.getByText(
      (c) => c.includes('Hungarian language') || c.includes('English language'),
    );
    fireEvent.click(languageToggle);
    fireEvent.click(languageToggle);
    await waitFor(() =>
      expect((i18n.changeLanguage as Mock).mock.calls.length).toBe(2),
    );

    const themeToggle = screen.getByText(
      (c) => c.includes('Dark Mode') || c.includes('Light Mode'),
    );
    fireEvent.click(themeToggle);
    fireEvent.click(themeToggle);
    await waitFor(() =>
      expect(
        screen.getByText(
          (c) => c.includes('Dark Mode') || c.includes('Light Mode'),
        ),
      ).toBeInTheDocument(),
    );

    await i18n.changeLanguage('hu');
    rerender(
      <ThemeContextProviderMock>
        <DBContext.Provider
          value={
            { data: { settings: settingsMock } } as unknown as DBContextType
          }
        >
          <Footer />
        </DBContext.Provider>
      </ThemeContextProviderMock>,
    );
    await waitFor(() =>
      expect(
        screen.getByText((c) => c.includes('English language')),
      ).toBeInTheDocument(),
    );

    await i18n.changeLanguage('en');
    rerender(
      <ThemeContextProviderMock>
        <DBContext.Provider
          value={
            { data: { settings: settingsMock } } as unknown as DBContextType
          }
        >
          <Footer />
        </DBContext.Provider>
      </ThemeContextProviderMock>,
    );
    await waitFor(() =>
      expect(
        screen.getByText((c) => c.includes('Hungarian language')),
      ).toBeInTheDocument(),
    );

    expect(
      screen.getByText((c) => c.includes('Diagnostic')),
    ).toBeInTheDocument();

    const companyLink = screen.getByText('TestCorp');
    expect(companyLink.closest('a')?.href).toBe('mailto:info@testcorp.com');

    expect(
      screen.getByText((text) =>
        text.replace(/\s+/g, '').includes('StorageRv'),
      ),
    ).toBeInTheDocument();

    rerender(
      <ThemeContextProviderMock>
        <DBContext.Provider
          value={{ data: { settings: undefined } } as unknown as DBContextType}
        >
          <Footer />
        </DBContext.Provider>
      </ThemeContextProviderMock>,
    );

    const fallbackLink = screen.getByRole('link', { name: '' });
    expect(fallbackLink).toBeInTheDocument();
    expect(fallbackLink).toHaveAttribute('href', 'mailto:');
  });
});
