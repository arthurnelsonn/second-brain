import { NextRequest, NextResponse } from 'next/server';
import { db, sqlite } from '@/lib/db';
import { notes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const row = db.select().from(notes).where(eq(notes.id, Number(id))).get();
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json() as Partial<{ title: string; content: string; is_pinned: boolean }>;
  const now = Math.floor(Date.now() / 1000);
  const [row] = db.update(notes)
    .set({ ...body, updated_at: new Date(now * 1000) })
    .where(eq(notes.id, Number(id)))
    .returning().all();
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  // Soft-delete: set a deleted_at marker via raw SQL since schema doesn't have the column yet
  // We physically delete for now — soft-delete column added in migration
  sqlite.prepare('UPDATE notes SET updated_at = unixepoch() WHERE id = ?').run(Number(id));
  db.delete(notes).where(eq(notes.id, Number(id))).run();
  return new NextResponse(null, { status: 204 });
}
