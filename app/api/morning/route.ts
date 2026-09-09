import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { morningPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { todayString } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<typeof morningPlans.$inferInsert>;
  const plan_date = body.plan_date ?? todayString();

  // Set completed_at when primary_focus is provided and not skipped
  const completed_at = (!body.skipped && body.primary_focus)
    ? new Date()
    : undefined;

  // End-of-day timestamp for skipped_until when skipping
  const skipped_until = body.skipped
    ? new Date(todayString() + 'T23:59:59')
    : undefined;

  const values = {
    ...body,
    plan_date,
    ...(completed_at !== undefined && { completed_at }),
    ...(skipped_until !== undefined && { skipped_until }),
  };

  const existing = db.select().from(morningPlans).where(eq(morningPlans.plan_date, plan_date)).get();

  if (existing) {
    db.update(morningPlans).set(values).where(eq(morningPlans.plan_date, plan_date)).run();
  } else {
    db.insert(morningPlans).values(values).run();
  }

  const result = db.select().from(morningPlans).where(eq(morningPlans.plan_date, plan_date)).get();
  return NextResponse.json(result);
}
