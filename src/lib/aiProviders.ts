import { DEFAULT_GEMINI_MODEL, DEFAULT_GROQ_MODEL, DEFAULT_OPENROUTER_MODEL, getDefaultGroqModelIds, type GeminiModel as GeminiModelSelection, type GroqModel, type OpenRouterModel } from '@/lib/openRouterModels';

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

type GeminiModel = {
  name?: string;
  supportedGenerationMethods?: string[];
};

type GeminiModelsResponse = {
  models?: GeminiModel[];
};

type OpenAICompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

type GenerationMode = 'chat' | 'title';
export type ChatProviderSelection = 'auto' | 'google' | 'groq' | 'openrouter';

type GenerateTextOptions = {
  message: string;
  history?: ChatTurn[];
  mode?: GenerationMode;
  provider?: ChatProviderSelection;
  internetAccess?: boolean;
  geminiModel?: GeminiModelSelection;
  groqModel?: GroqModel;
  openRouterModel?: OpenRouterModel;
  personalization?: string;
};

type ProviderError = {
  provider: string;
  model: string;
  status: number;
  text: string;
};

type ProviderSuccess = {
  text: string;
  provider: string;
  model: string;
};

type ProviderAttempt = () => Promise<ProviderSuccess | { error: ProviderError } | null>;

type TavilySearchResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
  published_date?: string;
};

type TavilySearchResponse = {
  answer?: string;
  results?: TavilySearchResult[];
};

type ExaSearchResult = {
  title?: string;
  url?: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  score?: number;
};

type ExaSearchResponse = {
  results?: ExaSearchResult[];
  output?: {
    content?: unknown;
    grounding?: Array<{
      field: string;
      citations: Array<{ url: string; title?: string }>;
      confidence: string;
    }>;
  };
};

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GOOGLE_MODEL_FALLBACK = 'gemini-flash-latest';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TAVILY_API_URL = 'https://api.tavily.com/search';
const EXA_API_URL = 'https://api.exa.ai/search';
const GROQ_TITLE_MODEL_IDS = [
  'llama-3.1-8b-instant',
  'openai/gpt-oss-20b',
] as const;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_HISTORY_TURNS = 8;
const DEFAULT_MAX_CONTEXT_CHARS = 2048;
const TIME_SENSITIVE_PATTERN =
  /\b(current|latest|recent|today|tonight|tomorrow|yesterday|now|live|breaking|news|headline|weather|forecast|temperature|rain|snow|storm|sports|score|match|game|fixture|standing|rankings|stock|market|price|crypto|bitcoin|ethereum|election|result|traffic|trend|trending|headlines|update|updates|just in|developing|coverage|alert|bulletin|humidity|heatwave|cyclone|flood|earthquake|scores|standings|table|points table|tournament|league|stocks|markets|prices|nifty|sensex|dow|nasdaq|elections|results|delay|delays|status|outage|outages|downtime|disruption|outlook|ongoing|crisis|emergency|disaster|conflict|war|attack|strike|protest|riot|violence|viral|next|upcoming|expected|release|released|launch|announced|appointed)\b/i;
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

  return TIME_SENSITIVE_PATTERN.test(combined) || DATE_PATTERN.test(combined);
}

async function searchExa(query: string): Promise<string | null> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(EXA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        query,
        type: 'auto',
        numResults: 5,
        contents: {
          highlights: {
            maxCharacters: 4000,
          },
        },
      }),
    });

    if (!response.ok) {
      console.error('Exa API error:', response.status, await response.text());
      return null;
    }

    const data = (await response.json()) as ExaSearchResponse;
    const results = data.results;

    if (!results || results.length === 0) return null;

    const context = results
      .map((result) => {
        const source = result.title || result.url || 'Unknown source';
        const content = result.highlights?.join(' ') || result.text || '';
        return `[${source}] ${content}`;
      })
      .join('\n\n');

    return context;
  } catch (error) {
    console.error('Exa search error:', error);
    return null;
  }
}

async function searchTavily(query: string): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
        include_domains: [],
        exclude_domains: [],
      }),
    });

    if (!response.ok) {
      console.error('Tavily API error:', response.status, await response.text());
      return null;
    }

    const data = (await response.json()) as TavilySearchResponse;
    const results = data.results;

    if (!results || results.length === 0) return null;

    const context = results
      .map((result) => {
        const source = result.title || result.url || 'Unknown source';
        const content = result.content || '';
        return `[${source}] ${content}`;
      })
      .join('\n\n');

    return context;
  } catch (error) {
    console.error('Tavily search error:', error);
    return null;
  }
}

function getSystemInstruction(mode: GenerationMode, personalization = '') {
  if (mode === 'title') {
    return 'Create a short chat title from the user prompt. Return only the title. Use 2 to 6 words. No quotes. No punctuation unless essential. Capitalize the first letter.';
  }

  const baseInstruction = 'Be accurate, clear, and friendly. Use plain language. Keep answers concise but complete. Always finish fully - never cut off. Add warmth when helpful. Use formatting only when it improves clarity. Use live web or code tools only for current/external information.';
  return personalization ? `${baseInstruction}\n\nUser personalization rules and guidelines:\n${personalization}` : baseInstruction;
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
    maxOutputTokens: 512,
    temperature: 0.4,
    topP: 0.8,
  };
}

function buildGeminiGenerationConfig(modelId: string, mode: GenerationMode) {
  const limits = getProviderLimits(mode);
  const generationConfig: Record<string, unknown> = {
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

function getGeminiModelVersion(modelId: string) {
  const match = /^gemini-(\d+)(?:\.(\d+))?-flash(-lite)?$/.exec(modelId);
  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2] ?? 0),
    isLite: Boolean(match[3]),
  };
}

async function getGoogleModelIds(apiKey: string, geminiModel?: GeminiModelSelection) {
  if (geminiModel && geminiModel !== DEFAULT_GEMINI_MODEL) {
    return [geminiModel];
  }

  try {
    const response = await fetch(`${GEMINI_API_BASE_URL}?pageSize=1000`, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });
    if (!response.ok) return [GOOGLE_MODEL_FALLBACK];

    const data = (await response.json()) as GeminiModelsResponse;
    const currentModels = (data.models ?? [])
      .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => model.name?.replace(/^models\//, '') ?? '')
      .filter((modelId) => getGeminiModelVersion(modelId) !== null)
      .sort((first, second) => {
        const firstVersion = getGeminiModelVersion(first)!;
        const secondVersion = getGeminiModelVersion(second)!;

        return secondVersion.major - firstVersion.major
          || secondVersion.minor - firstVersion.minor
          || Number(firstVersion.isLite) - Number(secondVersion.isLite);
      });

    return currentModels.length > 0
      ? currentModels.includes(GOOGLE_MODEL_FALLBACK)
        ? currentModels
        : [...currentModels, GOOGLE_MODEL_FALLBACK]
      : [GOOGLE_MODEL_FALLBACK];
  } catch {
    return [GOOGLE_MODEL_FALLBACK];
  }
}

function getGroqModelIds(mode: GenerationMode, groqModel?: GroqModel) {
  if (mode === 'title') return GROQ_TITLE_MODEL_IDS;
  if (groqModel && groqModel !== DEFAULT_GROQ_MODEL) return [groqModel];
  return getDefaultGroqModelIds();
}

function getMessageLimit(message: string) {
  if (message.length < 256) return 512;
  if (message.length < 1024) return 1024;
  return 1536;
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
      parts: [{ text: compactText(message, getMessageLimit(message)) }],
    },
  ];
}

function buildOpenAICompatibleMessages(message: string, history: ChatTurn[], mode: GenerationMode, personalization: string) {
  const cleanedHistory = history
    .filter((turn): turn is ChatTurn => Boolean(turn.role && turn.content.trim()))
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({
      role: turn.role,
      content: compactText(turn.content),
    }));

  return [
    { role: 'system', content: getSystemInstruction(mode, personalization) },
    ...cleanedHistory,
    { role: 'user', content: compactText(message, getMessageLimit(message)) },
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
  personalization: string,
  geminiModel?: GeminiModelSelection,
): Promise<ProviderSuccess | { error: ProviderError } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  let lastError: ProviderError | null = null;

  for (const model of await getGoogleModelIds(apiKey, geminiModel)) {
    try {
      const response = await fetch(`${GEMINI_API_BASE_URL}/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: getSystemInstruction(mode, personalization) }],
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
      const text = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? '')
        .join('')
        .trim();
      if (text) return { text, provider: 'google', model };

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
  personalization: string,
  groqModel?: GroqModel,
): Promise<ProviderSuccess | { error: ProviderError } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const limits = getProviderLimits(mode);
  let lastError: ProviderError | null = null;

  for (const model of getGroqModelIds(mode, groqModel)) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: buildOpenAICompatibleMessages(message, history, mode, personalization),
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
      if (text) return { text, provider: 'groq', model };

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
  personalization: string,
  openRouterModel = DEFAULT_OPENROUTER_MODEL,
): Promise<ProviderSuccess | { error: ProviderError } | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const limits = getProviderLimits(mode);
  let lastError: ProviderError | null = null;

  for (const model of [openRouterModel]) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: buildOpenAICompatibleMessages(message, history, mode, personalization),
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
      if (text) return { text, provider: 'openrouter', model };

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
  provider = 'auto',
  internetAccess = false,
  geminiModel,
  groqModel,
  openRouterModel,
  personalization = '',
}: GenerateTextOptions): Promise<ProviderSuccess | { error: ProviderError }> {
  const shouldPreferLiveCapability = mode === 'chat' && provider === 'auto' && prefersLiveCapability(message, history);
  const shouldUseInternetAccess = mode === 'chat' && provider !== 'auto' && internetAccess;
  let augmentedMessage = message;

  if (shouldPreferLiveCapability || shouldUseInternetAccess) {
    const searchContext = (await searchTavily(message)) || (await searchExa(message));
    if (searchContext) {
      augmentedMessage = `Context from web search:\n${searchContext}\n\nUser question: ${message}`;
    }
  }

  const providerAttempts: ProviderAttempt[] = mode === 'title'
    ? [
        () => tryOpenRouterProvider(augmentedMessage, history, mode, personalization, openRouterModel),
        () => tryGroqProvider(augmentedMessage, history, mode, personalization, groqModel),
        () => tryGoogleProvider(augmentedMessage, history, mode, personalization, geminiModel),
      ]
    : provider === 'google'
      ? [() => tryGoogleProvider(augmentedMessage, history, mode, personalization, geminiModel)]
      : provider === 'groq'
        ? [() => tryGroqProvider(augmentedMessage, history, mode, personalization, groqModel)]
        : provider === 'openrouter'
          ? [() => tryOpenRouterProvider(augmentedMessage, history, mode, personalization, openRouterModel)]
          : shouldPreferLiveCapability
            ? [
                () => tryGroqProvider(augmentedMessage, history, mode, personalization, groqModel),
                () => tryOpenRouterProvider(augmentedMessage, history, mode, personalization, openRouterModel),
                () => tryGoogleProvider(augmentedMessage, history, mode, personalization, geminiModel),
              ]
            : [
                () => tryGoogleProvider(augmentedMessage, history, mode, personalization, geminiModel),
                () => tryGroqProvider(augmentedMessage, history, mode, personalization, groqModel),
                () => tryOpenRouterProvider(augmentedMessage, history, mode, personalization, openRouterModel),
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
        status: 503,
        text: provider === 'auto'
          ? 'No configured AI provider is available. Add GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY to .env.local and restart the dev server.'
          : `${provider} is not configured. Add its API key to .env.local and restart the dev server.`,
      },
    }
  );
}
