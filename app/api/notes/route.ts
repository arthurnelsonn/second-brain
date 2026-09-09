import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { eq, isNull } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get('projectId');
  const all = req.nextUrl.searchParams.get('all');
  const rows = all
    ? db.select().from(notes).all()
    : projectId
      ? db.select().from(notes).where(eq(notes.project_id, Number(projectId))).all()
      : db.select().from(notes).where(isNull(notes.project_id)).all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { title?: string; project_id?: number; content?: string };
  const [row] = db.insert(notes).values({
    title: body.title?.trim() || 'Untitled',
    project_id: body.project_id ?? null,
    content: body.content ?? null,
  }).returning().all();
  return NextResponse.json(row, { status: 201 });
}
