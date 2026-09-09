import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brainDumps } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    id?: number;
    content: string;
    mode?: string;
    ai_response?: string;
    is_quick_capture?: boolean;
    saved_note_id?: number;
  };

  if (body.id) {
    const [row] = db.update(brainDumps)
      .set({
        content: body.content,
        mode: body.mode ?? null,
        ai_response: body.ai_response ?? null,
        ...(body.saved_note_id !== undefined ? { saved_note_id: body.saved_note_id } : {}),
      })
      .where(eq(brainDumps.id, body.id))
      .returning().all();
    return NextResponse.json(row);
  }

  const [row] = db.insert(brainDumps).values({
    content: body.content ?? '',
    mode: body.mode ?? null,
    ai_response: body.ai_response ?? null,
    is_quick_capture: body.is_quick_capture ?? false,
  }).returning().all();

  return NextResponse.json(row, { status: 201 });
}
