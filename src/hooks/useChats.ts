import { useState, useEffect } from 'react';
import type { ChatPreview } from '@/types/chat';
import { createChat, loadChats, loadMessagesByChat, saveChatMessages, deleteChat, updateChatTitle } from '@/lib/db';
import { useChat } from './useChat';
import { generateChatTitle } from '@/lib/llm';

export function useChats(selectedChatId?: string | null) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(selectedChatId ?? null);
  const [chatTitle, setChatTitle] = useState('New Chat');
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [loadedChatId, setLoadedChatId] = useState<string | null>(null);

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
    if (!currentChatId) {
      setChatTitle('New Chat');
      return;
    }

    const currentChat = chats.find((chat) => chat.id === currentChatId);
    setChatTitle(currentChat?.title || 'New Chat');
  }, [chats, currentChatId]);

  useEffect(() => {
    if (selectedChatId !== undefined) {
      setCurrentChatId(selectedChatId);
    }
  }, [selectedChatId]);

  useEffect(() => {
    setMessages([]);
    setMessagesLoaded(false);
    setLoadedChatId(null);

    if (currentChatId !== null) {
      loadMessagesByChat(currentChatId).then((loaded) => {
        setMessages(loaded);
        setLoadedChatId(currentChatId);
        setMessagesLoaded(true);
      });
    } else {
      setMessages([]);
      setLoadedChatId(null);
      setMessagesLoaded(true);
    }
  }, [currentChatId, setMessages]);

  useEffect(() => {
    if (currentChatId !== null && messagesLoaded && loadedChatId === currentChatId) {
      saveChatMessages(currentChatId, messages);
    }
  }, [messages, currentChatId, messagesLoaded, loadedChatId]);

  // Generate title from first user message
  useEffect(() => {
    if (currentChatId && messages.length === 1 && chatTitle === 'New Chat') {
      const firstMessage = messages[0];
      if (firstMessage.role === 'user') {
        const fallbackTitle = generateTitleFromMessage(firstMessage.content);
        updateTitle(fallbackTitle);

        generateChatTitle(firstMessage.content)
          .then((generatedTitle) => {
            const safeTitle = generatedTitle.trim() || fallbackTitle;
            if (safeTitle && currentChatId) {
              updateTitle(safeTitle);
            }
          })
          .catch(() => {
            // Keep the local fallback title if the summarizer fails.
          });
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

  const deleteChatById = async (chatId: string): Promise<void> => {
    const remainingChats = chats.filter((chat) => chat.id !== chatId);
    await deleteChat(chatId);
    setChats(remainingChats);
    if (currentChatId === chatId) {
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
      } else {
        const newChatId = await createNewChat();
        setCurrentChatId(newChatId);
      }
    }
  };

  return {
    chats,
    currentChatId,
    chatTitle,
    updateTitle,
    messages,
    messagesReady: messagesLoaded && (currentChatId === null || loadedChatId === currentChatId),
    sendMessage: chatSendMessage,
    loading,
    error,
    createNewChat,
    deleteChatById,
  };
}

