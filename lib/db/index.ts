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

// Run migrations eagerly on first import so all routes have a ready DB
const MIGRATIONS_DIR = path.join(process.cwd(), 'lib', 'db', 'migrations');
migrate(db, { migrationsFolder: MIGRATIONS_DIR });
