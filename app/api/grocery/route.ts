import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groceryItems } from '@/lib/db/schema';
import { and, eq, lte, asc, sql } from 'drizzle-orm';

function processRecurring(): void {
  const now = new Date();
  const due = db
    .select()
    .from(groceryItems)
    .where(
      and(
        eq(groceryItems.is_recurring, true),
        lte(groceryItems.next_recur_at, now),
      ),
    )
    .all();

  for (const item of due) {
    // Insert a fresh unchecked copy
    db.insert(groceryItems).values({
      name:             item.name,
      quantity:         item.quantity,
      unit:             item.unit,
      category:         item.category,
      store:            item.store,
      is_checked:       false,
      is_recurring:     false, // the copy is not itself recurring
    }).run();

    // Advance next_recur_at by recur_every_days
    const days = item.recur_every_days ?? 7;
    const base = item.next_recur_at ?? now;
    const next = new Date(base.getTime() + days * 86_400_000);
    db.update(groceryItems)
      .set({ next_recur_at: next })
      .where(eq(groceryItems.id, item.id))
      .run();
  }
}

export async function GET() {
  processRecurring();

  // Unchecked first (is_checked ASC), then alphabetical by name
  const rows = db
    .select()
    .from(groceryItems)
    .orderBy(asc(groceryItems.is_checked), asc(groceryItems.name))
    .all();

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name: string;
    quantity?: number | null;
    unit?: string | null;
    category?: string | null;
    store?: string | null;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const [row] = db.insert(groceryItems).values({
    name:     body.name.trim(),
    quantity: body.quantity ?? null,
    unit:     body.unit?.trim() || null,
    category: body.category?.trim() || null,
    store:    body.store?.trim() || null,
  }).returning().all();

  return NextResponse.json(row, { status: 201 });
}
