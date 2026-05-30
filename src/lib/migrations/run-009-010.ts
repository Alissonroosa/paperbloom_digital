#!/usr/bin/env ts-node
/**
 * Aplica as migrations 009 e 010 diretamente (o runner do projeto quebra em
 * migrations antigas com referência a stripe_session_id).
 * Uso: npx ts-node --project tsconfig.node.json src/lib/migrations/run-009-010.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const files = [
    '009_create_products_table.sql',
    '010_create_physical_orders_table.sql',
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
  const r = await pool.query("SELECT COUNT(*) FROM products WHERE active = true");
  console.log(`\n🌱 Produtos ativos na tabela products: ${r.rows[0].count}`);

  await pool.end();
}

run();
