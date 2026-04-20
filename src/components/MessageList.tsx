import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { StarterPrompts } from './StarterPrompts';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  onStarterPrompt?: (prompt: string) => void;
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
            aiProvider={message.aiProvider}
            aiModel={message.aiModel}
            extraTopSpacing={extraTopSpacing}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

