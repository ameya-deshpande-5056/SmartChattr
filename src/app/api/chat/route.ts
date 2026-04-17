import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ reply: 'Please provide a message.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API key loaded:', !!apiKey);

    if (!apiKey) {
      return NextResponse.json({ reply: 'API key not configured. Check .env.local' }, { status: 500 });
    }

    const modelUrls = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2-flash:generateContent?key=${apiKey}`,
    ];

    const clientErrors: Array<{status: number; text: string}> = [];
    let lastRetryError: {status: number; text: string} | null = null;

    for (const url of modelUrls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: message,
              }],
            }],
          }),
        });

        const bodyText = await response.text();

        if (response.ok) {
          const data = JSON.parse(bodyText);
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
          return NextResponse.json({ reply });
        }

        if (response.status === 429) {
          lastRetryError = { status: response.status, text: bodyText };
          console.warn('Gemini rate limit hit, trying next endpoint:', url);
          continue;
        }

        if (response.status >= 400 && response.status < 500) {
          clientErrors.push({ status: response.status, text: bodyText });
          continue;
        }

        lastRetryError = { status: response.status, text: bodyText };
      } catch (fetchError) {
        console.error('Gemini fetch failed for url:', url, fetchError);
        lastRetryError = { status: 500, text: String(fetchError) };
      }
    }

    if (clientErrors.length > 0 && lastRetryError?.status !== 429) {
      const { status, text } = clientErrors[0];
      console.error('Gemini client errors from all models:', clientErrors);
      return NextResponse.json({ reply: `Gemini client error ${status}: ${text.slice(0, 200)}` }, { status });
    }

    if (lastRetryError?.status === 429) {
      return NextResponse.json({ reply: 'Rate limit exceeded. Please wait a moment and try again.' }, { status: 429 });
    }

    throw new Error(`Gemini API error: ${lastRetryError?.status ?? 500} - ${lastRetryError?.text ?? 'Unknown error'}`);
  } catch (error) {
    console.error('Chat API error:', error);
    if (error instanceof Error && error.message.includes('429')) {
      return NextResponse.json({ reply: 'Rate limit exceeded. Please wait a moment and try again.' }, { status: 429 });
    }
    return NextResponse.json({ reply: 'Sorry, something went wrong. Please try again.' }, { status: 500 });
  }
}

