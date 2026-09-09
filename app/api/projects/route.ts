import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const rows = db.select().from(projects).where(eq(projects.is_archived, false)).all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { name: string; color?: string; icon?: string; description?: string };
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  const [row] = db.insert(projects).values({
    name: body.name.trim(),
    color: body.color ?? '#6366F1',
    icon: body.icon ?? null,
    description: body.description ?? null,
  }).returning().all();
  return NextResponse.json(row, { status: 201 });
}
