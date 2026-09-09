import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, incrementCallCount } from '@/lib/ai/rateLimit';
import { buildPrompt, assembleUserMessage } from '@/lib/ai/prompts';
import { streamGemini, createStreamResponse } from '@/lib/ai/stream';

type Mode = 'organize' | 'critique' | 'expand';

const TEMPLATE: Record<Mode, string> = {
  organize: 'brainstorm_organize',
  critique: 'brainstorm_critique',
  expand:   'brainstorm_expand',
};

export async function POST(req: NextRequest) {
  try {
    checkRateLimit();

    const body = await req.json() as { content: string; mode: Mode };
    const { content, mode } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    if (!TEMPLATE[mode]) {
      return NextResponse.json({ error: 'mode must be organize | critique | expand' }, { status: 400 });
    }

    const { system, userPrefix } = buildPrompt(TEMPLATE[mode]);
    const prompt = assembleUserMessage(userPrefix, content);

    incrementCallCount();

    const generator = streamGemini(prompt, 'pro', system);
    return createStreamResponse(generator);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
