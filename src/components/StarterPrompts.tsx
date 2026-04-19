'use client';

import { STARTER_PROMPTS } from '@/lib/starterPrompts';

interface StarterPromptsProps {
  onSelect: (prompt: string) => void;
}

export function StarterPrompts({ onSelect }: StarterPromptsProps) {
  return (
    <div className="w-full max-w-3xl">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Try one of these</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start with a prompt, add your details on the next line, then send.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {STARTER_PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item.prompt)}
              className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:bg-gray-700/60"
            >
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.label}</div>
              <div className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {item.prompt.trim()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
