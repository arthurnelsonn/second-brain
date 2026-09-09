import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, incrementCallCount } from '@/lib/ai/rateLimit';
import { buildPrompt, assembleUserMessage } from '@/lib/ai/prompts';
import { getGeminiFlash } from '@/lib/ai/gemini';

interface MorningPayload {
  primary_focus: string;
  events: Array<{ title: string; start_at: string }>;
  tasks:  Array<{ title: string; priority: number }>;
}

export async function POST(req: NextRequest) {
  try {
    checkRateLimit();

    const body = await req.json() as MorningPayload;
    const { primary_focus, events = [], tasks = [] } = body;

    const contextLines: string[] = [
      `Primary focus: ${primary_focus || '(not set)'}`,
      '',
      `Today's events (${events.length}):`,
      ...events.map(e => `  - ${e.title} at ${e.start_at}`),
      '',
      `Tasks due today (${tasks.length}):`,
      ...tasks.map(t => `  - [P${t.priority}] ${t.title}`),
    ];

    const { system, userPrefix } = buildPrompt('morning_suggestions');
    const prompt = assembleUserMessage(userPrefix, contextLines.join('\n'));

    incrementCallCount();

    const model = getGeminiFlash();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: system,
    });

    const text = result.response.text();
    return NextResponse.json({ suggestions: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
return NextResponse.json({ error: message }, { status: 500 });
  }
}
