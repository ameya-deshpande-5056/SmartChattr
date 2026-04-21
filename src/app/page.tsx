import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { LandingFooter } from '@/components/LandingFooter';

const features = [
  'Persistent local chat history',
  'Markdown with math/LaTeX support',
  'PDF export and full backup support',
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-gray-200 pb-5 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BrandMark className="h-9 w-9 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                SmartChattr
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A calmer interface for everyday questions, notes, drafts, and back-and-forth thinking.
            </p>

            <h1 className="mt-4 max-w-3xl font-['Georgia','Times_New_Roman',serif] text-5xl leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl">
              Chat with AI without the clutter.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
              SmartChattr keeps the experience focused: write, ask, save, return later. Your chats stay local, the interface stays clean, and the app stays out of the way.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-600"
              >
                Start chatting
              </Link>
              <div className="inline-flex items-center rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Local-first, exportable, and easy to keep around.
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm leading-6 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
              <div className="flex min-h-[540px] bg-gray-50 dark:bg-gray-900">
                <div className="hidden w-44 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 sm:flex">
                  <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Chats</h2>
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Tap a chat to open.</p>
                  </div>
                  <div className="space-y-2 p-2">
                    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3 text-blue-900 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100">
                      <p className="text-sm font-medium">Meeting Summary</p>
                      <p className="mt-1 truncate text-xs text-blue-700 dark:text-blue-200">Turn rough notes into a clean recap...</p>
                    </div>
                    <div className="rounded-lg p-3 text-gray-700 dark:text-gray-300">
                      <p className="text-sm font-medium">Trip Planning</p>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">Build a Kyoto itinerary...</p>
                    </div>
                    <div className="rounded-lg p-3 text-gray-700 dark:text-gray-300">
                      <p className="text-sm font-medium">Code Notes</p>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">Explain this function and suggest...</p>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <BrandMark className="h-8 w-8 shrink-0" />
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">SmartChattr</p>
                    </div>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                      +
                    </div>
                  </div>

                  <div className="flex-1 space-y-5 overflow-hidden bg-gray-50 p-4 dark:bg-gray-900">
                    <div className="flex justify-end">
                      <div className="max-w-[78%] rounded-3xl rounded-br-sm bg-blue-500 px-4 py-3 text-sm leading-7 text-white">
                        Help me turn rough meeting notes into a clean summary with action items.
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="w-full self-start rounded-3xl rounded-bl-sm bg-gray-200 px-4 py-3 text-sm leading-7 text-gray-900 dark:bg-gray-800 dark:text-gray-100 min-[1168px]:w-[80%]">
                        Absolutely. I can shape them into a short summary, a decisions section, and a crisp action-items list that feels ready to send.
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                      <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                      <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                      <span className="ml-1">Thinking...</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
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
