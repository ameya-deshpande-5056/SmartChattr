import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto p-4 space-y-5">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const extraTopSpacing = previousMessage?.role === 'assistant' && message.role === 'user';

        return (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
            extraTopSpacing={extraTopSpacing}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

