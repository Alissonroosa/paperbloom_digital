const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Read DATABASE_URL from .env.local
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
  
  if (!dbUrlMatch) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const connectionString = dbUrlMatch[1].trim();
  
  console.log('🔌 Connecting to database...');
  
  const pool = new Pool({
    connectionString
  });

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_youtube_and_contact_name_to_card_collections.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Running migration...');
    
    // Execute migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify columns were added
    console.log('\n🔍 Verifying columns...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'card_collections'
      AND column_name IN ('youtube_video_id', 'contact_name')
      ORDER BY column_name;
    `);
    
    if (result.rows.length === 2) {
      console.log('✅ Columns verified:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('⚠️  Warning: Expected 2 columns, found', result.rows.length);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
