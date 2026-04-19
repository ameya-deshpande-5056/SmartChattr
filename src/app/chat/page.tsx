'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatNotices } from '@/components/ChatNotices';
import { InputBar } from '@/components/InputBar';
import { StarterPrompts } from '@/components/StarterPrompts';
import { useChats } from '@/hooks/useChats';

export default function ChatPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftVersion, setDraftVersion] = useState(0);
  const { chats, currentChatId, createNewChat: createChatHook, deleteChatById } = useChats(null);

  const handleCreateChat = async () => {
    const newChatId = await createChatHook();
    setSidebarOpen(false);
    router.push(`/chat/${newChatId}`);
  };

  const applyDraft = (prompt: string) => {
    setDraftText(prompt);
    setDraftVersion((current) => current + 1);
  };

  const handleStartFromDraft = async (text: string) => {
    setStartingChat(true);

    try {
      const newChatId = await createChatHook();
      setSidebarOpen(false);
      router.push(`/chat/${newChatId}?autoSend=${encodeURIComponent(text)}`);
    } finally {
      setStartingChat(false);
    }
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
        <div className="flex-1 min-h-0 overflow-hidden px-4 py-8 md:px-6">
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Start with something simple</h2>
              <p className="mt-3 text-base leading-7 text-gray-500 dark:text-gray-400">
                Pick a prompt below or type your own message. We&apos;ll create a fresh chat as soon as you send it.
              </p>
            </div>
            <StarterPrompts onSelect={applyDraft} />
          </div>
        </div>
        <InputBar onSend={handleStartFromDraft} loading={startingChat} draftText={draftText} draftVersion={draftVersion} />
        <ChatNotices />
      </div>
    </div>
  );
}

