import { getAiPersonalization } from '@/utils';
import type { GeminiModel, GroqModel, OpenRouterModel } from '@/lib/openRouterModels';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export type ChatProviderSelection = 'auto' | 'google' | 'groq' | 'openrouter';

export interface ChatRequestOptions {
  provider?: ChatProviderSelection;
  internetAccess?: boolean;
  geminiModel?: GeminiModel;
  groqModel?: GroqModel;
  openRouterModel?: OpenRouterModel;
}

export interface LLMReply {
  reply: string;
  provider?: string;
  model?: string;
}

type LLMErrorResponse = {
  reply?: string;
};

export async function callLLM(prompt: string, history: ChatTurn[] = [], options: ChatRequestOptions = {}): Promise<LLMReply> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: prompt,
      history,
      provider: options.provider ?? 'auto',
      internetAccess: Boolean(options.internetAccess),
      geminiModel: options.geminiModel,
      groqModel: options.groqModel,
      openRouterModel: options.openRouterModel,
      personalization: getAiPersonalization(),
    }),
  });

  if (!response.ok) {
    let message = `LLM API error: ${response.status}`;

    try {
      const data = await response.json() as LLMErrorResponse;
      if (data.reply) {
        message = data.reply;
      }
    } catch {
      // Keep the status-based fallback if the server did not return JSON.
    }

    throw new Error(message);
  }

  const data = await response.json() as LLMReply;
  return {
    reply: data.reply || '',
    provider: data.provider,
    model: data.model,
  };
}

export async function generateChatTitle(prompt: string): Promise<string> {
  const response = await fetch('/api/chat/title', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Chat title API error: ${response.status}`);
  }

  const data = await response.json();
  return data.title || 'New Chat';
}

