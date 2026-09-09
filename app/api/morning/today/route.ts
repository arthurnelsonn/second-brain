import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { morningPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { todayString } from '@/lib/utils';

export async function GET() {
  const plan = db.select().from(morningPlans).where(eq(morningPlans.plan_date, todayString())).get();
  return NextResponse.json(plan ?? null);
}
