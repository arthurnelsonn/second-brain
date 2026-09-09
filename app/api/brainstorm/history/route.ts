import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brainDumps } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  const rows = db.select().from(brainDumps)
    .where(eq(brainDumps.is_quick_capture, false))
    .orderBy(desc(brainDumps.created_at))
    .all();
  return NextResponse.json(rows);
}
