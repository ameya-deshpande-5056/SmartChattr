export type ChatTurn = {
  role: 'user' | 'assistant';
  content: string;
};

type GeminiCandidateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type OpenAICompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

type GenerationMode = 'chat' | 'title';

type GenerateTextOptions = {
  message: string;
  history?: ChatTurn[];
  mode?: GenerationMode;
};

type ProviderError = {
  provider: string;
  model: string;
  status: number;
  text: string;
};

type ProviderAttempt = () => Promise<{ text: string } | { error: ProviderError } | null>;

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GOOGLE_CHAT_MODEL_IDS = [
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
] as const;
const GOOGLE_TITLE_MODEL_IDS = [
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-flash-latest',
] as const;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_CHAT_MODEL_IDS = [
  'groq/compound',
  'groq/compound-mini',
  'openai/gpt-oss-20b',
  'llama-3.1-8b-instant',
] as const;
const GROQ_TITLE_MODEL_IDS = [
  'llama-3.1-8b-instant',
  'openai/gpt-oss-20b',
] as const;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL_IDS = [
  'openrouter/free',
] as const;
const MAX_HISTORY_TURNS = 7;
const DEFAULT_MAX_CONTEXT_CHARS = 480;
const LIVE_INFO_PATTERN =
  /\b(current|latest|recent|today|tonight|tomorrow|yesterday|now|live|breaking|news|headline|weather|forecast|temperature|rain|snow|storm|sports|score|match|game|fixture|standing|rankings|stock|market|price|crypto|bitcoin|ethereum|time|date|day|week|month|year|election|result|traffic|prediction|predict|odds|trend|trending)\b/i;
const DATE_PATTERN =
  /\b(20\d{2}|19\d{2}|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;

function compactText(text: string, maxChars = DEFAULT_MAX_CONTEXT_CHARS) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars - 3)}...`;
}

function prefersLiveCapability(message: string, history: ChatTurn[]) {
  const recentUserContext = history
    .filter((turn) => turn.role === 'user')
    .slice(-2)
    .map((turn) => turn.content)
    .join(' ');
  const combined = `${recentUserContext} ${message}`.trim();

  return LIVE_INFO_PATTERN.test(combined) || DATE_PATTERN.test(combined);
}

function getSystemInstruction(mode: GenerationMode) {
  if (mode === 'title') {
    return 'Create a short chat title from the user prompt. Return only the title. Use 2 to 6 words. No quotes. No punctuation unless essential. Capitalize the first letter.';
  }

  return 'Be accurate, clear, and friendly. Write in plain, natural language for everyday users. Keep answers reasonably concise, but do not sound robotic or overly compressed. Add a little warmth when it helps. Use plain text unless formatting clearly improves clarity. Use live web or code tools only when current or external information is genuinely needed.';
}

function getProviderLimits(mode: GenerationMode) {
  if (mode === 'title') {
    return {
      maxOutputTokens: 16,
      temperature: 0.2,
      topP: 0.7,
    };
  }

  return {
    maxOutputTokens: 480,
    temperature: 0.5,
    topP: 0.8,
  };
}

function buildGeminiGenerationConfig(modelId: string, mode: GenerationMode) {
  const limits = getProviderLimits(mode);
  const generationConfig: Record<string, unknown> = {
    temperature: limits.temperature,
    topP: limits.topP,
    maxOutputTokens: limits.maxOutputTokens,
  };

  if (modelId.startsWith('gemini-3')) {
    generationConfig.thinkingConfig = {
      thinkingLevel: 'minimal',
    };
  } else if (modelId.startsWith('gemini-2.5')) {
    generationConfig.thinkingConfig = {
      thinkingBudget: 0,
    };
  }

  return generationConfig;
}

function getGoogleModelIds(mode: GenerationMode) {
  return mode === 'title' ? GOOGLE_TITLE_MODEL_IDS : GOOGLE_CHAT_MODEL_IDS;
}

function getGroqModelIds(mode: GenerationMode) {
  return mode === 'title' ? GROQ_TITLE_MODEL_IDS : GROQ_CHAT_MODEL_IDS;
}

function buildGeminiContents(message: string, history: ChatTurn[]) {
  const cleanedHistory = history
    .filter((turn): turn is ChatTurn => Boolean(turn.role && turn.content.trim()))
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: compactText(turn.content) }],
    }));

  return [
    ...cleanedHistory,
    {
      role: 'user',
      parts: [{ text: compactText(message, 500) }],
    },
  ];
}

function buildOpenAICompatibleMessages(message: string, history: ChatTurn[], mode: GenerationMode) {
  const cleanedHistory = history
    .filter((turn): turn is ChatTurn => Boolean(turn.role && turn.content.trim()))
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({
      role: turn.role,
      content: compactText(turn.content),
    }));

  return [
    { role: 'system', content: getSystemInstruction(mode) },
    ...cleanedHistory,
    { role: 'user', content: compactText(message, 500) },
  ];
}

function extractOpenAICompatibleText(data: OpenAICompatibleResponse) {
  const content = data.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (part.type === 'text' ? part.text ?? '' : ''))
      .join('')
      .trim();
  }

  return '';
}

async function tryGoogleProvider(
  message: string,
  history: ChatTurn[],
  mode: GenerationMode,
): Promise<{ text: string } | { error: ProviderError } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  let lastError: ProviderError | null = null;

  for (const model of getGoogleModelIds(mode)) {
    try {
      const response = await fetch(`${GEMINI_API_BASE_URL}/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: getSystemInstruction(mode) }],
          },
          contents: buildGeminiContents(message, history),
          generationConfig: buildGeminiGenerationConfig(model, mode),
        }),
      });

      const bodyText = await response.text();
      if (!response.ok) {
        lastError = { provider: 'google', model, status: response.status, text: bodyText };
        if (response.status === 429 || response.status >= 500) continue;
        continue;
      }

      const data = JSON.parse(bodyText) as GeminiCandidateResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return { text };

      lastError = { provider: 'google', model, status: 502, text: 'Empty response' };
    } catch (error) {
      lastError = { provider: 'google', model, status: 500, text: String(error) };
    }
  }

  return lastError ? { error: lastError } : null;
}

async function tryGroqProvider(
  message: string,
  history: ChatTurn[],
  mode: GenerationMode,
): Promise<{ text: string } | { error: ProviderError } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const limits = getProviderLimits(mode);
  let lastError: ProviderError | null = null;

  for (const model of getGroqModelIds(mode)) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: buildOpenAICompatibleMessages(message, history, mode),
          temperature: limits.temperature,
          top_p: limits.topP,
          max_tokens: limits.maxOutputTokens,
        }),
      });

      const bodyText = await response.text();
      if (!response.ok) {
        lastError = { provider: 'groq', model, status: response.status, text: bodyText };
        if (response.status === 429 || response.status >= 500) continue;
        continue;
      }

      const data = JSON.parse(bodyText) as OpenAICompatibleResponse;
      const text = extractOpenAICompatibleText(data);
      if (text) return { text };

      lastError = { provider: 'groq', model, status: 502, text: 'Empty response' };
    } catch (error) {
      lastError = { provider: 'groq', model, status: 500, text: String(error) };
    }
  }

  return lastError ? { error: lastError } : null;
}

async function tryOpenRouterProvider(
  message: string,
  history: ChatTurn[],
  mode: GenerationMode,
): Promise<{ text: string } | { error: ProviderError } | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const limits = getProviderLimits(mode);
  let lastError: ProviderError | null = null;

  for (const model of OPENROUTER_MODEL_IDS) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: buildOpenAICompatibleMessages(message, history, mode),
          temperature: limits.temperature,
          top_p: limits.topP,
          max_tokens: limits.maxOutputTokens,
        }),
      });

      const bodyText = await response.text();
      if (!response.ok) {
        lastError = { provider: 'openrouter', model, status: response.status, text: bodyText };
        if (response.status === 429 || response.status >= 500) continue;
        continue;
      }

      const data = JSON.parse(bodyText) as OpenAICompatibleResponse;
      const text = extractOpenAICompatibleText(data);
      if (text) return { text };

      lastError = { provider: 'openrouter', model, status: 502, text: 'Empty response' };
    } catch (error) {
      lastError = { provider: 'openrouter', model, status: 500, text: String(error) };
    }
  }

  return lastError ? { error: lastError } : null;
}

export function fallbackTitleFromPrompt(prompt: string) {
  const cleaned = compactText(prompt, 60).replace(/[.!?]+$/, '');
  const words = cleaned.split(' ').filter(Boolean).slice(0, 6);
  const title = words.join(' ').trim();

  if (!title) return 'New Chat';
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export async function generateText({
  message,
  history = [],
  mode = 'chat',
}: GenerateTextOptions): Promise<{ text: string } | { error: ProviderError }> {
  const shouldPreferLiveCapability = mode === 'chat' && prefersLiveCapability(message, history);
  const providerAttempts: ProviderAttempt[] = mode === 'title'
    ? [
        () => tryOpenRouterProvider(message, history, mode),
        () => tryGroqProvider(message, history, mode),
        () => tryGoogleProvider(message, history, mode),
      ]
    : shouldPreferLiveCapability
      ? [
          () => tryGroqProvider(message, history, mode),
          () => tryGoogleProvider(message, history, mode),
          () => tryOpenRouterProvider(message, history, mode),
        ]
      : [
          () => tryGoogleProvider(message, history, mode),
          () => tryGroqProvider(message, history, mode),
          () => tryOpenRouterProvider(message, history, mode),
        ];
  const errors: Array<{ error: ProviderError }> = [];

  for (const attempt of providerAttempts) {
    const result = await attempt();
    if (!result) continue;
    if ('text' in result) return result;
    errors.push(result);
  }

  const lastError = errors[errors.length - 1];

  return (
    lastError ?? {
      error: {
        provider: 'none',
        model: 'none',
        status: 500,
        text: 'No configured AI provider is available.',
      },
    }
  );
}
