import { db } from '@/lib/db';
import { promptTemplates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getPrompt(name: string): Promise<{ system: string; userPrefix: string | null; model: string }> {
  const row = await db.select().from(promptTemplates).where(eq(promptTemplates.name, name)).get();
  if (!row) throw new Error(`Prompt template '${name}' not found`);
  return { system: row.system, userPrefix: row.user_prefix ?? null, model: row.model ?? 'gemini-2.0-flash' };
}

export function buildUserMessage(userPrefix: string | null, content: string): string {
  return userPrefix ? `${userPrefix}\n\n${content}` : content;
}
