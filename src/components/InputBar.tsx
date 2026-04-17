import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/utils';

interface InputBarProps {
  onSend: (text: string) => void;
  loading: boolean;
}

export function InputBar({ onSend, loading }: InputBarProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex gap-2 w-full">
        <input
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
          className="inline-flex h-12 w-12 items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          {loading ? '...' : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

