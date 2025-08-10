import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext<{
  theme: string;
  toggleTheme: () => void;
} | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Step 1: Get the saved theme from localStorage or fallback to system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  const [theme, setTheme] = useState(initialTheme);

  // Step 2: Toggle theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Step 3: Effect to update the documentElement based on theme
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Step 4: If the initial theme is not light, apply it to the documentElement immediately
  useEffect(() => {
    if (initialTheme !== 'light') {
      document.documentElement.classList.add(initialTheme);
    }
  }, [initialTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => React.useContext(ThemeContext);
