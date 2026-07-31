import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { Globe, Send } from 'lucide-react';
import type { ChatProviderSelection, ChatRequestOptions } from '@/lib/llm';
import { DEFAULT_GEMINI_MODEL, DEFAULT_GROQ_MODEL, DEFAULT_OPENROUTER_MODEL, GEMINI_FREE_MODEL_GROUPS, GROQ_FREE_MODEL_GROUPS, isGeminiModel, isGroqModel, isOpenRouterModel, OPENROUTER_FREE_MODEL_GROUPS, type GeminiModel, type GroqModel, type OpenRouterModel } from '@/lib/openRouterModels';

interface InputBarProps {
  onSend: (text: string, options?: ChatRequestOptions) => void;
  loading: boolean;
  draftText?: string;
  draftVersion?: number;
}

const PROVIDER_OPTIONS: Array<{ value: ChatProviderSelection; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'google', label: 'Google Gemini' },
  { value: 'groq', label: 'Groq' },
  { value: 'openrouter', label: 'OpenRouter' },
];

export function InputBar({ onSend, loading, draftText, draftVersion }: InputBarProps) {
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState<ChatProviderSelection>('auto');
  const [geminiModel, setGeminiModel] = useState<GeminiModel>(DEFAULT_GEMINI_MODEL);
  const [groqModel, setGroqModel] = useState<GroqModel>(DEFAULT_GROQ_MODEL);
  const [openRouterModel, setOpenRouterModel] = useState<OpenRouterModel>(DEFAULT_OPENROUTER_MODEL);
  const [internetAccess, setInternetAccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAutoProvider = provider === 'auto';
  const isGeminiProvider = provider === 'google';
  const isGroqProvider = provider === 'groq';
  const isOpenRouterProvider = provider === 'openrouter';
  const modelGroups = isGeminiProvider
    ? GEMINI_FREE_MODEL_GROUPS
    : isGroqProvider
      ? GROQ_FREE_MODEL_GROUPS
      : isOpenRouterProvider
        ? OPENROUTER_FREE_MODEL_GROUPS
        : [];
  const selectedModel = isGeminiProvider
    ? geminiModel
    : isGroqProvider
      ? groqModel
      : openRouterModel;

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '48px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 160 ? 'auto' : 'hidden';
  };

  useEffect(() => {
    if (draftVersion === undefined || draftText === undefined) return;
    setInput(draftText);
  }, [draftText, draftVersion]);

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  const handleSubmit = () => {
    if (input.trim()) {
      onSend(input.trim(), {
        provider,
        internetAccess: !isAutoProvider && internetAccess,
        geminiModel: isGeminiProvider ? geminiModel : undefined,
        groqModel: isGroqProvider ? groqModel : undefined,
        openRouterModel: isOpenRouterProvider ? openRouterModel : undefined,
      });
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 overflow-x-hidden">
      <div className="mx-auto flex w-full flex-col gap-2 min-[1168px]:w-[80%]">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <label className="sr-only" htmlFor="ai-provider-select">AI provider</label>
          <select
            id="ai-provider-select"
            value={provider}
            onChange={(event) => {
              const nextProvider = event.target.value as ChatProviderSelection;
              setProvider(nextProvider);
              if (nextProvider === 'auto') {
                setInternetAccess(false);
              }
            }}
            disabled={loading}
            className="h-9 rounded-full border border-gray-300 bg-gray-50 px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            aria-label="Select AI provider"
          >
            {PROVIDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {!isAutoProvider && (
            <>
              <label className="sr-only" htmlFor="provider-model-select">AI model</label>
              <select
                id="provider-model-select"
                value={selectedModel}
                onChange={(event) => {
                  const model = event.target.value;
                  if (isGeminiModel(model)) setGeminiModel(model);
                  if (isGroqModel(model)) setGroqModel(model);
                  if (isOpenRouterModel(model)) setOpenRouterModel(model);
                }}
                disabled={loading}
                className="h-9 rounded-full border border-gray-300 bg-gray-50 px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                aria-label="Select AI model"
              >
                {modelGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.models.map((model) => (
                      <option key={model.id} value={model.id}>{model.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </>
          )}
          {!isAutoProvider && (
            <button
              type="button"
              onClick={() => setInternetAccess((enabled) => !enabled)}
              disabled={loading}
              aria-pressed={internetAccess}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                internetAccess
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200'
                  : 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Globe className="h-4 w-4" />
              Internet {internetAccess ? 'on' : 'off'}
            </button>
          )}
          {isAutoProvider && (
            <span className="rounded-full bg-gray-100 px-3 py-2 text-[11px] text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              Auto keeps smart fallback and live-info routing
            </span>
          )}
        </div>
        <div className="flex w-full items-end gap-3">
          <textarea
            ref={textareaRef}
            className="h-12 max-h-40 flex-1 resize-none overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 px-4 py-[11px] text-gray-900 placeholder:text-xs placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 min-[1168px]:placeholder:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            placeholder="Type your message... Press Enter to send, Shift+Enter for a new line."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            {loading ? '...' : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
