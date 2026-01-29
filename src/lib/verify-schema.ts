import pool, { closePool } from './db';

async function verifySchema() {
  try {
    console.log('Verifying database schema...\n');
    
    // Check if messages table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'messages'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✓ Messages table exists');
      
      // Get table columns
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'messages'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nTable columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Get indexes
      const indexes = await pool.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'messages';
      `);
      
      console.log('\nIndexes:');
      indexes.rows.forEach(idx => {
        console.log(`  - ${idx.indexname}`);
      });
      
      // Get constraints
      const constraints = await pool.query(`
        SELECT conname, contype
        FROM pg_constraint
        WHERE conrelid = 'messages'::regclass;
      `);
      
      console.log('\nConstraints:');
      constraints.rows.forEach(con => {
        const type = con.contype === 'p' ? 'PRIMARY KEY' : 
                     con.contype === 'u' ? 'UNIQUE' : 
                     con.contype === 'c' ? 'CHECK' : con.contype;
        console.log(`  - ${con.conname}: ${type}`);
      });
      
      console.log('\n✓ Database schema verification complete');
    } else {
      console.error('✗ Messages table does not exist');
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Schema verification failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

verifySchema();
