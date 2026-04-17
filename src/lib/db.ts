import Dexie, { Table } from 'dexie';
import { generateId } from '../utils';
import type { Message, ChatPreview } from '../types/chat';

export class ChatDb extends Dexie {
  chats!: Table<{id: string, title: string, preview: string, createdAt: Date, updatedAt: Date}>;
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

// Legacy compatibility
export async function saveMessages(messages: Message[]): Promise<void> {
  await db.transaction('rw', db.messages, async () => {
    await db.messages.clear();
    if (messages.length > 0) {
      await db.messages.bulkAdd(messages);
    }
  });
}

export async function loadMessages(): Promise<Message[]> {
  return await db.messages.toArray();
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
  return await db.messages.where('chatId').equals(chatId).toArray();
}

export async function saveChatMessages(chatId: string, messages: Message[]): Promise<void> {
  await db.transaction('rw', [db.chats, db.messages], async () => {
    // Clear old messages
    await db.messages.where('chatId').equals(chatId).delete();
    
    // Save new messages
    if (messages.length > 0) {
      await db.messages.bulkAdd(messages.map(msg => ({...msg, chatId})));
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

