import { NextRequest, NextResponse } from 'next/server';
import { fallbackTitleFromPrompt, generateText } from '@/lib/aiProviders';

function sanitizeTitle(rawTitle: string) {
  const cleaned = rawTitle
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '')
    .trim();

  if (!cleaned) return 'New Chat';
  return cleaned.slice(0, 48);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return NextResponse.json({ title: 'New Chat' });
    }

    const result = await generateText({
      message: prompt,
      mode: 'title',
    });

    if ('text' in result) {
      return NextResponse.json({ title: sanitizeTitle(result.text) });
    }

    return NextResponse.json({ title: fallbackTitleFromPrompt(prompt) });
  } catch (error) {
    console.error('Chat title API error:', error);
    return NextResponse.json({ title: 'New Chat' });
  }
}
