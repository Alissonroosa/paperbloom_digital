#!/usr/bin/env ts-node
/**
 * Aplica as migrations 011, 012 e 013 (produto "Chá de Fralda") diretamente.
 * Idempotente: ignora erros "already exists".
 * Uso: npx ts-node --project tsconfig.node.json src/lib/migrations/run-011-013-baby-shower.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const files = [
    '011_create_baby_showers_table.sql',
    '012_create_baby_shower_gifts_table.sql',
    '013_create_baby_shower_rsvps_table.sql',
  ];

  for (const f of files) {
    const sql = fs.readFileSync(path.join(__dirname, f), 'utf-8');
    console.log(`\n📦 ${f}`);
    try {
      await pool.query(sql);
      console.log('  ✅ ok');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Ignora "already exists" — idempotente
      if (msg.includes('already exists')) {
        console.log(`  ⚠️  ${msg.split('\n')[0]} (ignorado)`);
      } else {
        console.error(`  ❌ ${msg}`);
        await pool.end();
        process.exit(1);
      }
    }
  }

  // Verifica
  const r = await pool.query(
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('baby_showers','baby_shower_gifts','baby_shower_rsvps')"
  );
  console.log(`\n🌱 Tabelas do Chá de Fralda criadas: ${r.rows[0].count}/3`);

  await pool.end();
}

run();
