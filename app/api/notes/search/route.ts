import { NextRequest, NextResponse } from 'next/server';
import { sqlite } from '@/lib/db';

interface FtsRow {
  id: number;
  title: string;
  content: string | null;
  project_id: number | null;
  updated_at: number | null;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json([]);

  const rows = sqlite.prepare(`
    SELECT n.id, n.title, n.content, n.project_id, n.updated_at
    FROM notes_fts
    JOIN notes n ON notes_fts.rowid = n.id
    WHERE notes_fts MATCH ?
    ORDER BY rank
    LIMIT 50
  `).all(`${q}*`) as FtsRow[];

  return NextResponse.json(rows);
}
