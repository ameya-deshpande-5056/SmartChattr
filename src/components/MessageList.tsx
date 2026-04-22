import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { StarterPrompts } from './StarterPrompts';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  onStarterPrompt?: (prompt: string) => void;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date);
  messageDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() === d2.getTime();
}

export function MessageList({ messages, onStarterPrompt }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        {onStarterPrompt ? (
          <StarterPrompts onSelect={onStarterPrompt} />
        ) : (
          <div className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-5 max-w-full w-full">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const extraTopSpacing = previousMessage?.role === 'assistant' && message.role === 'user';
        const showDateLabel = !previousMessage || !message.timestamp || !previousMessage.timestamp || !isSameDay(message.timestamp, previousMessage.timestamp);

        return (
          <div key={message.id}>
            {showDateLabel && message.timestamp && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                  {formatDateLabel(message.timestamp)}
                </span>
              </div>
            )}
            <MessageBubble
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              aiProvider={message.aiProvider}
              aiModel={message.aiModel}
              extraTopSpacing={extraTopSpacing}
            />
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

