import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emails } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const rows = db.select().from(emails).where(eq(emails.is_archived, false)).all();
  return NextResponse.json(rows);
}
