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

function looksLikeInstruction(text: string): boolean {
  const instructionPatterns = [
    /create a short chat title/i,
    /return only the title/i,
    /use \d+ to \d+ words/i,
    /no quotes/i,
    /no punctuation/i,
    /capitalize the first letter/i,
    /output a short chat title/i,
    /we need to output/i,
  ];
  return instructionPatterns.some(pattern => pattern.test(text));
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
      const sanitized = sanitizeTitle(result.text);
      if (!looksLikeInstruction(sanitized)) {
        return NextResponse.json({ title: sanitized });
      }
    }

    return NextResponse.json({ title: fallbackTitleFromPrompt(prompt) });
  } catch (error) {
    console.error('Chat title API error:', error);
    return NextResponse.json({ title: 'New Chat' });
  }
}
