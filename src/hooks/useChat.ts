import { useState } from 'react';
import { generateId } from '@/utils';
import type { Message } from '@/types/chat';
import { callLLM } from '@/lib/llm';
import type { MessageRole } from '@/types/chat';

export function useChat(chatId?: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !chatId) return;

    setError(null);
    const userId = generateId();
    const userMessage: Message = { id: userId, role: 'user' as MessageRole, content: text, chatId };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const reply = await callLLM(text);
      const assistantId = generateId();
      const assistantMessage: Message = { id: assistantId, role: 'assistant' as MessageRole, content: reply, chatId };
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

