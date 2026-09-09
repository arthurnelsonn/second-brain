import 'server-only';
import { db } from '@/lib/db';
import { promptTemplates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const SYSTEM_BASE =
  'You are a personal productivity assistant for a single user. ' +
  'Be concise, actionable, and direct. Never add unnecessary caveats or filler phrases. ' +
  'Respond in Markdown.';

// ─── Template definitions (seeded into DB on first run) ───────────────────────

export const DEFAULT_TEMPLATES: Array<{
  name: string;
  system: string;
  user_prefix: string | null;
  model: string;
}> = [
  {
    name: 'brainstorm_organize',
    system: `${SYSTEM_BASE}\n\nYour task: Take the user's raw brain dump and return a clean, structured outline with headers and bullet points. Group related ideas. Surface the most important themes first.`,
    user_prefix: 'Organize the following brain dump into a structured outline:',
    model: 'gemini-2.5-pro',
  },
  {
    name: 'brainstorm_critique',
    system: `${SYSTEM_BASE}\n\nYour task: Play devil's advocate on the user's ideas. Identify weaknesses, blind spots, unstated assumptions, and risks. Be direct but constructive.`,
    user_prefix: 'Critique the following ideas:',
    model: 'gemini-2.5-pro',
  },
  {
    name: 'brainstorm_expand',
    system: `${SYSTEM_BASE}\n\nYour task: Expand on the user's ideas. Add missing angles, related concepts, and unexplored directions. Think laterally.`,
    user_prefix: 'Expand on the following ideas with additional angles and perspectives:',
    model: 'gemini-2.5-pro',
  },
  {
    name: 'morning_suggestions',
    system: `${SYSTEM_BASE}\n\nYour task: Review the user's day (events and primary focus) and return a short bulleted list of preparation steps, potential conflicts, or things they may have missed. Max 5 bullets.`,
    user_prefix: "Here is my day plan. Give me suggestions:",
    model: 'gemini-2.5-flash',
  },
  {
    name: 'email_summary',
    system: `${SYSTEM_BASE}\n\nYour task: Summarize the email in one concise paragraph. State who sent it, what they want or are communicating, and whether any action is required.`,
    user_prefix: 'Summarize this email:',
    model: 'gemini-2.0-flash',
  },
  {
    name: 'email_draft',
    system: `${SYSTEM_BASE}\n\nYour task: Write a professional, appropriately toned email reply based on the user's instruction. Output only the reply body — no subject line, no "Here is a draft:" preamble.`,
    user_prefix: null,
    model: 'gemini-2.5-pro',
  },
  {
    name: 'task_extract',
    system: `${SYSTEM_BASE}\n\nYour task: Extract the required action from this email. Return JSON only: { "title": string, "due_date": "YYYY-MM-DD or null", "notes": string }`,
    user_prefix: 'Extract the action item from this email:',
    model: 'gemini-2.5-flash',
  },
  {
    name: 'schedule_suggestions',
    system: `${SYSTEM_BASE}\n\nYour task: Given the user's calendar and unscheduled tasks, suggest which tasks to schedule in which free time slots. Return a prioritized list with brief reasoning for each suggestion.`,
    user_prefix: null,
    model: 'gemini-2.5-pro',
  },
  {
    name: 'note_qa',
    system: `${SYSTEM_BASE}\n\nYour task: Answer the user's question based solely on the note content provided. If the answer isn't in the note, say so clearly.`,
    user_prefix: null,
    model: 'gemini-2.0-flash',
  },
  {
    name: 'grocery_extract',
    system: `${SYSTEM_BASE}\n\nYour task: Extract all ingredients from the recipe. Return JSON only: an array of { "name": string, "quantity": number | null, "unit": string | null }`,
    user_prefix: 'Extract ingredients from this recipe:',
    model: 'gemini-2.0-flash',
  },
  {
    name: 'eod_summary',
    system: `${SYSTEM_BASE}\n\nYour task: Write a 3-5 sentence end-of-day summary based on the completed tasks and attended events. End with 1-2 concrete suggestions for tomorrow.`,
    user_prefix: null,
    model: 'gemini-2.0-flash',
  },
];

// ─── Seeder (called from migrate.ts) ─────────────────────────────────────────

export function seedPromptTemplates(): void {
  for (const t of DEFAULT_TEMPLATES) {
    const existing = db.select().from(promptTemplates).where(eq(promptTemplates.name, t.name)).get();
    if (!existing) {
      db.insert(promptTemplates).values(t).run();
    }
  }
}

// ─── Runtime helpers ──────────────────────────────────────────────────────────

// Seed on first import so API routes don't need to wait for layout render
seedPromptTemplates();

export function buildPrompt(
  templateName: string,
  variables: Record<string, string> = {},
): { system: string; userPrefix: string | null; model: string } {
  const row = db.select().from(promptTemplates).where(eq(promptTemplates.name, templateName)).get();
  if (!row) throw new Error(`Prompt template '${templateName}' not found`);

  function substitute(text: string | null): string | null {
    if (!text) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`);
  }

  return {
    system:     substitute(row.system) ?? row.system,
    userPrefix: substitute(row.user_prefix),
    model:      row.model ?? 'gemini-2.0-flash',
  };
}

export function assembleUserMessage(userPrefix: string | null, content: string): string {
  return userPrefix ? `${userPrefix}\n\n${content}` : content;
}
