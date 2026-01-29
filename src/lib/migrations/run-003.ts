/**
 * Migration Runner: Add theme customization fields
 * Run with: npx ts-node --project tsconfig.node.json src/lib/migrations/run-003.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../db';

async function runMigration() {
  console.log('🚀 Starting migration: Add theme customization fields...\n');

  try {
    // Read the migration SQL file
    const migrationSQL = readFileSync(
      join(__dirname, '003_add_theme_fields.sql'),
      'utf-8'
    );

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('\nAdded columns:');
    console.log('  - background_color (VARCHAR(7))');
    console.log('  - theme (VARCHAR(20))');
    console.log('  - custom_emoji (VARCHAR(10))');
    console.log('  - music_start_time (INTEGER)');
    console.log('  - show_time_counter (BOOLEAN)');
    console.log('  - time_counter_label (VARCHAR(100))');

    // Verify the columns were added
    const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, column_default
      FROM information_schema.columns
      WHERE table_name = 'messages'
      AND column_name IN ('background_color', 'theme', 'custom_emoji', 'music_start_time', 'show_time_counter', 'time_counter_label')
      ORDER BY column_name;
    `);

    console.log('\n📋 Verification:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''})`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
