import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Minimal className merge helper
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function downloadFile(filename: string, content: string | Blob, mimeType = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function escapeCsv(value: string): string {
  const escaped = String(value).replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildChatText(title: string, chatId: string, updatedAt: string, messages: Array<{ role: string; content: string; aiProvider?: string; aiModel?: string }>) {
  const header = `Chat title: ${title}\nChat id: ${chatId}\nUpdated: ${updatedAt}\n\n`;
  const body = messages
    .map((message, index) => {
      const aiInfo = message.aiProvider || message.aiModel ? ` [${[message.aiProvider, message.aiModel].filter(Boolean).join(' · ')}]` : '';
      return `${index + 1}. ${message.role.toUpperCase()}${aiInfo}: ${message.content}`;
    })
    .join('\n\n');
  return `${header}${body}`;
}

export function buildChatCsv(title: string, chatId: string, messages: Array<{ role: string; content: string }>) {
  const rows = ['Chat ID,Chat Title,Role,Message'];
  for (const message of messages) {
    rows.push([
      escapeCsv(chatId),
      escapeCsv(title),
      escapeCsv(message.role),
      escapeCsv(message.content),
    ].join(','));
  }
  return rows.join('\n');
}

export async function buildPrintableChatSection(title: string, chatId: string, updatedAt: string, messages: Array<{ role: string; content: string; aiProvider?: string; aiModel?: string }>) {
  const messageNodes = await Promise.all(messages.map(async (message) => {
    const html = await renderMarkdownAsHtml(message.content);
    const aiInfo = message.aiProvider || message.aiModel ? `<div class="message-ai">AI: ${[message.aiProvider, message.aiModel].filter(Boolean).join(' · ')}</div>` : '';
    return `
      <div class="message ${message.role}">
        <div class="message-badge">${message.role.toUpperCase()}</div>
        ${aiInfo}
        <div class="message-body">${html}</div>
      </div>
    `;
  }));

  return `
    <section class="chat-section">
      <div class="chat-header">
        <h1>${escapeHtml(title)}</h1>
        <p class="meta">Chat id: ${escapeHtml(chatId)} · Updated: ${escapeHtml(updatedAt)}</p>
      </div>
      ${messageNodes.join('')}
    </section>
  `;
}

function buildPrintableDocument(title: string, body: string) {
  return `
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <style>
          :root {
            color-scheme: light;
            color: #111827;
            background: #f8fafc;
          }
          body {
            margin: 0;
            padding: 24px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fafc;
            color: #111827;
          }
          .chat-section {
            background: white;
            border-radius: 28px;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
            margin-bottom: 32px;
            padding: 28px;
            page-break-inside: avoid;
          }
          .chat-header h1 {
            margin: 0 0 8px;
            font-size: 32px;
            line-height: 1.1;
          }
          .meta {
            margin: 0 0 24px;
            color: #6b7280;
            font-size: 0.95rem;
          }
          .message {
            border-radius: 24px;
            padding: 20px;
            margin-bottom: 18px;
            border: 1px solid #e5e7eb;
          }
          .message.user {
            background: #e0f2fe;
            border-color: #bae6fd;
          }
          .message.assistant {
            background: #eef2ff;
            border-color: #c7d2fe;
          }
          .message-badge {
            display: inline-flex;
            margin-bottom: 14px;
            padding: 6px 12px;
            border-radius: 9999px;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            background: rgba(59, 130, 246, 0.12);
            color: #1d4ed8;
          }
          .message-ai {
            font-size: 0.7rem;
            color: #64748b;
            margin-bottom: 8px;
            font-style: italic;
          }
          .message-body p {
            margin: 0 0 16px;
            line-height: 1.75;
            color: #111827;
          }
          .message-body code {
            background: #f3f4f6;
            padding: 0.2rem 0.35rem;
            border-radius: 0.35rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
            font-size: 0.95rem;
          }
          .message-body .code-shell {
            margin: 0 0 16px;
            border-radius: 18px;
            overflow: hidden;
            border: 1px solid #0f172a;
            background: #0f172a;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
          }
          .message-body .code-language {
            padding: 10px 14px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.25);
            background: #111827;
            color: #94a3b8;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .message-body pre {
            margin: 0 0 16px;
            padding: 16px;
            background: #111827;
            color: #f8fafc;
            border-radius: 18px;
            overflow: visible;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
            line-height: 1.65;
            tab-size: 2;
          }
          .message-body .code-shell pre {
            margin: 0;
            border-radius: 0;
            background: #0f172a;
          }
          .message-body pre code {
            display: block;
            padding: 0;
            background: transparent;
            color: inherit;
            border-radius: 0;
            font-size: 0.88rem;
            line-height: inherit;
            white-space: inherit;
          }
          .message-body blockquote {
            margin: 0 0 16px;
            padding: 14px 18px;
            border-left: 4px solid #c7d2fe;
            background: #eef2ff;
            color: #334155;
          }
          .message-body ul,
          .message-body ol {
            margin: 0 0 16px 24px;
          }
          .message-body hr {
            margin: 18px 0;
            border: 0;
            border-top: 1px solid #cbd5e1;
          }
          .message-body table {
            width: 100%;
            margin: 0 0 16px;
            border-collapse: collapse;
            font-size: 0.95rem;
          }
          .message-body th,
          .message-body td {
            border: 1px solid #d1d5db;
            padding: 10px 12px;
            text-align: left;
            vertical-align: top;
          }
          .message-body th {
            background: #f8fafc;
            font-weight: 700;
          }
          .message-body input[type="checkbox"] {
            margin-right: 8px;
          }
          .message-body del {
            color: #64748b;
          }
          .message-body a {
            color: #2563eb;
            text-decoration: none;
          }
          .message-body a:hover {
            text-decoration: underline;
          }
          .message-body h1,
          .message-body h2,
          .message-body h3,
          .message-body h4 {
            margin: 24px 0 12px;
            line-height: 1.2;
          }
          .message-body h1 { font-size: 1.8rem; }
          .message-body h2 { font-size: 1.5rem; }
          .message-body h3 { font-size: 1.25rem; }
          .message-body h4 { font-size: 1.1rem; }
          a { color: #2563eb; }
        </style>
      </head>
      <body>
        ${body}
      </body>
    </html>
  `;
}

export async function buildPrintableHtml(title: string, chatId: string, updatedAt: string, messages: Array<{ role: string; content: string; aiProvider?: string; aiModel?: string }>) {
  return buildPrintableDocument(
    title,
    await buildPrintableChatSection(title, chatId, updatedAt, messages),
  );
}

export async function buildAllChatsPrintableHtml(
  chatsWithMessages: Array<{ title: string; chatId: string; updatedAt: string; messages: Array<{ role: string; content: string; aiProvider?: string; aiModel?: string }> }>,
) {
  const body = await Promise.all(
    chatsWithMessages.map(({ title, chatId, updatedAt, messages }) => 
      buildPrintableChatSection(title, chatId, updatedAt, messages)
    )
  );

  return buildPrintableDocument('All chats', body.join('<div style="height: 8px; page-break-after: always;"></div>'));
}

function preprocessMathForPdf(text: string): string {
  // Convert LaTeX \[...\] to $$...$$
  let processed = text.replace(/\\\[([\s\S]*?)\\\]/g, '$$$1$$');
  
  // Convert LaTeX \(...\) to $...$
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, '$1');
  
  return processed;
}

async function renderMarkdownAsHtml(text: string): Promise<string> {
  const preprocessed = preprocessMathForPdf(text);
  
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(preprocessed);
  
  return String(result);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function openPrintPreview(title: string, html: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

// Determine theme based on stored preference or system preference
export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'; // SSR fallback
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  // auto - use system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getMillisecondsUntilNextThemeChange(reference = new Date()): number {
  const nextChange = new Date(reference);
  const hour = reference.getHours();

  if (hour < 6) {
    nextChange.setHours(6, 0, 0, 0);
  } else if (hour < 18) {
    nextChange.setHours(18, 0, 0, 0);
  } else {
    nextChange.setDate(nextChange.getDate() + 1);
    nextChange.setHours(6, 0, 0, 0);
  }

  return Math.max(nextChange.getTime() - reference.getTime(), 1000);
}

export function getThemeMode(): 'auto' | 'light' | 'dark' {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return 'auto';
}

export function setTheme(theme: 'auto' | 'light' | 'dark') {
  if (theme === 'auto') {
    localStorage.removeItem('theme');
  } else {
    localStorage.setItem('theme', theme);
  }
  // Update immediately
  document.documentElement.classList.toggle('dark', getTheme() === 'dark');
}


