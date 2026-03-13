/**
 * Script to run migrations 006 and 007 for gender reveals
 */

import 'dotenv/config';
import pool from '../db';
import { promises as fs } from 'fs';
import path from 'path';

async function runMigrations() {
  console.log('Running gender reveal migrations...\n');

  const migrations = [
    '006_create_gender_reveals_table.sql',
    '007_create_gender_reveal_votes_table.sql',
  ];

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

  console.log('All migrations completed successfully!');
  await pool.end();
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
