import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface InputBarProps {
  onSend: (text: string) => void;
  loading: boolean;
  draftText?: string;
  draftVersion?: number;
}

export function InputBar({ onSend, loading, draftText, draftVersion }: InputBarProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '48px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 160 ? 'auto' : 'hidden';
  };

  useEffect(() => {
    if (draftVersion === undefined || draftText === undefined) return;
    setInput(draftText);
  }, [draftText, draftVersion]);

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  const handleSubmit = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex w-full items-end gap-3 min-[1168px]:w-[80%]">
        <textarea
          ref={textareaRef}
          className="h-12 max-h-40 flex-1 resize-none overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 px-4 py-[11px] text-gray-900 placeholder:text-xs placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 min-[1168px]:placeholder:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          placeholder="Type your message... Press Enter to send, Shift+Enter for a new line."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
          className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          {loading ? '...' : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

