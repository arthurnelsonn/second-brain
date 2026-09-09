import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dailyNotes } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { todayString } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? todayString();
  const rows = db.select().from(dailyNotes).where(eq(dailyNotes.note_date, date)).all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { note_date: string; hour_block: number; content: string };
  const { note_date, hour_block, content } = body;

  const existing = db.select().from(dailyNotes)
    .where(and(eq(dailyNotes.note_date, note_date), eq(dailyNotes.hour_block, hour_block)))
    .get();

  if (existing) {
    if (content.trim() === '') {
      db.delete(dailyNotes).where(eq(dailyNotes.id, existing.id)).run();
      return NextResponse.json(null);
    }
    db.update(dailyNotes).set({ content }).where(eq(dailyNotes.id, existing.id)).run();
    return NextResponse.json({ ...existing, content });
  }

  if (content.trim() === '') return NextResponse.json(null);

  db.insert(dailyNotes).values({ note_date, hour_block, content }).run();
  const created = db.select().from(dailyNotes)
    .where(and(eq(dailyNotes.note_date, note_date), eq(dailyNotes.hour_block, hour_block)))
    .get();
  return NextResponse.json(created);
}
