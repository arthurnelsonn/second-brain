import 'server-only';
import { NextRequest } from 'next/server';
import { checkRateLimit, incrementCallCount } from '@/lib/ai/rateLimit';
import { buildPrompt } from '@/lib/ai/prompts';
import { streamGemini, createStreamResponse } from '@/lib/ai/stream';

interface NoteQaPayload {
  noteContent: string;
  question: string;
}

export async function POST(req: NextRequest) {
  try {
    checkRateLimit();
    const { noteContent, question } = await req.json() as NoteQaPayload;
    const { system } = buildPrompt('note_qa');
    const prompt = `Note content:\n${noteContent}\n\nQuestion: ${question}`;
    incrementCallCount();
    return createStreamResponse(streamGemini(prompt, 'flash', system));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
