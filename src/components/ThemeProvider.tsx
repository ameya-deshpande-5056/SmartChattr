'use client';

import { useEffect } from 'react';
import { getTheme } from '@/utils';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const updateTheme = () => {
      const theme = getTheme();
      document.documentElement.classList.toggle('dark', theme === 'dark');
    };

    updateTheme(); // Initial

    // Update every hour
    const interval = setInterval(updateTheme, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}