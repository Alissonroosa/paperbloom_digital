import pool from '../db';
import fs from 'fs';
import path from 'path';

/**
 * Run migration 002 only
 * Adds enhanced message fields to existing messages table
 */
async function runMigration002(): Promise<void> {
  const client = await pool.connect();
  
  try {
    console.log('Running migration 002: Add enhanced message fields...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '002_add_enhanced_message_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute migration
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✓ Migration 002_add_enhanced_message_fields completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration002()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
