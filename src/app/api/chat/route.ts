import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/aiProviders';
import type { ChatProviderSelection, ChatTurn } from '@/lib/aiProviders';
import { MAX_AI_PERSONALIZATION_LENGTH } from '@/utils';
import { isGeminiModel, isGroqModel, isOpenRouterModel } from '@/lib/openRouterModels';

const CHAT_PROVIDERS: ChatProviderSelection[] = ['auto', 'google', 'groq', 'openrouter'];

function parseProvider(value: unknown): ChatProviderSelection {
  return typeof value === 'string' && CHAT_PROVIDERS.includes(value as ChatProviderSelection)
    ? value as ChatProviderSelection
    : 'auto';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body?.history) ? (body.history as ChatTurn[]) : [];
    const provider = parseProvider(body?.provider);
    const internetAccess = provider !== 'auto' && body?.internetAccess === true;
    const geminiModel = provider === 'google' && isGeminiModel(body?.geminiModel)
      ? body.geminiModel
      : undefined;
    const groqModel = provider === 'groq' && isGroqModel(body?.groqModel)
      ? body.groqModel
      : undefined;
    const openRouterModel = provider === 'openrouter' && isOpenRouterModel(body?.openRouterModel)
      ? body.openRouterModel
      : undefined;
    const personalization = typeof body?.personalization === 'string' ? body.personalization.trim().slice(0, MAX_AI_PERSONALIZATION_LENGTH) : '';

    if (!message) {
      return NextResponse.json({ reply: 'Please provide a message.' }, { status: 400 });
    }

    const result = await generateText({
      message,
      history,
      mode: 'chat',
      provider,
      internetAccess,
      geminiModel,
      groqModel,
      openRouterModel,
      personalization,
    });

    if ('text' in result) {
      return NextResponse.json({
        reply: result.text,
        provider: result.provider,
        model: result.model,
      });
    }

    if (result.error.status === 429) {
      return NextResponse.json({ reply: 'Rate limit exceeded. Please wait a moment and try again.' }, { status: 429 });
    }

    const status = result.error.status >= 400 && result.error.status < 600 ? result.error.status : 500;
    return NextResponse.json(
      { reply: `${result.error.provider} ${result.error.model} error: ${result.error.text.slice(0, 200)}` },
      { status },
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ reply: 'Sorry, something went wrong. Please try again.' }, { status: 500 });
  }
}
