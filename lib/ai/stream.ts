import 'server-only';
import { getGeminiPro, getGeminiFlash } from './gemini';

export async function* streamGemini(
  prompt: string,
  model: 'pro' | 'flash',
  systemInstruction?: string,
): AsyncGenerator<string> {
  const gemini = model === 'pro' ? getGeminiPro() : getGeminiFlash();

  const request = systemInstruction
    ? { contents: [{ role: 'user' as const, parts: [{ text: prompt }] }], systemInstruction }
    : prompt;

  const result = await gemini.generateContentStream(request);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

const encoder = new TextEncoder();

export function createStreamResponse(generator: AsyncGenerator<string>): Response {
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await generator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(encoder.encode(value));
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
