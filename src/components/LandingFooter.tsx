'use client';

import { useEffect, useState } from 'react';

const VISIT_KEY = 'smartchattr-landing-visits';

export function LandingFooter() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    try {
      const nextVisits = String(Number(localStorage.getItem(VISIT_KEY) ?? '0') + 1);
      localStorage.setItem(VISIT_KEY, nextVisits);
      setVisits(Number(nextVisits));
    } catch {
      setVisits(null);
    }
  }, []);

  return (
    <footer className="border-t border-gray-200 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} SmartChattr. All rights reserved.</p>
        <p>{visits === null ? 'Visitor stats unavailable.' : `Visitor count on this browser: ${visits}`}</p>
      </div>
    </footer>
  );
}
