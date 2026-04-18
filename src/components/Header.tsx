import { Menu, Plus } from 'lucide-react';

interface HeaderProps {
  onNewChat: () => void;
  onMenuClick?: () => void;
}

export function Header({ onNewChat, onMenuClick }: HeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="min-[1168px]:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SmartChattr</h1>
      </div>
        <button
        onClick={onNewChat}
        aria-label="New chat"
        title="New chat"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

