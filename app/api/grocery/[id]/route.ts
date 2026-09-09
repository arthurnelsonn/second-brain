import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groceryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json() as Partial<{
    name: string;
    quantity: number | null;
    unit: string | null;
    category: string | null;
    store: string | null;
    is_checked: boolean;
  }>;

  const [row] = db
    .update(groceryItems)
    .set(body)
    .where(eq(groceryItems.id, Number(id)))
    .returning()
    .all();

  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  db.delete(groceryItems).where(eq(groceryItems.id, Number(id))).run();
  return new NextResponse(null, { status: 204 });
}
