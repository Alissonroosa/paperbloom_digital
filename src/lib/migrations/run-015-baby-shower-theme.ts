#!/usr/bin/env ts-node
/**
 * Aplica a migration 015 (coluna theme em baby_showers). Idempotente.
 * Uso: npx ts-node --project tsconfig.node.json src/lib/migrations/run-015-baby-shower-theme.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const files = ['015_add_baby_shower_theme.sql'];

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
    "SELECT column_name FROM information_schema.columns WHERE table_name='baby_showers' AND column_name='theme'"
  );
  console.log(`\n🌱 Coluna theme em baby_showers: ${r.rows.length === 1 ? 'OK' : 'FALTANDO'}`);

  await pool.end();
}

run();
