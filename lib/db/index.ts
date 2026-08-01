import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import os from 'os';
import fs from 'fs';

const dbDir = path.join(os.homedir(), '.pcc', 'data');
fs.mkdirSync(dbDir, { recursive: true });

const sqlite = new Database(path.join(dbDir, 'pcc.db'));
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
