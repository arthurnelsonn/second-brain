import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groceryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE() {
  db.delete(groceryItems).where(eq(groceryItems.is_checked, true)).run();
  return new NextResponse(null, { status: 204 });
}
