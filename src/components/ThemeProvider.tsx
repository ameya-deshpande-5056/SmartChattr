'use client';

import { useEffect } from 'react';
import { getMillisecondsUntilNextThemeChange, getTheme, getThemeMode } from '@/utils';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let timeoutId: number | null = null;

    const updateTheme = () => {
      const theme = getTheme();
      document.documentElement.classList.toggle('dark', theme === 'dark');
    };

    const scheduleNextUpdate = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      if (getThemeMode() !== 'auto') {
        timeoutId = null;
        return;
      }

      timeoutId = window.setTimeout(() => {
        updateTheme();
        scheduleNextUpdate();
      }, getMillisecondsUntilNextThemeChange());
    };

    const syncTheme = () => {
      updateTheme();
      scheduleNextUpdate();
    };

    const handleVisibilityOrFocus = () => {
      syncTheme();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'theme') {
        syncTheme();
      }
    };

    syncTheme();

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return <>{children}</>;
}
