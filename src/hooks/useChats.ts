import { useState, useEffect } from 'react';
import type { ChatPreview, Message } from '@/types/chat';
import { createChat, loadChats, loadMessagesByChat, saveChatMessages, deleteChat, updateChatTitle } from '@/lib/db';
import { useChat } from './useChat';

export function useChats(selectedChatId?: string | null) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(selectedChatId ?? null);
  const [chatTitle, setChatTitle] = useState('New Chat');
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const { messages, setMessages, sendMessage: chatSendMessage, loading, error } = useChat(currentChatId);

  const generateTitleFromMessage = (content: string): string => {
    let title = content.slice(0, 50).trim();
    if (title.length > 0) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    title = title.replace(/[.!?]+$/, '');
    return title || 'New Chat';
  };

  const updateTitle = async (title: string) => {
    if (currentChatId) {
      setChatTitle(title);
      await updateChatTitle(currentChatId, title);
      setChats(prev => prev.map(chat => chat.id === currentChatId ? {...chat, title} : chat));
    }
  };

  useEffect(() => {
    loadChats().then(setChats);
  }, []);

  useEffect(() => {
    if (selectedChatId !== undefined) {
      setCurrentChatId(selectedChatId);
    }
  }, [selectedChatId]);

  useEffect(() => {
    setMessages([]);
    setMessagesLoaded(false);

    if (currentChatId !== null) {
      loadMessagesByChat(currentChatId).then((loaded) => {
        setMessages(loaded);
        setMessagesLoaded(true);
      });
    } else {
      setMessages([]);
      setMessagesLoaded(true);
    }
  }, [currentChatId, setMessages]);

  useEffect(() => {
    if (currentChatId !== null && messagesLoaded) {
      saveChatMessages(currentChatId, messages);
    }
  }, [messages, currentChatId, messagesLoaded]);

  // Generate title from first user message
  useEffect(() => {
    if (currentChatId && messages.length === 1 && chatTitle === 'New Chat') {
      const firstMessage = messages[0];
      if (firstMessage.role === 'user') {
        const generatedTitle = generateTitleFromMessage(firstMessage.content);
        updateTitle(generatedTitle);
      }
    }
  }, [messages, currentChatId, chatTitle, updateTitle]);

  const createNewChat = async (): Promise<string> => {
    const newChatId = await createChat();
    const newChat: ChatPreview = {
      id: newChatId,
      title: 'New Chat',
      preview: '',
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setChatTitle('New Chat');
    return newChatId;
  };

  const deleteCurrentChat = async (): Promise<string | null> => {
    if (!currentChatId) return null;

    await deleteChat(currentChatId);
    setChats((prev) => prev.filter((chat) => chat.id !== currentChatId));

    const remainingChats = chats.filter((chat) => chat.id !== currentChatId);
    let nextChatId: string | null = null;

    if (remainingChats.length > 0) {
      nextChatId = remainingChats[0].id;
    } else {
      nextChatId = await createNewChat();
    }

    setCurrentChatId(nextChatId);
    return nextChatId;
  };

  return {
    chats,
    currentChatId,
    chatTitle,
    updateTitle,
    messages,
    sendMessage: chatSendMessage,
    loading,
    error,
    createNewChat,
    deleteCurrentChat,
  };
}

