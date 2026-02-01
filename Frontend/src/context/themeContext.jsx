import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const ThemeContext = createContext();
const THEME_KEY = 'sharefy-theme';

// Allowed values: 'light' | 'dark' | 'system'
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  });

  const applyTheme = useCallback((currentTheme) => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const actual = currentTheme === 'system' ? (prefersDark ? 'dark' : 'light') : currentTheme;
    document.documentElement.dataset.theme = actual;
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, applyTheme]);

  // Listen for system changes only when in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      const applied = document.documentElement.dataset.theme;
      return applied === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
