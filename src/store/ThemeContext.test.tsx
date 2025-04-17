import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {ThemeProvider, useTheme} from './ThemeContext';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const TestComponent = () => {
  const {theme, toggleTheme} = useTheme() as {
    theme: string;
    toggleTheme: () => void;
  };
  return (
    <div>
      <p data-testid='theme'>{theme}</p>
      <button data-testid='toggle-button' onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = ''; // Reset document classes
  });

  it('renders with light theme by default if no theme is saved and system preference is light', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } as unknown as MediaQueryList);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('renders with dark theme by default if no theme is saved and system preference is dark', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } as unknown as MediaQueryList);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies saved theme from localStorage if available', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme and updates localStorage', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } as unknown as MediaQueryList);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByTestId('toggle-button');

    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByTestId('theme').textContent).toBe('dark')
    );
    await waitFor(() => expect(localStorage.getItem('theme')).toBe('dark'));
    await waitFor(() =>
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    );

    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByTestId('theme').textContent).toBe('light')
    );
    await waitFor(() => expect(localStorage.getItem('theme')).toBe('light'));
    await waitFor(() =>
      expect(document.documentElement.classList.contains('light')).toBe(true)
    );
  });
});
