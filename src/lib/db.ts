import Dexie, { Table } from 'dexie';
import { generateId } from '../utils';
import type { Message, ChatPreview } from '../types/chat';

type StoredChat = {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
};

type DatabaseBackup = {
  version: 1;
  exportedAt: string;
  chats: StoredChat[];
  messages: Message[];
};

export class ChatDb extends Dexie {
  chats!: Table<StoredChat>;
  messages!: Table<Message>;

  constructor() {
    super('chat-db');
    this.version(2).stores({
      chats: '&id, title, preview, createdAt, updatedAt',
      messages: '++id, chatId, role, content, timestamp'
    });
    this.version(3).upgrade(async (trans) => {
      // Migrate old messages without chatId to the first chat (oldest by createdAt)
      const firstChat = await trans.table('chats').orderBy('createdAt').first();
      if (firstChat) {
        await trans.table('messages').where('chatId').equals('').modify({ chatId: firstChat.id });
      }
    });
  }
}

export const db = new ChatDb();

function normalizeMessage(message: Partial<Message> & { role: Message['role']; content: string; chatId: string }): Message {
  return {
    id: typeof message.id === 'string' && message.id.trim() ? message.id : generateId(),
    role: message.role,
    content: message.content,
    chatId: message.chatId,
    timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
  };
}

// Legacy compatibility
export async function saveMessages(messages: Message[]): Promise<void> {
  await db.transaction('rw', db.messages, async () => {
    await db.messages.clear();
    if (messages.length > 0) {
      await db.messages.bulkPut(messages.map((message) => normalizeMessage(message)));
    }
  });
}

export async function loadMessages(): Promise<Message[]> {
  const messages = await db.messages.toArray();
  return messages.map((message) => normalizeMessage(message));
}

// New multi-chat functions
export async function createChat(): Promise<string> {
  const chat = {
    id: generateId(),
    title: 'New Chat',
    preview: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await db.chats.put(chat);
  return chat.id;
}

export async function loadChats(): Promise<ChatPreview[]> {
  const rawChats = await db.chats.toArray();
  return rawChats.map(c => ({...c, id: c.id.toString()} as ChatPreview));
}

export async function loadMessagesByChat(chatId: string): Promise<Message[]> {
  const messages = await db.messages.where('chatId').equals(chatId).toArray();
  return messages.map((message) => normalizeMessage(message));
}

export async function saveChatMessages(chatId: string, messages: Message[]): Promise<void> {
  await db.transaction('rw', [db.chats, db.messages], async () => {
    // Clear old messages
    await db.messages.where('chatId').equals(chatId).delete();
    
    // Save new messages
    if (messages.length > 0) {
      await db.messages.bulkPut(messages.map((msg) => normalizeMessage({
        ...msg,
        chatId,
      })));
    }
    
    // Update chat preview + timestamp
    const preview = messages.slice(-2).map(m => m.content.slice(0, 50)).join('... ') || '';
    await db.chats.update(chatId, {
      preview,
      updatedAt: new Date()
    });
  });
}

export async function deleteChat(chatId: string): Promise<void> {
  await db.transaction('rw', [db.chats, db.messages], async () => {
    await db.chats.delete(chatId);
    await db.messages.where('chatId').equals(chatId).delete();
  });
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  await db.chats.update(chatId, { title, updatedAt: new Date() });
}

export async function exportDatabaseBackup(): Promise<DatabaseBackup> {
  const [chats, messages] = await Promise.all([
    db.chats.toArray(),
    db.messages.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    chats: chats.map((chat) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
    })),
    messages: messages.map((message) => normalizeMessage(message)),
  };
}

export async function importDatabaseBackup(backup: unknown): Promise<void> {
  if (!backup || typeof backup !== 'object') {
    throw new Error('Invalid backup file.');
  }

  const data = backup as Partial<DatabaseBackup>;
  const chats = Array.isArray(data.chats) ? data.chats : null;
  const messages = Array.isArray(data.messages) ? data.messages : null;

  if (!chats || !messages) {
    throw new Error('Backup file is missing chats or messages.');
  }

  const normalizedChats: StoredChat[] = chats.map((chat) => {
    const candidate = chat as Partial<StoredChat>;
    if (!candidate.id || typeof candidate.id !== 'string') {
      throw new Error('Backup contains a chat without a valid id.');
    }

    return {
      id: candidate.id,
      title: typeof candidate.title === 'string' ? candidate.title : 'New Chat',
      preview: typeof candidate.preview === 'string' ? candidate.preview : '',
      createdAt: candidate.createdAt ? new Date(candidate.createdAt) : new Date(),
      updatedAt: candidate.updatedAt ? new Date(candidate.updatedAt) : new Date(),
    };
  });

  const validChatIds = new Set(normalizedChats.map((chat) => chat.id));
  const normalizedMessages = messages
    .map((message) => {
      const candidate = message as Partial<Message>;
      if (!candidate.chatId || !validChatIds.has(candidate.chatId)) {
        return null;
      }

      if (candidate.role !== 'user' && candidate.role !== 'assistant') {
        return null;
      }

      if (typeof candidate.content !== 'string') {
        return null;
      }

      return normalizeMessage({
        id: candidate.id,
        role: candidate.role,
        content: candidate.content,
        chatId: candidate.chatId,
        timestamp: candidate.timestamp,
      });
    })
    .filter((message): message is Message => Boolean(message));

  await db.transaction('rw', [db.chats, db.messages], async () => {
    await db.messages.clear();
    await db.chats.clear();

    if (normalizedChats.length > 0) {
      await db.chats.bulkPut(normalizedChats);
    }

    if (normalizedMessages.length > 0) {
      await db.messages.bulkPut(normalizedMessages);
    }
  });
}

