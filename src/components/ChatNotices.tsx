export function ChatNotices() {
  return (
    <div className="hidden border-t border-gray-200/70 bg-white/70 px-4 py-2 text-[11px] text-gray-500 dark:border-gray-700/70 dark:bg-gray-800/70 dark:text-gray-400 min-[1168px]:block overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:justify-center">
        <div className="rounded-full border border-gray-200/80 bg-gray-50 px-3 py-1 dark:border-gray-700/80 dark:bg-gray-900/70">
          Your chats stay on this device unless you export them.
        </div>
        <div className="rounded-full border border-gray-200/80 bg-gray-50 px-3 py-1 dark:border-gray-700/80 dark:bg-gray-900/70">
          AI can make mistakes, so double-check important facts.
        </div>
      </div>
    </div>
  );
}
