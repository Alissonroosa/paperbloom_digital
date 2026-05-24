/**
 * Script to run migration 008: digital_art_orders table
 */

import 'dotenv/config';
import pool from '../db';
import { promises as fs } from 'fs';
import path from 'path';

async function runMigrations() {
  console.log('Running digital art orders migration...\n');

  const migrations = ['008_create_digital_art_orders_table.sql'];

  for (const migration of migrations) {
    const filePath = path.join(__dirname, migration);

    try {
      const sql = await fs.readFile(filePath, 'utf-8');
      console.log(`Running ${migration}...`);
      await pool.query(sql);
      console.log(`✅ ${migration} completed\n`);
    } catch (error) {
      console.error(`❌ Error running ${migration}:`, error);
      throw error;
    }
  }

  console.log('Migration completed successfully!');
  await pool.end();
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
