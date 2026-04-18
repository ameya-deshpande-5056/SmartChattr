'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ChatSidebar } from '@/components/ChatSidebar';
import { useChats } from '@/hooks/useChats';

export default function ChatPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { chats, currentChatId, createNewChat: createChatHook, deleteChatById } = useChats(null);

  const handleCreateChat = async () => {
    const newChatId = await createChatHook();
    setSidebarOpen(false);
    router.push(`/chat/${newChatId}`);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden min-[1168px]:flex min-[1168px]:w-80 min-[1168px]:flex-shrink-0">
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          createNewChat={handleCreateChat}
          deleteChat={deleteChatById}
        />
      </div>
      <div className={sidebarOpen ? 'fixed inset-0 z-40 bg-black/40 min-[1168px]:hidden' : 'hidden'} onClick={() => setSidebarOpen(false)} />
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-gray-50 dark:bg-gray-900 shadow-xl transition-transform duration-200 min-[1168px]:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          createNewChat={handleCreateChat}
          deleteChat={deleteChatById}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      <div className="flex-1 flex flex-col w-full min-h-0">
        <Header onNewChat={handleCreateChat} onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center text-gray-500 dark:text-gray-400 px-4 md:px-6">
          Select a chat from the sidebar or create a new one.
        </div>
      </div>
    </div>
  );
}

