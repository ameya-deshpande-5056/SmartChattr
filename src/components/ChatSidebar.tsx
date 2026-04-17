'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn, downloadFile, escapeCsv, buildChatText, buildChatCsv, buildPrintableChatSection, buildPrintableHtml, openPrintPreview } from '@/utils';
import type { ChatPreview } from '@/types/chat';
import { Trash2, X } from 'lucide-react';
import { loadMessages, loadMessagesByChat } from '@/lib/db';

interface ChatSidebarProps {
  className?: string;
  chats: ChatPreview[];
  currentChatId: string | null;
  createNewChat: () => Promise<void>;
  deleteCurrentChat: () => Promise<void>;
  onClose?: () => void;
}

export function ChatSidebar({ className, chats, currentChatId, createNewChat, deleteCurrentChat, onClose }: ChatSidebarProps) {
  const [exportFormat, setExportFormat] = useState<'txt' | 'csv' | 'pdf'>('txt');
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getChatById = (chatId: string) => chats.find((chat) => chat.id === chatId);

  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const exportCurrentChat = async () => {
    if (!currentChatId) return;
    const chat = getChatById(currentChatId);
    if (!chat) return;

    setIsExporting(true);
    try {
      const messages = await loadMessagesByChat(currentChatId);
      await dispatchExport(chat, messages, `${chat.title || 'chat'}.${exportFormat}`);
      setSuccessMessage('Export completed successfully!');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllChats = async () => {
    setIsExporting(true);
    try {
      const allMessages = await loadMessages();
      const messagesByChat = chats.map((chat) => ({
        chat,
        messages: allMessages.filter((message) => message.chatId === chat.id),
      }));
      await dispatchExportAll(messagesByChat, exportFormat);
      setSuccessMessage('All chats exported successfully!');
    } finally {
      setIsExporting(false);
    }
  };

  const dispatchExport = async (
    chat: ChatPreview,
    messages: Array<{ role: string; content: string }>,
    filename: string,
  ) => {
    if (exportFormat === 'txt') {
      const text = buildChatText(chat.title, chat.id, chat.updatedAt.toISOString(), messages);
      downloadFile(filename, text, 'text/plain');
    } else if (exportFormat === 'csv') {
      const csv = buildChatCsv(chat.title, chat.id, messages);
      downloadFile(filename, csv, 'text/csv');
    } else {
      const html = buildPrintableHtml(chat.title, chat.id, chat.updatedAt.toISOString(), messages);
      openPrintPreview(chat.title, html);
    }
  };

  const dispatchExportAll = async (
    chatsWithMessages: Array<{ chat: ChatPreview; messages: Array<{ role: string; content: string }> }>,
    format: 'txt' | 'csv' | 'pdf',
  ) => {
    if (format === 'txt') {
      const text = chatsWithMessages
        .map(({ chat, messages }) => buildChatText(chat.title, chat.id, chat.updatedAt.toISOString(), messages))
        .join('\n\n---\n\n');
      downloadFile('all-chats.txt', text, 'text/plain');
    } else if (format === 'csv') {
      const rows = ['Chat ID,Chat Title,Role,Message'];
      for (const { chat, messages } of chatsWithMessages) {
        for (const message of messages) {
          rows.push([
            escapeCsv(chat.id),
            escapeCsv(chat.title),
            escapeCsv(message.role),
            escapeCsv(message.content),
          ].join(','));
        }
      }
      downloadFile('all-chats.csv', rows.join('\n'), 'text/csv');
    } else {
      const body = chatsWithMessages
        .map(({ chat, messages }) => buildPrintableChatSection(chat.title, chat.id, chat.updatedAt.toISOString(), messages))
        .join('<div style="page-break-after: always;"></div>');
      const html = `
        <html>
          <head>
            <title>All chats</title>
            <style>
              body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111827; background: #ffffff; }
              h1 { font-size: 24px; margin-bottom: 8px; }
              p { margin: 0; }
            </style>
          </head>
          <body>${body}</body>
        </html>
      `;
      openPrintPreview('All chats', html);
    }
  };

  return (
    <div className={cn(
      "w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col",
      className
    )}>
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-xs rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            ×
          </button>
        </div>
      )}
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-800 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chats</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tap a chat to open or start a new one.</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="min-[1168px]:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="p-4 border-b bg-white dark:bg-gray-800 space-y-3">
        <button
          onClick={createNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="w-4 h-4 bg-gray-400 rounded-sm inline-block"></span>
          New Chat
        </button>
        <div className="grid gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Export format</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'txt' | 'csv' | 'pdf')}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="txt">TXT</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={exportCurrentChat}
            disabled={!currentChatId || isExporting}
            className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export current chat
          </button>
          <button
            onClick={exportAllChats}
            disabled={chats.length === 0 || isExporting}
            className="w-full rounded-md bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export all chats
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors group",
              currentChatId === chat.id
                ? "bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm border border-transparent"
            )}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-medium">
              {chat.title.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{chat.title || 'New Chat'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.preview}</p>
            </div>
            <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500 ml-auto">
              {new Date(chat.updatedAt).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>

      {/* Current chat delete */}
      {currentChatId && (
        <div className="p-3 border-t bg-red-50 dark:bg-red-900">
          <button
            onClick={deleteCurrentChat}
            className="w-full flex items-center gap-2 text-sm text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Chat
          </button>
        </div>
      )}
    </div>
  );
}

