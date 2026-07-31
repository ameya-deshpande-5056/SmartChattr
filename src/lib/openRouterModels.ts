export const DEFAULT_OPENROUTER_MODEL = 'openrouter/free';

export const OPENROUTER_FREE_MODEL_GROUPS = [
  {
    label: 'Automatic',
    models: [
      { id: DEFAULT_OPENROUTER_MODEL, label: 'Free auto-select' },
    ],
  },
  {
    label: 'General reasoning',
    models: [
      { id: 'openai/gpt-oss-120b:free', label: 'GPT-OSS 120B' },
    ],
  },
  {
    label: 'Coding',
    models: [
      { id: 'qwen/qwen3-coder:free', label: 'Qwen3 Coder' },
    ],
  },
  {
    label: 'Fast general use',
    models: [
      { id: 'deepseek/deepseek-v4-flash:free', label: 'DeepSeek V4 Flash' },
    ],
  },
  {
    label: 'Multimodal and long context',
    models: [
      { id: 'meta-llama/llama-4-scout:free', label: 'Llama 4 Scout' },
    ],
  },
] as const;

export type OpenRouterModel = typeof OPENROUTER_FREE_MODEL_GROUPS[number]['models'][number]['id'];

export function isOpenRouterModel(value: unknown): value is OpenRouterModel {
  return typeof value === 'string' && OPENROUTER_FREE_MODEL_GROUPS.some((group) =>
    group.models.some((model) => model.id === value),
  );
}

export const DEFAULT_GEMINI_MODEL = 'auto';

export const GEMINI_FREE_MODEL_GROUPS = [
  {
    label: 'Automatic',
    models: [
      { id: DEFAULT_GEMINI_MODEL, label: 'Latest available' },
    ],
  },
  {
    label: 'General reasoning',
    models: [
      { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    ],
  },
  {
    label: 'Fast and high volume',
    models: [
      { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite' },
      { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
    ],
  },
] as const;

export type GeminiModel = typeof GEMINI_FREE_MODEL_GROUPS[number]['models'][number]['id'];

export function isGeminiModel(value: unknown): value is GeminiModel {
  return typeof value === 'string' && GEMINI_FREE_MODEL_GROUPS.some((group) =>
    group.models.some((model) => model.id === value),
  );
}

export const DEFAULT_GROQ_MODEL = 'auto';

export const GROQ_FREE_MODEL_GROUPS = [
  {
    label: 'Automatic',
    models: [
      { id: DEFAULT_GROQ_MODEL, label: 'Best available fallback' },
    ],
  },
  {
    label: 'Agent tools',
    models: [
      { id: 'groq/compound', label: 'Compound' },
      { id: 'groq/compound-mini', label: 'Compound Mini' },
    ],
  },
  {
    label: 'Advanced reasoning',
    models: [
      { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B' },
      { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
    ],
  },
  {
    label: 'General conversation',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
    ],
  },
  {
    label: 'Coding and reasoning',
    models: [
      { id: 'qwen/qwen3.6-27b', label: 'Qwen3.6 27B' },
    ],
  },
] as const;

export type GroqModel = typeof GROQ_FREE_MODEL_GROUPS[number]['models'][number]['id'];

export function isGroqModel(value: unknown): value is GroqModel {
  return typeof value === 'string' && GROQ_FREE_MODEL_GROUPS.some((group) =>
    group.models.some((model) => model.id === value),
  );
}

export function getDefaultGroqModelIds(): string[] {
  const modelIds: string[] = [];

  for (const group of GROQ_FREE_MODEL_GROUPS) {
    for (const model of group.models) {
      if (model.id !== DEFAULT_GROQ_MODEL) {
        modelIds.push(model.id);
      }
    }
  }

  return modelIds;
}
