import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { morningPlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { todayString } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const body = await req.json() as Partial<typeof morningPlans.$inferInsert>;
  const plan_date = body.plan_date ?? todayString();

  const existing = db.select().from(morningPlans).where(eq(morningPlans.plan_date, plan_date)).get();

  if (existing) {
    db.update(morningPlans)
      .set({ ...body, plan_date })
      .where(eq(morningPlans.plan_date, plan_date))
      .run();
  } else {
    db.insert(morningPlans).values({ ...body, plan_date }).run();
  }

  const result = db.select().from(morningPlans).where(eq(morningPlans.plan_date, plan_date)).get();
  return NextResponse.json(result);
}
