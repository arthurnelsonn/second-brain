import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calendarEvents } from '@/lib/db/schema';
import { and, gte, lt } from 'drizzle-orm';
import { todayString } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date');

  if (date === 'today') {
    const start = new Date(todayString() + 'T00:00:00');
    const end   = new Date(todayString() + 'T23:59:59');
    const rows = db.select().from(calendarEvents)
      .where(and(gte(calendarEvents.start_at, start), lt(calendarEvents.start_at, end)))
      .all();
    return NextResponse.json(rows);
  }

  const rows = db.select().from(calendarEvents).all();
  return NextResponse.json(rows);
}
