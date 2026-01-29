import pool from '../db';
import { runMigrations, rollbackMigrations } from './migrate';

/**
 * Test migration script
 * This script tests the migration on a clean database by:
 * 1. Rolling back any existing schema
 * 2. Running migrations
 * 3. Verifying the schema was created correctly
 */

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface IndexInfo {
  indexname: string;
}

interface ConstraintInfo {
  constraint_name: string;
  constraint_type: string;
}

interface TriggerInfo {
  trigger_name: string;
}

async function verifyTable(): Promise<boolean> {
  const client = await pool.connect();
  try {
    // Check if table exists
    const tableResult = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = 'messages'`
    );
    
    if (tableResult.rows.length === 0) {
      console.error('❌ Table "messages" does not exist');
      return false;
    }
    
    console.log('✓ Table "messages" exists');
    return true;
  } finally {
    client.release();
  }
}

async function verifyColumns(): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query<ColumnInfo>(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_name = 'messages'
       ORDER BY ordinal_position`
    );
    
    const expectedColumns = [
      'id',
      'recipient_name',
      'sender_name',
      'message_text',
      'image_url',
      'youtube_url',
      'slug',
      'qr_code_url',
      'status',
      'stripe_session_id',
      'view_count',
      'created_at',
      'updated_at',
    ];
    
    const actualColumns = result.rows.map((row) => row.column_name);
    
    let allColumnsPresent = true;
    for (const expectedColumn of expectedColumns) {
      if (actualColumns.includes(expectedColumn)) {
        console.log(`✓ Column "${expectedColumn}" exists`);
      } else {
        console.error(`❌ Column "${expectedColumn}" is missing`);
        allColumnsPresent = false;
      }
    }
    
    return allColumnsPresent;
  } finally {
    client.release();
  }
}

async function verifyIndexes(): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query<IndexInfo>(
      `SELECT indexname FROM pg_indexes 
       WHERE tablename = 'messages'`
    );
    
    const expectedIndexes = [
      'messages_pkey', // Primary key index
      'idx_messages_slug',
      'idx_messages_status',
      'idx_messages_stripe_session_id',
    ];
    
    const actualIndexes = result.rows.map((row) => row.indexname);
    
    let allIndexesPresent = true;
    for (const expectedIndex of expectedIndexes) {
      if (actualIndexes.includes(expectedIndex)) {
        console.log(`✓ Index "${expectedIndex}" exists`);
      } else {
        console.error(`❌ Index "${expectedIndex}" is missing`);
        allIndexesPresent = false;
      }
    }
    
    return allIndexesPresent;
  } finally {
    client.release();
  }
}

async function verifyConstraints(): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query<ConstraintInfo>(
      `SELECT constraint_name, constraint_type
       FROM information_schema.table_constraints
       WHERE table_name = 'messages'`
    );
    
    const constraints = result.rows;
    
    // Check for primary key
    const hasPrimaryKey = constraints.some(
      (c) => c.constraint_type === 'PRIMARY KEY'
    );
    if (hasPrimaryKey) {
      console.log('✓ PRIMARY KEY constraint exists');
    } else {
      console.error('❌ PRIMARY KEY constraint is missing');
      return false;
    }
    
    // Check for unique constraint on slug
    const hasUniqueSlug = constraints.some(
      (c) => c.constraint_type === 'UNIQUE' && c.constraint_name.includes('slug')
    );
    if (hasUniqueSlug) {
      console.log('✓ UNIQUE constraint on slug exists');
    } else {
      console.error('❌ UNIQUE constraint on slug is missing');
      return false;
    }
    
    // Check for check constraint on status
    const hasCheckStatus = constraints.some(
      (c) => c.constraint_type === 'CHECK'
    );
    if (hasCheckStatus) {
      console.log('✓ CHECK constraint exists');
    } else {
      console.error('❌ CHECK constraint is missing');
      return false;
    }
    
    return true;
  } finally {
    client.release();
  }
}

async function verifyTrigger(): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query<TriggerInfo>(
      `SELECT trigger_name FROM information_schema.triggers
       WHERE event_object_table = 'messages'`
    );
    
    const hasTrigger = result.rows.some(
      (row) => row.trigger_name === 'update_messages_updated_at'
    );
    
    if (hasTrigger) {
      console.log('✓ Trigger "update_messages_updated_at" exists');
      return true;
    } else {
      console.error('❌ Trigger "update_messages_updated_at" is missing');
      return false;
    }
  } finally {
    client.release();
  }
}

async function testInsertAndUpdate(): Promise<boolean> {
  const client = await pool.connect();
  try {
    console.log('\nTesting insert and update operations...');
    
    // Insert a test message
    const insertResult = await client.query(
      `INSERT INTO messages (recipient_name, sender_name, message_text)
       VALUES ($1, $2, $3)
       RETURNING id, created_at, updated_at`,
      ['Test Recipient', 'Test Sender', 'Test message']
    );
    
    const messageId = insertResult.rows[0].id;
    const createdAt = insertResult.rows[0].created_at;
    const initialUpdatedAt = insertResult.rows[0].updated_at;
    
    console.log('✓ Insert successful');
    console.log(`  - ID: ${messageId}`);
    console.log(`  - created_at: ${createdAt}`);
    console.log(`  - updated_at: ${initialUpdatedAt}`);
    
    // Wait a moment to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Update the message
    await client.query(
      `UPDATE messages SET message_text = $1 WHERE id = $2`,
      ['Updated message', messageId]
    );
    
    // Fetch the updated message
    const selectResult = await client.query(
      `SELECT created_at, updated_at FROM messages WHERE id = $1`,
      [messageId]
    );
    
    const finalCreatedAt = selectResult.rows[0].created_at;
    const finalUpdatedAt = selectResult.rows[0].updated_at;
    
    console.log('✓ Update successful');
    console.log(`  - created_at: ${finalCreatedAt} (unchanged)`);
    console.log(`  - updated_at: ${finalUpdatedAt} (updated)`);
    
    // Verify created_at didn't change
    if (createdAt.getTime() === finalCreatedAt.getTime()) {
      console.log('✓ created_at remained unchanged');
    } else {
      console.error('❌ created_at was modified');
      return false;
    }
    
    // Verify updated_at changed
    if (finalUpdatedAt > initialUpdatedAt) {
      console.log('✓ updated_at was automatically updated by trigger');
    } else {
      console.error('❌ updated_at was not updated');
      return false;
    }
    
    // Clean up test data
    await client.query(`DELETE FROM messages WHERE id = $1`, [messageId]);
    console.log('✓ Test data cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Insert/Update test failed:', error);
    return false;
  } finally {
    client.release();
  }
}

async function testMigration(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Testing Database Migration on Clean Database');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Rollback to clean state
    console.log('\n[Step 1] Rolling back existing schema...');
    try {
      await rollbackMigrations();
    } catch (error) {
      console.log('Note: Rollback may fail if schema does not exist (this is OK)');
    }
    
    // Step 2: Run migrations
    console.log('\n[Step 2] Running migrations...');
    await runMigrations();
    
    // Step 3: Verify schema
    console.log('\n[Step 3] Verifying schema...');
    
    console.log('\nVerifying table...');
    const tableOk = await verifyTable();
    
    console.log('\nVerifying columns...');
    const columnsOk = await verifyColumns();
    
    console.log('\nVerifying indexes...');
    const indexesOk = await verifyIndexes();
    
    console.log('\nVerifying constraints...');
    const constraintsOk = await verifyConstraints();
    
    console.log('\nVerifying trigger...');
    const triggerOk = await verifyTrigger();
    
    // Step 4: Test functionality
    const functionalityOk = await testInsertAndUpdate();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Test Summary');
    console.log('='.repeat(60));
    console.log(`Table:        ${tableOk ? '✓ PASS' : '❌ FAIL'}`);
    console.log(`Columns:      ${columnsOk ? '✓ PASS' : '❌ FAIL'}`);
    console.log(`Indexes:      ${indexesOk ? '✓ PASS' : '❌ FAIL'}`);
    console.log(`Constraints:  ${constraintsOk ? '✓ PASS' : '❌ FAIL'}`);
    console.log(`Trigger:      ${triggerOk ? '✓ PASS' : '❌ FAIL'}`);
    console.log(`Functionality: ${functionalityOk ? '✓ PASS' : '❌ FAIL'}`);
    
    const allPassed =
      tableOk &&
      columnsOk &&
      indexesOk &&
      constraintsOk &&
      triggerOk &&
      functionalityOk;
    
    console.log('='.repeat(60));
    if (allPassed) {
      console.log('✓ ALL TESTS PASSED - Migration is working correctly!');
      console.log('='.repeat(60));
      process.exit(0);
    } else {
      console.log('❌ SOME TESTS FAILED - Please review the errors above');
      console.log('='.repeat(60));
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Migration test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
testMigration();
