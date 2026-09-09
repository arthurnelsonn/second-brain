import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { and, gte, lt, isNull, isNotNull } from 'drizzle-orm';
import { todayString } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const due       = req.nextUrl.searchParams.get('due');
  const scheduled = req.nextUrl.searchParams.get('scheduled');
  const completed = req.nextUrl.searchParams.get('completed');

  const start = new Date(todayString() + 'T00:00:00');
  const end   = new Date(todayString() + 'T23:59:59');

  if (due === 'today') {
    const rows = db.select().from(tasks)
      .where(and(gte(tasks.due_at, start), lt(tasks.due_at, end), isNull(tasks.completed_at)))
      .all();
    return NextResponse.json(rows);
  }

  if (scheduled === 'today') {
    const rows = db.select().from(tasks)
      .where(and(gte(tasks.scheduled_start, start), lt(tasks.scheduled_start, end), isNotNull(tasks.scheduled_start)))
      .all();
    return NextResponse.json(rows);
  }

  if (completed === 'today') {
    const rows = db.select().from(tasks)
      .where(and(gte(tasks.completed_at, start), lt(tasks.completed_at, end), isNotNull(tasks.completed_at)))
      .all();
    return NextResponse.json(rows);
  }

  const rows = db.select().from(tasks).all();
  return NextResponse.json(rows);
}
