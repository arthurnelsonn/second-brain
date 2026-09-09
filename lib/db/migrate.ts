import 'server-only';
import { db, sqlite } from './index';
import { projects } from './schema';
import { seedPromptTemplates } from '@/lib/ai/prompts';


function applyFts5(): void {
  sqlite.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts
    USING fts5(title, content, content=notes, content_rowid=id);

    CREATE TRIGGER IF NOT EXISTS notes_fts_insert
    AFTER INSERT ON notes BEGIN
      INSERT INTO notes_fts(rowid, title, content)
      VALUES (new.id, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS notes_fts_update
    AFTER UPDATE ON notes BEGIN
      INSERT INTO notes_fts(notes_fts, rowid, title, content)
      VALUES ('delete', old.id, old.title, old.content);
      INSERT INTO notes_fts(rowid, title, content)
      VALUES (new.id, new.title, new.content);
    END;

    CREATE TRIGGER IF NOT EXISTS notes_fts_delete
    AFTER DELETE ON notes BEGIN
      INSERT INTO notes_fts(notes_fts, rowid, title, content)
      VALUES ('delete', old.id, old.title, old.content);
    END;
  `);
}

function seedDefaultProjects(): void {
  const count = sqlite.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
  if (count.c > 0) return;
  db.insert(projects).values([
    { name: 'Brainstorm', color: '#7C3AED', icon: 'Lightbulb', sort_order: 0 },
    { name: 'Work',       color: '#2563EB', icon: 'Briefcase', sort_order: 1 },
    { name: 'Personal',   color: '#16A34A', icon: 'User',      sort_order: 2 },
  ]).run();
}

let ran = false;

export function runMigrations(): void {
  if (ran) return;
  ran = true;
  applyFts5();
  seedDefaultProjects();
  seedPromptTemplates();
}
