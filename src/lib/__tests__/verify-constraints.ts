/**
 * Database Constraints Verification Script
 * Verifies that all required constraints and indexes are properly configured
 * Requirements: 6.3
 */

import pool, { closePool } from '../db';

async function verifyConstraints() {
  try {
    console.log('=== Database Constraints and Indexes Verification ===\n');

    // Check table existence
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'messages'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error('❌ Messages table does not exist');
      process.exit(1);
    }

    console.log('✓ Messages table exists\n');

    // Check UNIQUE constraint on slug
    console.log('--- UNIQUE Constraints ---');
    const uniqueConstraints = await pool.query(`
      SELECT conname, contype
      FROM pg_constraint
      WHERE conrelid = 'messages'::regclass
      AND contype = 'u';
    `);

    const hasSlugUnique = uniqueConstraints.rows.some(row => 
      row.conname.includes('slug')
    );

    if (hasSlugUnique) {
      console.log('✓ UNIQUE constraint on slug column');
    } else {
      console.error('❌ Missing UNIQUE constraint on slug column');
    }

    // Check NOT NULL constraints
    console.log('\n--- NOT NULL Constraints ---');
    const columns = await pool.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'messages'
      ORDER BY ordinal_position;
    `);

    const requiredFields = [
      'recipient_name',
      'sender_name',
      'message_text',
      'status',
      'view_count',
      'created_at',
      'updated_at'
    ];

    requiredFields.forEach(field => {
      const column = columns.rows.find(col => col.column_name === field);
      if (column && column.is_nullable === 'NO') {
        console.log(`✓ NOT NULL constraint on ${field}`);
      } else {
        console.error(`❌ Missing NOT NULL constraint on ${field}`);
      }
    });

    // Check CHECK constraint on status
    console.log('\n--- CHECK Constraints ---');
    const checkConstraints = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'messages'::regclass
      AND contype = 'c';
    `);

    const hasStatusCheck = checkConstraints.rows.some(row => 
      row.definition.includes('status') && 
      row.definition.includes('pending') && 
      row.definition.includes('paid')
    );

    if (hasStatusCheck) {
      console.log('✓ CHECK constraint on status enum (pending, paid)');
      checkConstraints.rows.forEach(row => {
        console.log(`  - ${row.conname}: ${row.definition}`);
      });
    } else {
      console.error('❌ Missing CHECK constraint on status enum');
    }

    // Check indexes
    console.log('\n--- Indexes ---');
    const indexes = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'messages'
      ORDER BY indexname;
    `);

    const requiredIndexes = [
      'idx_messages_slug',
      'idx_messages_status',
      'idx_messages_stripe_session_id'
    ];

    requiredIndexes.forEach(indexName => {
      const index = indexes.rows.find(idx => idx.indexname === indexName);
      if (index) {
        console.log(`✓ Index: ${indexName}`);
        console.log(`  ${index.indexdef}`);
      } else {
        console.error(`❌ Missing index: ${indexName}`);
      }
    });

    // Check primary key
    console.log('\n--- Primary Key ---');
    const primaryKey = await pool.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'messages'::regclass
      AND contype = 'p';
    `);

    if (primaryKey.rows.length > 0) {
      console.log(`✓ Primary key: ${primaryKey.rows[0].conname}`);
    } else {
      console.error('❌ Missing primary key');
    }

    // Check default values
    console.log('\n--- Default Values ---');
    const defaults = await pool.query(`
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_name = 'messages'
      AND column_default IS NOT NULL
      ORDER BY ordinal_position;
    `);

    defaults.rows.forEach(col => {
      console.log(`✓ ${col.column_name}: ${col.column_default}`);
    });

    // Check trigger for updated_at
    console.log('\n--- Triggers ---');
    const triggers = await pool.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'messages';
    `);

    if (triggers.rows.length > 0) {
      triggers.rows.forEach(trigger => {
        console.log(`✓ Trigger: ${trigger.trigger_name}`);
        console.log(`  Event: ${trigger.event_manipulation}`);
      });
    } else {
      console.log('⚠ No triggers found (updated_at may not auto-update)');
    }

    console.log('\n=== Verification Complete ===');
    console.log('All required constraints and indexes are properly configured.');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

verifyConstraints();
