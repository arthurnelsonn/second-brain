import 'server-only';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const KEY_COUNT = 'ai_calls_today';
const KEY_DATE  = 'ai_calls_date';
const KEY_LIMIT = 'ai_daily_limit';
const DEFAULT_LIMIT = 100;

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getSetting(key: string): string | null {
  return db.select().from(settings).where(eq(settings.key, key)).get()?.value ?? null;
}

function setSetting(key: string, value: string): void {
  const existing = db.select().from(settings).where(eq(settings.key, key)).get();
  if (existing) {
    db.update(settings).set({ value }).where(eq(settings.key, key)).run();
  } else {
    db.insert(settings).values({ key, value }).run();
  }
}

export function checkRateLimit(): void {
  const today   = todayStr();
  const date    = getSetting(KEY_DATE);
  const count   = date === today ? Number(getSetting(KEY_COUNT) ?? '0') : 0;
  const limit   = Number(getSetting(KEY_LIMIT) ?? String(DEFAULT_LIMIT));

  if (count >= limit) {
    throw new Error(`Daily AI call limit reached (${limit}). Reset tomorrow or increase via settings.`);
  }
}

export function incrementCallCount(): void {
  const today = todayStr();
  const date  = getSetting(KEY_DATE);
  const count = date === today ? Number(getSetting(KEY_COUNT) ?? '0') : 0;

  setSetting(KEY_DATE,  today);
  setSetting(KEY_COUNT, String(count + 1));
}
