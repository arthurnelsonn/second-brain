const db = require('better-sqlite3')(require('path').join(require('os').homedir(), '.pcc', 'data', 'pcc.db'));
const rows = db.prepare("SELECT type, name FROM sqlite_master WHERE type IN ('table','trigger') ORDER BY type, name").all();
const tables = rows.filter(r => r.type === 'table').map(r => r.name);
const triggers = rows.filter(r => r.type === 'trigger').map(r => r.name);
console.log('Tables (' + tables.length + '):');
tables.forEach(t => console.log('  ' + t));
console.log('Triggers (' + triggers.length + '):');
triggers.forEach(t => console.log('  ' + t));
db.close();
