'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ChatNotices } from '@/components/ChatNotices';
import { Header } from '@/components/Header';
import { ChatSidebar } from '@/components/ChatSidebar';
import { MessageList } from '@/components/MessageList';
import { InputBar } from '@/components/InputBar';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ErrorToast } from '@/components/ErrorToast';
import { useChats } from '@/hooks/useChats';

export default function ChatByIdPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftVersion, setDraftVersion] = useState(0);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledAutoSendRef = useRef<string | null>(null);
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
    messagesReady,
    createNewChat: createChatHook,
    deleteChatById,
  } = useChats(selectedChatId);

  const handleCreateChat = async () => {
    const newChatId = await createChatHook();
    router.push(`/chat/${newChatId}`);
  };

  useEffect(() => {
    const draft = searchParams.get('draft');
    if (!draft) return;

    setDraftText(draft);
    setDraftVersion((current) => current + 1);
  }, [searchParams]);

  useEffect(() => {
    const autoSend = searchParams.get('autoSend');
    if (!autoSend || !selectedChatId || !messagesReady || loading) return;
    if (handledAutoSendRef.current === autoSend) return;

    handledAutoSendRef.current = autoSend;
    sendMessage(autoSend);
    router.replace(`/chat/${selectedChatId}`);
  }, [loading, messagesReady, router, searchParams, selectedChatId, sendMessage]);

  const applyDraft = (prompt: string) => {
    setDraftText(prompt);
    setDraftVersion((current) => current + 1);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden max-w-[100vw]">
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
      <div className="flex-1 flex flex-col w-full min-h-0 overflow-x-hidden min-w-0">
        <Header onNewChat={handleCreateChat} onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col overflow-x-hidden min-w-0">
          <MessageList messages={messages} onStarterPrompt={applyDraft} />
        </div>
        {loading && <TypingIndicator />}
        <InputBar onSend={sendMessage} loading={loading} draftText={draftText} draftVersion={draftVersion} />
        <ChatNotices />
        {error && <ErrorToast message={error} />}
      </div>
    </div>
  );
}
