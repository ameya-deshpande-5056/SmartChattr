'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { cn } from '@/utils';
import type { MessageRole } from '@/types/chat';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  extraTopSpacing?: boolean;
}

type CodeBlockProps = JSX.IntrinsicElements['code'] & {
  inline?: boolean;
  node?: any;
};

const CodeBlock: FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');
  const language = /language-(\w+)/.exec(className || '')?.[1] || 'code';

  if (inline) {
    return <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.5 text-sm font-mono text-slate-800 dark:text-slate-100">{code}</code>;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{language}</span>
        <button
          onClick={handleCopy}
          className="rounded-md px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-96 overflow-auto p-4 text-xs leading-6 text-slate-900 dark:text-slate-100"><code>{code}</code></pre>
    </div>
  );
}

export function MessageBubble({ role, content, extraTopSpacing }: MessageBubbleProps) {
  return (
    <div className={cn(
      role === 'user'
        ? `flex justify-end${extraTopSpacing ? ' mt-8' : ''}`
        : `flex justify-start min-[1168px]:justify-center${extraTopSpacing ? ' mt-8' : ''}`
    )}>
      <div className={cn(
        role === 'user'
          ? 'max-w-[80%] sm:max-w-[70%]'
          : 'w-full min-[1168px]:w-[80%]',
        'px-4 py-3 rounded-3xl text-sm prose prose-sm prose-headings:text-inherit',
        role === 'user'
          ? 'bg-blue-500 text-white rounded-br-sm prose-light'
          : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
      )}>
        <ReactMarkdown
          components={{
            code: CodeBlock,
            h1: ({ children }) => <h1 className="text-xl font-semibold mt-6 mb-3 last:mb-0 text-slate-900 dark:text-slate-100">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-2 last:mb-0 text-slate-900 dark:text-slate-100">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2 last:mb-0 text-slate-900 dark:text-slate-100">{children}</h3>,
            p: ({ children }) => <p className="mt-3 mb-0 first:mt-0 last:mb-0 text-sm leading-7 text-slate-800 dark:text-slate-200">{children}</p>,
            ul: ({ children }) => <ul className="mt-3 mb-0 first:mt-0 last:mb-0 ml-5 list-disc space-y-2 text-sm text-slate-800 dark:text-slate-200">{children}</ul>,
            ol: ({ children }) => <ol className="mt-3 mb-0 first:mt-0 last:mb-0 ml-5 list-decimal space-y-2 text-sm text-slate-800 dark:text-slate-200">{children}</ol>,
            blockquote: ({ children }) => (
              <blockquote className="mt-3 mb-0 first:mt-0 last:mb-0 border-l-4 border-slate-300 pl-4 italic text-slate-600 dark:border-slate-600 dark:text-slate-300">{children}</blockquote>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-blue-600 hover:underline dark:text-blue-300">{children}</a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

