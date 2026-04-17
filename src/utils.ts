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
      <div style="margin-bottom: 16px;">
        <strong>${message.role.toUpperCase()}</strong>
        <p style="white-space: pre-wrap; margin: 8px 0 0 0;">${escapeHtml(message.content)}</p>
      </div>
    `).join('');
  return `
    <section style="margin-bottom: 40px;">
      <h1 style="font-size: 24px; margin-bottom: 8px;">${escapeHtml(title)}</h1>
      <p style="margin: 0 0 16px 0; color: #6b7280;">Chat id: ${escapeHtml(chatId)} · Updated: ${escapeHtml(updatedAt)}</p>
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
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111827; background: #ffffff; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          p { margin: 0; }
          section { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        ${buildPrintableChatSection(title, chatId, updatedAt, messages)}
      </body>
    </html>
  `;
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
  const now = new Date();
  const hour = now.getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}


