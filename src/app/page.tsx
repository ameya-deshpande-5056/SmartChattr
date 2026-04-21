'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { BrandMark } from '@/components/BrandMark';
import { LandingFooter } from '@/components/LandingFooter';

const features = [
  'Persistent local chat history',
  'Full-text search across all chats',
  'Markdown with math/LaTeX support',
  'PDF export and full backup support',
];

export default function LandingPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveTheme = theme === 'auto' ? systemTheme : theme;

  return (
    <main className={`min-h-screen ${effectiveTheme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className={`flex items-center justify-between border-b border-gray-200 pb-5 ${effectiveTheme === 'dark' ? 'border-gray-700' : ''}`}>
          <div className="flex items-center gap-3">
            <BrandMark className="h-9 w-9 shrink-0" />
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                SmartChattr
              </p>
              <p className={`mt-1 text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Simple AI chat, kept on your device.
              </p>
            </div>
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            Open Chat
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:py-16">
          <div className="max-w-2xl">
            <p className={`text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              A calmer interface for everyday questions, notes, drafts, and back-and-forth thinking.
            </p>

            <h1 className="mt-4 max-w-3xl font-['Georgia','Times_New_Roman',serif] text-5xl leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl">
              Chat with AI without the clutter.
            </h1>

            <p className={`mt-6 max-w-xl text-base leading-8 ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} sm:text-lg`}>
              SmartChattr keeps the experience focused: write, ask, save, return later. Your chats stay local, the interface stays clean, and the app stays out of the way.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-600"
              >
                Start chatting
              </Link>
              <div className={`inline-flex items-center rounded-full border border-gray-300 bg-white px-5 py-3 text-sm ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-300' : 'text-gray-600'}`}>
                Local-first, exportable, and easy to keep around.
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature}
                  className={`rounded-2xl border bg-white px-4 py-4 text-sm leading-6 ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-200 text-gray-700'}`}
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className={`overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-800 shadow-none' : 'border-gray-200'}`}>
              <div className={`flex min-h-[590px] ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`hidden w-44 flex-col border-r sm:flex ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                  <div className={`border-b p-4 ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className={`text-sm font-semibold ${effectiveTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Chats</h2>
                        <p className={`mt-1 text-[11px] ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tap a chat to open.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  {isSettingsOpen && (
                    <div className={`p-4 border-b space-y-3 ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                      <div className="space-y-2">
                        <label className={`text-xs font-semibold uppercase tracking-[0.2em] ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Theme</label>
                        <div className="flex gap-2 justify-between">
                          <button
                            onClick={() => setTheme('auto')}
                            className={cn(
                              "flex-1 inline-flex h-10 items-center justify-center rounded-lg transition-colors",
                              theme === 'auto'
                                ? "bg-blue-500 text-white"
                                : effectiveTheme === 'dark'
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            )}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                          </button>
                          <button
                            onClick={() => setTheme('light')}
                            className={cn(
                              "flex-1 inline-flex h-10 items-center justify-center rounded-lg transition-colors",
                              theme === 'light'
                                ? "bg-blue-500 text-white"
                                : effectiveTheme === 'dark'
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            )}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="5"></circle>
                              <line x1="12" y1="1" x2="12" y2="3"></line>
                              <line x1="12" y1="21" x2="12" y2="23"></line>
                              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                              <line x1="1" y1="12" x2="3" y2="12"></line>
                              <line x1="21" y1="12" x2="23" y2="12"></line>
                              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                          </button>
                          <button
                            onClick={() => setTheme('dark')}
                            className={cn(
                              "flex-1 inline-flex h-10 items-center justify-center rounded-lg transition-colors",
                              theme === 'dark'
                                ? "bg-blue-500 text-white"
                                : effectiveTheme === 'dark'
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            )}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={`p-4 border-b ${effectiveTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <div className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-700 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                        Search chats
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 p-2">
                    <div className={`rounded-lg border-2 p-3 ${effectiveTheme === 'dark' ? 'border-blue-700 bg-blue-900 text-blue-100' : 'border-blue-200 bg-blue-50 text-blue-900'}`}>
                      <p className="text-sm font-medium">Meeting Summary</p>
                      <p className={`mt-1 truncate text-xs ${effectiveTheme === 'dark' ? 'text-blue-200' : 'text-blue-700'}`}>Turn rough notes into a clean recap...</p>
                    </div>
                    <div className={`rounded-lg p-3 ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p className="text-sm font-medium">Trip Planning</p>
                      <p className={`mt-1 truncate text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Build a Kyoto itinerary...</p>
                    </div>
                    <div className={`rounded-lg p-3 ${effectiveTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p className="text-sm font-medium">Code Notes</p>
                      <p className={`mt-1 truncate text-xs ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Explain this function and suggest...</p>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className={`flex items-center justify-between border-b p-4 ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <BrandMark className="h-8 w-8 shrink-0" />
                      <p className={`text-lg font-bold ${effectiveTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>SmartChattr</p>
                    </div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                      +
                    </div>
                  </div>

                  <div className={`flex-1 space-y-5 overflow-hidden p-4 ${effectiveTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="flex justify-end">
                      <div className="max-w-[78%] rounded-3xl rounded-br-sm bg-blue-500 px-4 py-3 text-sm leading-7 text-white">
                        Help me turn rough meeting notes into a clean summary with action items.
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className={`w-full self-start rounded-3xl rounded-bl-sm px-4 py-3 text-sm leading-7 min-[1168px]:w-[80%] ${effectiveTheme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-gray-200 text-gray-900'}`}>
                        Absolutely. I can shape them into a short summary, a decisions section, and a crisp action-items list that feels ready to send.
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-1 text-sm ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className={`h-2 w-2 rounded-full ${effectiveTheme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} />
                      <span className={`h-2 w-2 rounded-full ${effectiveTheme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} />
                      <span className={`h-2 w-2 rounded-full ${effectiveTheme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} />
                      <span className="ml-1">Thinking...</span>
                    </div>
                  </div>

                  <div className={`border-t p-4 ${effectiveTheme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <div className="flex gap-2">
                      <div className={`flex-1 rounded-full border px-4 py-3 text-sm ${effectiveTheme === 'dark' ? 'border-gray-600 bg-gray-700 text-gray-400' : 'border-gray-300 bg-white text-gray-500'}`}>
                        Type your message...
                      </div>
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                        ↗
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </main>
  );
}
