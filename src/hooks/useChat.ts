import { useState } from 'react';
import { generateId } from '@/utils';
import type { Message } from '@/types/chat';
import { callLLM } from '@/lib/llm';
import type { ChatTurn } from '@/lib/llm';
import type { MessageRole } from '@/types/chat';

const MAX_RECENT_MESSAGES = 6;
const MAX_SUMMARY_ITEMS = 4;
const MAX_MESSAGE_CHARS = 220;

function compactText(text: string, maxChars = MAX_MESSAGE_CHARS) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars - 3)}...`;
}

function buildHistory(messages: Message[]): ChatTurn[] {
  const recentMessages = messages
    .slice(-MAX_RECENT_MESSAGES)
    .map(({ role, content }) => ({ role, content: compactText(content) }));

  const olderUserNotes = messages
    .slice(0, -MAX_RECENT_MESSAGES)
    .filter((message) => message.role === 'user')
    .slice(-MAX_SUMMARY_ITEMS)
    .map((message, index) => `- Earlier user context ${index + 1}: ${compactText(message.content, 120)}`);

  if (olderUserNotes.length === 0) {
    return recentMessages;
  }

  return [
    {
      role: 'user',
      content: `Compressed earlier context:\n${olderUserNotes.join('\n')}`,
    },
    ...recentMessages,
  ];
}

export function useChat(chatId?: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !chatId) return;

    setError(null);
    const userId = generateId();
    const now = new Date();
    const userMessage: Message = { id: userId, role: 'user' as MessageRole, content: text, chatId, timestamp: now };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const result = await callLLM(text, buildHistory(messages));
      const assistantId = generateId();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant' as MessageRole,
        content: result.reply,
        chatId,
        timestamp: new Date(),
        aiProvider: result.provider,
        aiModel: result.model,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return { messages, setMessages, loading, error, sendMessage };
}

