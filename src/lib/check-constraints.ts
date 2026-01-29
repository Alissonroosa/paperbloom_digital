import pool from './db';

async function checkConstraints() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'messages'::regclass
    `);
    
    console.log('Constraints on messages table:');
    result.rows.forEach(row => {
      console.log(`  - ${row.conname}: ${row.contype}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

checkConstraints();
