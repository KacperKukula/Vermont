import pg from 'pg';
import { readdir, readFile } from 'node:fs/promises';

import { databaseSettings } from '../src/database/database-settings.ts';

const settings = databaseSettings(process.env);
if (!settings) throw new Error('Invalid database configuration: check DATABASE_URL, DATABASE_LOGIN and DATABASE_PASSWORD');
const client = new pg.Client(settings);
await client.connect();
try {
  await client.query('SELECT pg_advisory_lock(913027)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const directory = new URL('../migrations/', import.meta.url);
  for (const name of (await readdir(directory)).filter((n) => n.endsWith('.sql')).sort()) {
    const exists = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
    if (exists.rowCount) continue;
    await client.query('BEGIN');
    try {
      await client.query(await readFile(new URL(name, directory), 'utf8'));
      await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [name]);
      await client.query('COMMIT');
      console.log(`Applied ${name}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
} finally {
  await client.end();
}
