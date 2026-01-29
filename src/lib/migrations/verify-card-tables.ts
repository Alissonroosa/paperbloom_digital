/**
 * Verification script for card_collections and cards tables
 * Run with: npx tsx src/lib/migrations/verify-card-tables.ts
 */

import pool from '../db';

async function verifyTables() {
  console.log('🔍 Verifying card_collections and cards tables...\n');

  const client = await pool.connect();

  try {
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('card_collections', 'cards')
      ORDER BY table_name;
    `);

    console.log('📋 Tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    if (tablesResult.rows.length !== 2) {
      throw new Error('Expected 2 tables but found ' + tablesResult.rows.length);
    }

    // Check constraints
    const constraintsResult = await client.query(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_name IN ('card_collections', 'cards')
      ORDER BY tc.table_name, tc.constraint_type;
    `);

    console.log('\n📋 Constraints:');
    constraintsResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}.${row.constraint_name} (${row.constraint_type})`);
    });

    // Check triggers
    const triggersResult = await client.query(`
      SELECT 
        event_object_table as table_name,
        trigger_name
      FROM information_schema.triggers
      WHERE event_object_table IN ('card_collections', 'cards')
      ORDER BY event_object_table;
    `);

    console.log('\n📋 Triggers:');
    triggersResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}.${row.trigger_name}`);
    });

    console.log('\n✅ All verifications passed!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

verifyTables();
