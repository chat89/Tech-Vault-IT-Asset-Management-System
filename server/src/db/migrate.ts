/**
 * migrate.ts
 * Runs all SQL migration files in order against the configured DATABASE_URL.
 * Usage: npm run migrate
 */

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import pool from './pool';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    // ── Ensure migrations tracking table exists ────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ         NOT NULL DEFAULT NOW()
      );
    `);

    // ── Load and sort migration files ─────────────────────
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [file]
      );

      if (rows.length > 0) {
        console.log(`  ⏭  Skipping (already applied): ${file}`);
        continue;
      }

      console.log(`  ▶  Applying: ${file}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✅  Applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration failed for ${file}: ${(err as Error).message}`);
      }
    }

    console.log('\n🎉 All migrations applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('\n❌ Migration error:', err.message);
  process.exit(1);
});

