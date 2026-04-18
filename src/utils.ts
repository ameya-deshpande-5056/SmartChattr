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

export function buildChatText(title: string, chatId: string, updatedAt: string, messages: Array<{ role: string; content: string }>) {
  const header = `Chat title: ${title}\nChat id: ${chatId}\nUpdated: ${updatedAt}\n\n`;
  const body = messages
    .map((message, index) => `${index + 1}. ${message.role.toUpperCase()}: ${message.content}`)
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

export function buildPrintableChatSection(title: string, chatId: string, updatedAt: string, messages: Array<{ role: string; content: string }>) {
  const messageNodes = messages.map((message) => `
      <div class="message ${message.role}">
        <div class="message-badge">${message.role.toUpperCase()}</div>
        <div class="message-body">${renderMarkdownAsHtml(message.content)}</div>
      </div>
    `).join('');

  return `
    <section class="chat-section">
      <div class="chat-header">
        <h1>${escapeHtml(title)}</h1>
        <p class="meta">Chat id: ${escapeHtml(chatId)} · Updated: ${escapeHtml(updatedAt)}</p>
      </div>
      ${messageNodes}
    </section>
  `;
}

export function buildPrintableHtml(title: string, chatId: string, updatedAt: string, messages: Array<{ role: string; content: string }>) {
  return `
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
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
          .message-body pre {
            margin: 0 0 16px;
            padding: 16px;
            background: #111827;
            color: #f8fafc;
            border-radius: 18px;
            overflow: auto;
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
        ${buildPrintableChatSection(title, chatId, updatedAt, messages)}
      </body>
    </html>
  `;
}

function renderMarkdownAsHtml(text: string) {
  const escaped = escapeHtml(text);
  const lines = escaped.split('\n');
  let html = '';
  let inCodeBlock = false;
  let listType: 'ul' | 'ol' | '' = '';

  const closeList = () => {
    if (listType === 'ul') {
      html += '</ul>';
      listType = '';
    } else if (listType === 'ol') {
      html += '</ol>';
      listType = '';
    }
  };

  const formatInline = (line: string) =>
    line
      .replace(/\[(.+?)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>');

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        closeList();
        html += '<pre><code>';
      } else {
        inCodeBlock = false;
        html += '</code></pre>';
      }
      continue;
    }

    if (inCodeBlock) {
      html += `${line}\n`;
      continue;
    }

    if (trimmed === '') {
      closeList();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      closeList();
      html += `<h${heading[1].length}>${formatInline(heading[2])}</h${heading[1].length}>`;
      continue;
    }

    const blockquote = /^>\s+(.*)$/.exec(trimmed);
    if (blockquote) {
      closeList();
      html += `<blockquote>${formatInline(blockquote[1])}</blockquote>`;
      continue;
    }

    const ulMatch = /^[-*+]\s+(.*)$/.exec(trimmed);
    if (ulMatch) {
      if (listType !== 'ul') {
        closeList();
        html += '<ul>';
        listType = 'ul';
      }
      html += `<li>${formatInline(ulMatch[1])}</li>`;
      continue;
    }

    const olMatch = /^(\d+)\.\s+(.*)$/.exec(trimmed);
    if (olMatch) {
      if (listType !== 'ol') {
        closeList();
        html += '<ol>';
        listType = 'ol';
      }
      html += `<li>${formatInline(olMatch[2])}</li>`;
      continue;
    }

    closeList();
    html += `<p>${formatInline(trimmed)}</p>`;
  }

  closeList();

  if (inCodeBlock) {
    html += '</code></pre>';
  }

  return html;
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

// Determine theme based on current time (light 6 AM - 6 PM, dark otherwise)
export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'; // SSR fallback
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  // auto
  const now = new Date();
  const hour = now.getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
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


