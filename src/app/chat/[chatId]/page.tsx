'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { ChatSidebar } from '@/components/ChatSidebar';
import { MessageList } from '@/components/MessageList';
import { InputBar } from '@/components/InputBar';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ErrorToast } from '@/components/ErrorToast';
import { useChats } from '@/hooks/useChats';

export default function ChatByIdPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const selectedChatId = Array.isArray(params?.chatId)
    ? params.chatId[0]
    : params?.chatId ?? null;

  const {
    chats,
    currentChatId,
    messages,
    sendMessage,
    loading,
    error,
    createNewChat: createChatHook,
    deleteCurrentChat: deleteChatHook,
  } = useChats(selectedChatId);

  const handleCreateChat = async () => {
    const newChatId = await createChatHook();
    router.push(`/chat/${newChatId}`);
  };

  const handleDeleteChat = async () => {
    const nextChatId = await deleteChatHook();
    if (nextChatId) {
      router.push(`/chat/${nextChatId}`);
    } else {
      router.push('/chat');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden min-[1168px]:flex min-[1168px]:w-80 min-[1168px]:flex-shrink-0">
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          createNewChat={handleCreateChat}
          deleteCurrentChat={handleDeleteChat}
        />
      </div>
      <div className={sidebarOpen ? 'fixed inset-0 z-40 bg-black/40 min-[1168px]:hidden' : 'hidden'} onClick={() => setSidebarOpen(false)} />
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-gray-50 dark:bg-gray-900 shadow-xl transition-transform duration-200 min-[1168px]:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          createNewChat={handleCreateChat}
          deleteCurrentChat={handleDeleteChat}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      <div className="flex-1 flex flex-col w-full min-h-0">
        <Header onNewChat={handleCreateChat} onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <MessageList messages={messages} />
        </div>
        {loading && <TypingIndicator />}
        <InputBar onSend={sendMessage} loading={loading} />
        {error && <ErrorToast message={error} />}
      </div>
    </div>
  );
}
