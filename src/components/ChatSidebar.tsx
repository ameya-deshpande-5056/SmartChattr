'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn, downloadFile, buildAllChatsPrintableHtml, buildChatText, buildPrintableHtml, openPrintPreview, getThemeMode, setTheme } from '@/utils';
import type { ChatPreview } from '@/types/chat';
import { Trash2, X, Settings, Download, Package, Sun, Moon, Zap, Upload, Database } from 'lucide-react';
import { exportDatabaseBackup, importDatabaseBackup, loadMessages, loadMessagesByChat } from '@/lib/db';

interface ChatSidebarProps {
  className?: string;
  chats: ChatPreview[];
  currentChatId: string | null;
  createNewChat: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  onClose?: () => void;
}

export function ChatSidebar({ className, chats, currentChatId, createNewChat, deleteChat, onClose }: ChatSidebarProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'txt'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [themeMode, setThemeModeState] = useState<'auto' | 'light' | 'dark'>(getThemeMode);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (mode: 'auto' | 'light' | 'dark') => {
    setTheme(mode);
    setThemeModeState(mode);
  };

  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;

    const timer = window.setTimeout(() => setErrorMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  const getChatById = (chatId: string) => chats.find((chat) => chat.id === chatId);

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

  const exportDatabase = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const backup = await exportDatabaseBackup();
      downloadFile(
        `smartchattr-backup-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(backup, null, 2),
        'application/json',
      );
      setSuccessMessage('Full backup exported successfully!');
    } finally {
      setIsExporting(false);
    }
  };

  const importDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Importing a backup will replace all current local chats on this device. Continue?')) {
      event.target.value = '';
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      await importDatabaseBackup(backup);
      setSuccessMessage('Backup imported successfully! Reloading...');
      window.setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to import backup.');
    } finally {
      event.target.value = '';
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
    } else {
      const html = buildPrintableHtml(chat.title, chat.id, chat.updatedAt.toISOString(), messages);
      openPrintPreview(chat.title, html);
    }
  };

  const dispatchExportAll = async (
    chatsWithMessages: Array<{ chat: ChatPreview; messages: Array<{ role: string; content: string }> }>,
    format: 'txt' | 'pdf',
  ) => {
    if (format === 'txt') {
      const text = chatsWithMessages
        .map(({ chat, messages }) => buildChatText(chat.title, chat.id, chat.updatedAt.toISOString(), messages))
        .join('\n\n---\n\n');
      downloadFile('all-chats.txt', text, 'text/plain');
    } else {
      const html = buildAllChatsPrintableHtml(
        chatsWithMessages.map(({ chat, messages }) => ({
          title: chat.title,
          chatId: chat.id,
          updatedAt: chat.updatedAt.toISOString(),
          messages,
        })),
      );
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
      {errorMessage && (
        <div className="fixed top-4 left-4 z-50 max-w-xs rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {errorMessage}
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="min-[1168px]:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {isSettingsOpen && (
        <div className="p-4 border-b bg-white dark:bg-gray-800 space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Export</label>
            <div className="flex gap-2 items-center">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'txt' | 'pdf')}
                className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                aria-label="Export format"
              >
                <option value="pdf">PDF</option>
                <option value="txt">TXT</option>
              </select>
              <button
                onClick={exportCurrentChat}
                disabled={!currentChatId || isExporting}
                aria-label="Export current chat"
                title="Export current chat"
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={exportAllChats}
                disabled={chats.length === 0 || isExporting}
                aria-label="Export all chats"
                title="Export all chats"
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Package className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Backup</label>
            <div className="flex gap-2 items-center">
              <button
                onClick={exportDatabase}
                disabled={isExporting}
                aria-label="Export full backup"
                title="Export full backup"
                className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Database className="h-4 w-4" />
                Export DB
              </button>
              <button
                onClick={() => importInputRef.current?.click()}
                disabled={isExporting}
                aria-label="Import full backup"
                title="Import full backup"
                className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import DB
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={importDatabase}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Theme</label>
            <div className="flex gap-2 justify-between">
              <button
                onClick={() => handleThemeChange('auto')}
                aria-label="Auto theme (system)"
                title="Auto theme (system)"
                className={cn(
                  "flex-1 inline-flex h-10 items-center justify-center rounded-lg transition-colors",
                  themeMode === 'auto'
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                <Zap className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                aria-label="Light theme"
                title="Light theme"
                className={cn(
                  "flex-1 inline-flex h-10 items-center justify-center rounded-lg transition-colors",
                  themeMode === 'light'
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                <Sun className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                aria-label="Dark theme"
                title="Dark theme"
                className={cn(
                  "flex-1 inline-flex h-10 items-center justify-center rounded-lg transition-colors",
                  themeMode === 'dark'
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                <Moon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

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
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this chat?')) {
                  deleteChat(chat.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2"
              aria-label="Delete chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

