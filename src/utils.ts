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

function buildPrintableDocument(title: string, body: string) {
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

export function buildPrintableHtml(title: string, chatId: string, updatedAt: string, messages: Array<{ role: string; content: string }>) {
  return buildPrintableDocument(
    title,
    buildPrintableChatSection(title, chatId, updatedAt, messages),
  );
}

export function buildAllChatsPrintableHtml(
  chatsWithMessages: Array<{ title: string; chatId: string; updatedAt: string; messages: Array<{ role: string; content: string }> }>,
) {
  const body = chatsWithMessages
    .map(({ title, chatId, updatedAt, messages }) => buildPrintableChatSection(title, chatId, updatedAt, messages))
    .join('<div style="height: 8px; page-break-after: always;"></div>');

  return buildPrintableDocument('All chats', body);
}

function renderMarkdownAsHtml(text: string) {
  const escaped = escapeHtml(text);
  const lines = escaped.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeLanguage = '';
  let listType: 'ul' | 'ol' | '' = '';
  let inTable = false;
  let tableHeaderRendered = false;

  const closeList = () => {
    if (listType === 'ul') {
      html += '</ul>';
      listType = '';
    } else if (listType === 'ol') {
      html += '</ol>';
      listType = '';
    }
  };

  const closeTable = () => {
    if (inTable) {
      html += '</tbody></table>';
      inTable = false;
      tableHeaderRendered = false;
    }
  };

  const formatInline = (line: string) =>
    line
      .replace(/\[(.+?)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/ {2,}\n/g, '<br />');

  const isTableDivider = (line: string) =>
    /^\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(line);

  const parseTableCells = (line: string) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => formatInline(cell.trim()));

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = trimmed.replace(/^```/, '').trim();
        closeList();
        closeTable();
        html += `<div class="code-shell">${codeLanguage ? `<div class="code-language">${codeLanguage}</div>` : ''}<pre><code>`;
      } else {
        inCodeBlock = false;
        codeLanguage = '';
        html += '</code></pre></div>';
      }
      continue;
    }

    if (inCodeBlock) {
      html += `${line}\n`;
      continue;
    }

    if (trimmed === '') {
      closeList();
      closeTable();
      continue;
    }

    if (/^---+$|^\*\*\*+$|^___+$/.test(trimmed)) {
      closeList();
      closeTable();
      html += '<hr />';
      continue;
    }

    if (trimmed.includes('|')) {
      const nextLine = lines[index + 1]?.trim() ?? '';
      if (!inTable && nextLine && isTableDivider(nextLine)) {
        closeList();
        const headerCells = parseTableCells(trimmed);
        html += `<table><thead><tr>${headerCells.map((cell) => `<th>${cell}</th>`).join('')}</tr></thead><tbody>`;
        inTable = true;
        tableHeaderRendered = true;
        continue;
      }

      if (inTable && !isTableDivider(trimmed)) {
        const rowCells = parseTableCells(trimmed);
        html += `<tr>${rowCells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`;
        continue;
      }

      if (inTable && isTableDivider(trimmed) && tableHeaderRendered) {
        continue;
      }
    } else {
      closeTable();
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      closeList();
      closeTable();
      html += `<h${heading[1].length}>${formatInline(heading[2])}</h${heading[1].length}>`;
      continue;
    }

    const blockquote = /^>\s+(.*)$/.exec(trimmed);
    if (blockquote) {
      closeList();
      closeTable();
      html += `<blockquote>${formatInline(blockquote[1])}</blockquote>`;
      continue;
    }

    const taskMatch = /^[-*+]\s+\[( |x|X)\]\s+(.*)$/.exec(trimmed);
    if (taskMatch) {
      if (listType !== 'ul') {
        closeList();
        closeTable();
        html += '<ul>';
        listType = 'ul';
      }
      const checked = taskMatch[1].toLowerCase() === 'x' ? ' checked' : '';
      html += `<li><input type="checkbox" disabled${checked} />${formatInline(taskMatch[2])}</li>`;
      continue;
    }

    const ulMatch = /^[-*+]\s+(.*)$/.exec(trimmed);
    if (ulMatch) {
      if (listType !== 'ul') {
        closeList();
        closeTable();
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
        closeTable();
        html += '<ol>';
        listType = 'ol';
      }
      html += `<li>${formatInline(olMatch[2])}</li>`;
      continue;
    }

    closeList();
    closeTable();
    html += `<p>${formatInline(trimmed)}</p>`;
  }

  closeList();
  closeTable();

  if (inCodeBlock) {
    html += '</code></pre></div>';
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


