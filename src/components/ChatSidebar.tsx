'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { cn, downloadFile, buildAllChatsPrintableHtml, buildChatText, buildPrintableHtml, openPrintPreview, getThemeMode, setTheme } from '@/utils';
import type { ChatPreview, Message } from '@/types/chat';
import { Trash2, X, Settings, Download, Package, Sun, Moon, Zap, Upload, Database, Search, MoreVertical, FileText, Printer, DownloadCloud } from 'lucide-react';
import { exportDatabaseBackup, importDatabaseBackup, loadMessages, loadMessagesByChat, exportSingleChatAsJson, type ImportMode } from '@/lib/db';

interface ChatSidebarProps {
  className?: string;
  chats: ChatPreview[];
  currentChatId: string | null;
  createNewChat: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  onClose?: () => void;
}

export function ChatSidebar({ className, chats, currentChatId, createNewChat, deleteChat, onClose }: ChatSidebarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [themeMode, setThemeModeState] = useState<'auto' | 'light' | 'dark'>(getThemeMode);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<ChatPreview[]>(chats);
  const [isSearching, setIsSearching] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('replace');
  const [backupData, setBackupData] = useState<{ chats: ChatPreview[]; messages: Message[] } | null>(null);
  const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (menuRef.current && !menuRef.current.contains(target) && !target.closest('[data-menu-trigger="true"]')) {
      setMenuChatId(null);
    }
  }, []);

  useEffect(() => {
    if (menuChatId) {
      document.addEventListener('mousedown', handleClickOutside);
      // Close menu on scroll so it doesn't float away from its anchor
      const scrollContainer = chatListRef.current;
      const handleScroll = () => setMenuChatId(null);
      scrollContainer?.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        scrollContainer?.removeEventListener('scroll', handleScroll);
      };
    }
  }, [menuChatId, handleClickOutside]);

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

  useEffect(() => {
    setFilteredChats(chats);
  }, [chats]);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredChats(chats);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const query = searchQuery.toLowerCase();

      try {
        const titleMatches = chats.filter(chat =>
          chat.title.toLowerCase().includes(query)
        );

        const messageMatches: ChatPreview[] = [];
        for (const chat of chats) {
          if (titleMatches.includes(chat)) continue;

          const messages = await loadMessagesByChat(chat.id);
          const hasMatchingMessage = messages.some(msg =>
            msg.content.toLowerCase().includes(query)
          );

          if (hasMatchingMessage) {
            messageMatches.push(chat);
          }
        }

        const allMatches = [...titleMatches, ...messageMatches]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        setFilteredChats(allMatches);
      } catch (error) {
        console.error('Search error:', error);
        setFilteredChats(chats);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, chats]);

  const getChatById = (chatId: string) => chats.find((chat) => chat.id === chatId);

  const handleExport = async (chat: ChatPreview, format: 'pdf' | 'txt' | 'json') => {
    setIsExporting(true);
    try {
      if (format === 'json') {
        const backup = await exportSingleChatAsJson(chat.id);
        downloadFile(
          `${chat.title || 'chat'}-backup.json`,
          JSON.stringify(backup, null, 2),
          'application/json',
        );
        setSuccessMessage('Chat backed up successfully!');
      } else {
        const messages = await loadMessagesByChat(chat.id);
        await dispatchExportSingle(chat, messages, format, `${chat.title || 'chat'}.${format}`);
        setSuccessMessage(`${format.toUpperCase()} export completed successfully!`);
      }
      setMenuChatId(null);
      setMenuPosition(null);
    } catch (error) {
      setErrorMessage('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllChats = async (format: 'pdf' | 'txt') => {
    setIsExporting(true);
    try {
      const allMessages = await loadMessages();
      const messagesByChat = chats.map((chat) => ({
        chat,
        messages: allMessages.filter((message) => message.chatId === chat.id),
      }));
      await dispatchExportAll(messagesByChat, format);
      setSuccessMessage(`All chats exported as ${format.toUpperCase()}!`);
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

    setIsExporting(true);
    setErrorMessage(null);

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      if (!backup || typeof backup !== 'object') {
        throw new Error('Invalid backup file.');
      }

      const data = backup as { chats?: ChatPreview[]; messages?: Message[] };
      const chats = Array.isArray(data.chats) ? data.chats : null;
      const messages = Array.isArray(data.messages) ? data.messages : null;

      if (!chats || !messages) {
        throw new Error('Backup file is missing chats or messages.');
      }

      setBackupData({ chats, messages });
      setSelectedChatIds(new Set(chats.map(c => c.id)));
      setShowImportDialog(true);
      setImportMode('replace');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse backup file.');
      if (importInputRef.current) importInputRef.current.value = '';
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportWithMode = async () => {
    if (!backupData || selectedChatIds.size === 0) {
      setErrorMessage('Please select at least one chat to import.');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);

    try {
      const selectedChats = backupData.chats.filter(c => selectedChatIds.has(c.id));
      const selectedMessages = backupData.messages.filter(m => selectedChatIds.has(m.chatId));
      
      const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        chats: selectedChats,
        messages: selectedMessages,
      };
      
      await importDatabaseBackup(backup, importMode);
      setSuccessMessage('Backup imported successfully! Reloading...');
      setShowImportDialog(false);
      setBackupData(null);
      setSelectedChatIds(new Set());
      if (importInputRef.current) importInputRef.current.value = '';
      window.setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to import backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const dispatchExportSingle = async (
    chat: ChatPreview,
    messages: Array<{ role: string; content: string }>,
    exportFormat: 'pdf' | 'txt',
    filename: string,
  ) => {
    if (exportFormat === 'txt') {
      const text = buildChatText(chat.title, chat.id, chat.updatedAt.toISOString(), messages);
      downloadFile(filename, text, 'text/plain');
    } else {
      const html = await buildPrintableHtml(chat.title, chat.id, chat.updatedAt.toISOString(), messages);
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
      const html = await buildAllChatsPrintableHtml(
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
      "w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-x-hidden",
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
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
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
        </div>
        {isSettingsOpen && (
          <div className="p-4 border-t bg-white dark:bg-gray-800 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Export All</label>
              <div className="flex gap-2">
                <button
                  onClick={() => exportAllChats('pdf')}
                  disabled={chats.length === 0 || isExporting}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <Printer className="h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={() => exportAllChats('txt')}
                  disabled={chats.length === 0 || isExporting}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  TXT
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
                {showImportDialog && backupData && (
                  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Import Backup</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select chats to import and choose import mode:</p>
                      
                      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                          <input
                            type="checkbox"
                            checked={selectedChatIds.size === backupData.chats.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedChatIds(new Set(backupData.chats.map(c => c.id)));
                              } else {
                                setSelectedChatIds(new Set());
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Select All ({backupData.chats.length} chats)
                          </span>
                        </div>
                        {backupData.chats.map((chat) => (
                          <label key={chat.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedChatIds.has(chat.id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedChatIds);
                                if (e.target.checked) {
                                  newSet.add(chat.id);
                                } else {
                                  newSet.delete(chat.id);
                                }
                                setSelectedChatIds(newSet);
                              }}
                              className="mt-1 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{chat.title || 'New Chat'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(chat.updatedAt).toLocaleDateString()} • {chat.preview || 'No preview'}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="space-y-3 mb-4">
                        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name="importMode"
                            value="replace"
                            checked={importMode === 'replace'}
                            onChange={(e) => setImportMode(e.target.value as ImportMode)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">Replace all</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Delete all existing chats and replace with selected</div>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name="importMode"
                            value="merge"
                            checked={importMode === 'merge'}
                            onChange={(e) => setImportMode(e.target.value as ImportMode)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">Merge</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Update existing chats by ID, add new ones</div>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name="importMode"
                            value="add"
                            checked={importMode === 'add'}
                            onChange={(e) => setImportMode(e.target.value as ImportMode)}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">Add only</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Add selected chats without modifying existing ones</div>
                          </div>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowImportDialog(false);
                            setBackupData(null);
                            setSelectedChatIds(new Set());
                            if (importInputRef.current) importInputRef.current.value = '';
                          }}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleImportWithMode}
                          disabled={isExporting || selectedChatIds.size === 0}
                          className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          {isExporting ? 'Importing...' : `Import ${selectedChatIds.size} chat${selectedChatIds.size !== 1 ? 's' : ''}`}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
        <div className="p-4 border-t">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat list */}
      <div ref={chatListRef} className="flex-1 overflow-auto p-2 space-y-1">
        {isSearching ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            Searching...
          </div>
        ) : filteredChats.length === 0 && searchQuery ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            No chats found matching "{searchQuery}"
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div key={chat.id}>
              <Link
                href={`/chat/${chat.id}`}
                title={`${chat.title || 'New Chat'}\nUpdated On: ${new Date(chat.updatedAt).toLocaleDateString()}`}
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (menuChatId === chat.id) {
                      setMenuChatId(null);
                      setMenuPosition(null);
                    } else {
                      const btn = e.currentTarget;
                      const rect = btn.getBoundingClientRect();
                      setMenuPosition({ top: rect.bottom + 4, left: rect.right - 208 });
                      setMenuChatId(chat.id);
                    }
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full opacity-50 group-hover:opacity-100 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-all duration-200 ${menuChatId === chat.id ? 'rotate-90 opacity-100 bg-gray-100 dark:bg-gray-700 scale-105' : ''} ml-auto`}
                  aria-label="Chat options"
                  data-menu-trigger="true"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </Link>
              {menuChatId === chat.id && menuPosition && (
                <div
                  ref={menuRef}
                  className="fixed z-[9999] w-52 rounded-xl bg-white/95 backdrop-blur-sm shadow-2xl border border-gray-100/50 ring-1 ring-black/10 dark:bg-gray-800/95 dark:border-gray-700/50 dark:shadow-2xl dark:ring-gray-900/20 origin-top-right"
                  style={{ top: menuPosition.top, left: Math.max(4, menuPosition.left) }}
                >
                  <div className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    Updated: {new Date(chat.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="p-1.5 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(chat, 'pdf');
                      }}
                      disabled={isExporting}
                      className="w-full px-3 py-2 rounded-lg text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4 text-blue-500" />
                      Export to PDF
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(chat, 'txt');
                      }}
                      disabled={isExporting}
                      className="w-full px-3 py-2 rounded-lg text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-slate-500" />
                      Export to TXT
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(chat, 'json');
                      }}
                      disabled={isExporting}
                      className="w-full px-3 py-2 rounded-lg text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <DownloadCloud className="h-4 w-4 text-emerald-500" />
                      Backup as JSON
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this chat?')) {
                        deleteChat(chat.id);
                        setMenuChatId(null);
                        setMenuPosition(null);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-b-xl text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete chat
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
