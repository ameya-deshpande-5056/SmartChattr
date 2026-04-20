export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  chatId: string;
  timestamp?: Date;
  aiProvider?: string;
  aiModel?: string;
}

export interface Chat {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface ChatPreview {
  id: string;
  title: string;
  preview: string;
  updatedAt: Date;
}

