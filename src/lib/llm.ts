export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export async function callLLM(prompt: string, history: ChatTurn[] = []): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: prompt, history }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status}`);
  }

  const data = await response.json();
  return data.reply || '';
}

export async function generateChatTitle(prompt: string): Promise<string> {
  const response = await fetch('/api/chat/title', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Chat title API error: ${response.status}`);
  }

  const data = await response.json();
  return data.title || 'New Chat';
}

