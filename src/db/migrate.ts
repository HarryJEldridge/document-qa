import db from './client';

interface Migration {
  version: number;
  up: () => void;
}

const migrations: Migration[] = [
  {
    version: 1,
    up: () => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS schema_versions (
          version    INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS briefings (
          id           INTEGER PRIMARY KEY AUTOINCREMENT,
          date         TEXT NOT NULL,
          context_json TEXT NOT NULL,
          output_text  TEXT NOT NULL,
          created_at   TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS crm_contacts (
          id             INTEGER PRIMARY KEY AUTOINCREMENT,
          name           TEXT NOT NULL,
          role           TEXT,
          company        TEXT,
          email          TEXT,
          phone          TEXT,
          relationship   TEXT,
          notes          TEXT,
          last_contacted TEXT,
          tags           TEXT,
          created_at     TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    },
  },
];

function getAppliedVersions(): Set<number> {
  try {
    const rows = db
      .prepare('SELECT version FROM schema_versions')
      .all() as { version: number }[];
    return new Set(rows.map((r) => r.version));
  } catch {
    return new Set();
  }
}

export function migrate(): void {
  const applied = getAppliedVersions();
  let ran = 0;

  for (const migration of migrations) {
    if (!applied.has(migration.version)) {
      migration.up();
      db.prepare('INSERT INTO schema_versions (version) VALUES (?)').run(
        migration.version
      );
      ran++;
    }
  }

  if (ran > 0) {
    console.log(`Applied ${ran} DB migration(s).`);
  }
}

// Run directly via `npm run db:migrate`
if (require.main === module) {
  migrate();
  console.log('Database is up to date.');
  process.exit(0);
}
