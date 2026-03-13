import pool from '../db';
import fs from 'fs';
import path from 'path';

/**
 * Run database migrations
 * This script reads SQL migration files and executes them against the database
 */
export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    // Migration 001: Create messages table
    const migration001Path = path.join(__dirname, '001_create_messages_table.sql');
    const migration001SQL = fs.readFileSync(migration001Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(migration001SQL);
    await client.query('COMMIT');
    
    console.log('✓ Migration 001_create_messages_table completed successfully');
    
    // Migration 002: Add enhanced message fields
    const migration002Path = path.join(__dirname, '002_add_enhanced_message_fields.sql');
    const migration002SQL = fs.readFileSync(migration002Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(migration002SQL);
    await client.query('COMMIT');
    
    console.log('✓ Migration 002_add_enhanced_message_fields completed successfully');
    
    // Migration 003: Add theme fields
    const migration003Path = path.join(__dirname, '003_add_theme_fields.sql');
    const migration003SQL = fs.readFileSync(migration003Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(migration003SQL);
    await client.query('COMMIT');
    
    console.log('✓ Migration 003_add_theme_fields completed successfully');
    
    // Migration 004: Create card_collections table
    const migration004Path = path.join(__dirname, '004_create_card_collections_table.sql');
    const migration004SQL = fs.readFileSync(migration004Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(migration004SQL);
    await client.query('COMMIT');
    
    console.log('✓ Migration 004_create_card_collections_table completed successfully');
    
    // Migration 005: Create cards table
    const migration005Path = path.join(__dirname, '005_create_cards_table.sql');
    const migration005SQL = fs.readFileSync(migration005Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(migration005SQL);
    await client.query('COMMIT');
    
    console.log('✓ Migration 005_create_cards_table completed successfully');
    console.log('Database migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Rollback database migrations
 * This script reads SQL rollback files and executes them against the database
 */
export async function rollbackMigrations(): Promise<void> {
  const client = await pool.connect();
  
  try {
    console.log('Starting database rollback...');
    
    // Rollback 005: Drop cards table (rollback in reverse order)
    const rollback005Path = path.join(__dirname, '005_create_cards_table_rollback.sql');
    const rollback005SQL = fs.readFileSync(rollback005Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(rollback005SQL);
    await client.query('COMMIT');
    
    console.log('✓ Rollback 005_create_cards_table completed successfully');
    
    // Rollback 004: Drop card_collections table
    const rollback004Path = path.join(__dirname, '004_create_card_collections_table_rollback.sql');
    const rollback004SQL = fs.readFileSync(rollback004Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(rollback004SQL);
    await client.query('COMMIT');
    
    console.log('✓ Rollback 004_create_card_collections_table completed successfully');
    
    // Rollback 003: Remove theme fields
    const rollback003Path = path.join(__dirname, '003_add_theme_fields_rollback.sql');
    const rollback003SQL = fs.readFileSync(rollback003Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(rollback003SQL);
    await client.query('COMMIT');
    
    console.log('✓ Rollback 003_add_theme_fields completed successfully');
    
    // Rollback 002: Remove enhanced message fields
    const rollback002Path = path.join(__dirname, '002_add_enhanced_message_fields_rollback.sql');
    const rollback002SQL = fs.readFileSync(rollback002Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(rollback002SQL);
    await client.query('COMMIT');
    
    console.log('✓ Rollback 002_add_enhanced_message_fields completed successfully');
    
    // Rollback 001: Drop messages table
    const rollback001Path = path.join(__dirname, '001_create_messages_table_rollback.sql');
    const rollback001SQL = fs.readFileSync(rollback001Path, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(rollback001SQL);
    await client.query('COMMIT');
    
    console.log('✓ Rollback 001_create_messages_table completed successfully');
    console.log('Database rollback completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Rollback failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'up') {
    runMigrations()
      .then(() => {
        console.log('Migrations completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Migration error:', error);
        process.exit(1);
      });
  } else if (command === 'down') {
    rollbackMigrations()
      .then(() => {
        console.log('Rollback completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Rollback error:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: ts-node migrate.ts [up|down]');
    console.log('  up   - Run migrations');
    console.log('  down - Rollback migrations');
    process.exit(1);
  }
}
