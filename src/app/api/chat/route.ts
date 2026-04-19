import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/aiProviders';
import type { ChatTurn } from '@/lib/aiProviders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body?.history) ? (body.history as ChatTurn[]) : [];

    if (!message) {
      return NextResponse.json({ reply: 'Please provide a message.' }, { status: 400 });
    }

    const result = await generateText({
      message,
      history,
      mode: 'chat',
    });

    if ('text' in result) {
      return NextResponse.json({ reply: result.text });
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
