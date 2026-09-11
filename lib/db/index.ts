import 'server-only';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';
import path from 'path';
import os from 'os';
import fs from 'fs';

const dbPath = process.env.PCC_DB_PATH ?? path.join(os.homedir(), '.pcc', 'data', 'pcc.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Run Drizzle migrations eagerly on first import
const MIGRATIONS_DIR = path.join(process.cwd(), 'lib', 'db', 'migrations');
migrate(db, { migrationsFolder: MIGRATIONS_DIR });

// Seed default projects if table is empty (inlined to avoid circular import with migrate.ts)
const projectCount = sqlite.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
if (projectCount.c === 0) {
  sqlite.prepare(`INSERT INTO projects (name, color, icon, sort_order) VALUES
    ('Brainstorm', '#7C3AED', 'Lightbulb', 0),
    ('Work',       '#2563EB', 'Briefcase', 1),
    ('Personal',   '#16A34A', 'User',      2)`).run();
}
