import { useState, useEffect } from 'react';

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('gramsahay-theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gramsahay-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gramsahay-theme', 'light');
    }
  }, [dark]);

  return { dark, toggleTheme: () => setDark(d => !d) };
}
