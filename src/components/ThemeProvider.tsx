'use client';

import { useEffect } from 'react';
import { getTheme, getThemeMode } from '@/utils';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const updateTheme = () => {
      if (getThemeMode() === 'auto') {
        const theme = getTheme();
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    };

    updateTheme(); // Initial

    // Update every hour if auto
    const interval = setInterval(() => {
      if (getThemeMode() === 'auto') {
        updateTheme();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}