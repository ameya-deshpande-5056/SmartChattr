export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-4 overflow-x-hidden">
      <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
      <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
      <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
    </div>
  );
}

