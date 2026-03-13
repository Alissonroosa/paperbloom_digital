/**
 * Migration Runner: Create card_collections and cards tables
 * Run with: npx tsx src/lib/migrations/run-004-005.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../db';

async function runMigrations() {
  console.log('🚀 Starting migrations: Create card_collections and cards tables...\n');

  const client = await pool.connect();

  try {
    // Migration 004: Create card_collections table
    console.log('📦 Running migration 004: Create card_collections table...');
    const migration004SQL = readFileSync(
      join(__dirname, '004_create_card_collections_table.sql'),
      'utf-8'
    );

    await client.query('BEGIN');
    await client.query(migration004SQL);
    await client.query('COMMIT');

    console.log('✅ Migration 004 completed successfully!\n');

    // Migration 005: Create cards table
    console.log('📦 Running migration 005: Create cards table...');
    const migration005SQL = readFileSync(
      join(__dirname, '005_create_cards_table.sql'),
      'utf-8'
    );

    await client.query('BEGIN');
    await client.query(migration005SQL);
    await client.query('COMMIT');

    console.log('✅ Migration 005 completed successfully!\n');

    // Verify the tables were created
    console.log('🔍 Verifying tables...\n');

    // Check card_collections table
    const collectionsResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'card_collections'
      ORDER BY ordinal_position;
    `);

    console.log('📋 card_collections table columns:');
    collectionsResult.rows.forEach(row => {
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ✓ ${row.column_name} ${row.data_type}${length} ${nullable}`);
    });

    // Check cards table
    const cardsResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'cards'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 cards table columns:');
    cardsResult.rows.forEach(row => {
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ✓ ${row.column_name} ${row.data_type}${length} ${nullable}`);
    });

    // Check indexes
    const indexesResult = await client.query(`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE tablename IN ('card_collections', 'cards')
      ORDER BY tablename, indexname;
    `);

    console.log('\n📋 Indexes created:');
    indexesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.tablename}.${row.indexname}`);
    });

    // Check foreign key constraint
    const fkResult = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'cards';
    `);

    console.log('\n📋 Foreign key constraints:');
    fkResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    });

    console.log('\n✨ All migrations completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
