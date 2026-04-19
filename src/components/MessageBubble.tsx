'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { cn } from '@/utils';
import type { MessageRole } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Copy } from 'lucide-react';

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  timestamp?: string | Date;
  extraTopSpacing?: boolean;
}

type CodeBlockProps = JSX.IntrinsicElements['code'] & {
  inline?: boolean;
  node?: any;
};

const CodeBlock: FC<CodeBlockProps & { role?: MessageRole }> = ({ inline, className, children, role, ...props }) => {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  const language = /language-(\w+)/.exec(className || '')?.[1] || 'code';

  const isUser = role === 'user';

  if (inline) {
    return <code className={cn("rounded px-1 py-0.5 text-sm font-mono", isUser ? 'bg-slate-600 text-slate-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100')}>{code}</code>;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("my-4 overflow-hidden rounded-2xl border", isUser ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900')}>
      <div className={cn("flex items-center justify-between border-b px-4 py-2", isUser ? 'border-slate-600 bg-slate-600' : 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800')}>
        <span className={cn("text-xs uppercase tracking-[0.2em]", isUser ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400')}>{language}</span>
        <button
          onClick={handleCopy}
          className={cn("rounded-md px-3 py-1 text-xs font-semibold", isUser ? 'text-slate-200 hover:bg-slate-500' : 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700')}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={cn("max-h-96 overflow-auto p-4 text-xs leading-6", isUser ? 'text-slate-100' : 'text-slate-900 dark:text-slate-100')}><code>{code}</code></pre>
    </div>
  );
}

export function MessageBubble({ role, content, timestamp, extraTopSpacing }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const formatTimestamp = (value?: string | Date) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const timeString = formatTimestamp(timestamp);

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      role === 'user'
        ? `flex justify-end${extraTopSpacing ? ' mt-8' : ''}`
        : `flex flex-col${extraTopSpacing ? ' mt-8' : ''}`
    )}>
      <div className={cn(
        role === 'user'
          ? 'max-w-[80%] sm:max-w-[70%]'
          : 'w-full min-[1168px]:w-[80%] self-start min-[1168px]:self-center',
        'px-4 py-3 rounded-3xl text-sm prose prose-sm prose-headings:text-inherit group relative',
        role === 'user'
          ? 'bg-blue-500 text-white rounded-br-sm prose-light min-[1168px]:mr-[10%]'
          : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
      )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            code: (props) => <CodeBlock {...props} role={role} />,
            h1: ({ children }) => <h1 className={cn("text-xl font-semibold mt-6 mb-3 last:mb-0", role === 'user' ? 'text-white' : 'text-slate-900 dark:text-slate-100')}>{children}</h1>,
            h2: ({ children }) => <h2 className={cn("text-lg font-semibold mt-5 mb-2 last:mb-0", role === 'user' ? 'text-white' : 'text-slate-900 dark:text-slate-100')}>{children}</h2>,
            h3: ({ children }) => <h3 className={cn("text-base font-semibold mt-4 mb-2 last:mb-0", role === 'user' ? 'text-white' : 'text-slate-900 dark:text-slate-100')}>{children}</h3>,
            h4: ({ children }) => <h4 className={cn("text-sm font-semibold mt-4 mb-2 last:mb-0", role === 'user' ? 'text-white' : 'text-slate-900 dark:text-slate-100')}>{children}</h4>,
            p: ({ children }) => <p className={cn("mt-3 mb-0 first:mt-0 last:mb-0 text-sm leading-7", role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200')}>{children}</p>,
            ul: ({ children }) => <ul className={cn("mt-3 mb-0 first:mt-0 last:mb-0 ml-5 list-disc space-y-2 text-sm", role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200')}>{children}</ul>,
            ol: ({ children }) => <ol className={cn("mt-3 mb-0 first:mt-0 last:mb-0 ml-5 list-decimal space-y-2 text-sm", role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200')}>{children}</ol>,
            li: ({ children }) => <li className="leading-7">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className={cn("mt-3 mb-0 first:mt-0 last:mb-0 border-l-4 pl-4 italic", role === 'user' ? 'border-white/30 text-white/80' : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300')}>{children}</blockquote>
            ),
            table: ({ children }) => (
              <div className="my-4 overflow-x-auto">
                <table className={cn("min-w-full border-collapse text-sm", role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200')}>{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className={role === 'user' ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-700/70'}>{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr className={role === 'user' ? 'border-b border-white/10' : 'border-b border-slate-200 dark:border-slate-700'}>{children}</tr>,
            th: ({ children }) => <th className="border px-3 py-2 text-left font-semibold">{children}</th>,
            td: ({ children }) => <td className="border px-3 py-2 align-top">{children}</td>,
            hr: () => <hr className={cn("my-4 border-0 border-t", role === 'user' ? 'border-white/20' : 'border-slate-300 dark:border-slate-600')} />,
            del: ({ children }) => <del className="opacity-80">{children}</del>,
            input: ({ checked, disabled, type }) => {
              if (type !== 'checkbox') return null;
              return <input type="checkbox" checked={checked} disabled={disabled ?? true} readOnly className="mr-2 align-middle" />;
            },
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noreferrer" className={cn("hover:underline break-words", role === 'user' ? 'text-blue-200' : 'text-blue-600 dark:text-blue-300')}>{children}</a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        <div className="flex items-end justify-end gap-2 mt-2">
          <div className={cn(
            'text-[11px] tracking-[0.08em]',
            role === 'user' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
          )}>
            {timeString}
          </div>
        </div>
      </div>
      {role === 'assistant' && (
        <div className="flex justify-end mt-1 min-[1168px]:justify-center">
          <div className="min-[1168px]:w-[80%] flex justify-end">
            <button
              onClick={handleCopyMessage}
              aria-label="Copy message"
              title={copied ? 'Copied!' : 'Copy message'}
              className={cn(
                "inline-flex h-7 items-center justify-center gap-1.5 rounded px-2 text-xs font-medium transition-all",
                copied
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

