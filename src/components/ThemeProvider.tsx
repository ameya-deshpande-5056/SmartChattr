'use client';

import { useEffect } from 'react';
import { getTheme, getThemeMode } from '@/utils';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const updateTheme = () => {
      const theme = getTheme();
      document.documentElement.classList.toggle('dark', theme === 'dark');
    };

    const syncTheme = () => {
      updateTheme();
    };

    const handleVisibilityOrFocus = () => {
      syncTheme();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'theme') {
        syncTheme();
      }
    };

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (getThemeMode() === 'auto') {
        updateTheme();
      }
    };

    syncTheme();

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('storage', handleStorage);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('storage', handleStorage);
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  return <>{children}</>;
}
