#!/usr/bin/env ts-node
/**
 * Aplica a migration 014 (tabela baby_shower_rsvp_gifts). Idempotente.
 * Uso: npx ts-node --project tsconfig.node.json src/lib/migrations/run-014-baby-shower-rsvp-gifts.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const files = ['014_create_baby_shower_rsvp_gifts_table.sql'];

  for (const f of files) {
    const sql = fs.readFileSync(path.join(__dirname, f), 'utf-8');
    console.log(`\n📦 ${f}`);
    try {
      await pool.query(sql);
      console.log('  ✅ ok');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists')) {
        console.log(`  ⚠️  ${msg.split('\n')[0]} (ignorado)`);
      } else {
        console.error(`  ❌ ${msg}`);
        await pool.end();
        process.exit(1);
      }
    }
  }

  const r = await pool.query(
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'baby_shower_rsvp_gifts'"
  );
  console.log(`\n🌱 Tabela baby_shower_rsvp_gifts: ${r.rows[0].count}/1`);

  await pool.end();
}

run();
