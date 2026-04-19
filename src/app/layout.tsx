import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'SmartChattr',
  description: 'Simple AI chat app',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function() {
            try {
              var stored = localStorage.getItem('theme');
              var theme = stored === 'light' || stored === 'dark'
                ? stored
                : ((new Date().getHours() >= 6 && new Date().getHours() < 18) ? 'light' : 'dark');
              document.documentElement.classList.toggle('dark', theme === 'dark');
            } catch (error) {}
          })();
        `}</Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
