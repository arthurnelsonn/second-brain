import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ message: 'Coming in later phase' }, { status: 202 });
}
