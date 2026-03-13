import pool, { closePool } from './db';
import fs from 'fs';
import path from 'path';

async function validateSetup() {
  console.log('=== Paper Bloom Backend Setup Validation ===\n');
  
  let allChecksPass = true;
  
  // 1. Check environment variables
  console.log('1. Checking environment variables...');
  const requiredEnvVars = ['DATABASE_URL'];
  const optionalEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_BASE_URL'];
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✓ ${varName} is set`);
    } else {
      console.log(`   ✗ ${varName} is NOT set (REQUIRED)`);
      allChecksPass = false;
    }
  });
  
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`   ✓ ${varName} is set`);
    } else {
      console.log(`   ⚠ ${varName} is NOT set (optional for now)`);
    }
  });
  
  // 2. Check database connection
  console.log('\n2. Testing database connection...');
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('   ✓ Database connection successful');
  } catch (error) {
    console.log('   ✗ Database connection failed:', error);
    allChecksPass = false;
  }
  
  // 3. Check if messages table exists
  console.log('\n3. Checking database schema...');
  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'messages'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('   ✓ Messages table exists');
      
      // Check for required columns
      const columns = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'messages';
      `);
      
      const requiredColumns = [
        'id', 'recipient_name', 'sender_name', 'message_text',
        'status', 'created_at', 'updated_at'
      ];
      
      const existingColumns = columns.rows.map(r => r.column_name);
      requiredColumns.forEach(col => {
        if (existingColumns.includes(col)) {
          console.log(`   ✓ Column '${col}' exists`);
        } else {
          console.log(`   ✗ Column '${col}' is missing`);
          allChecksPass = false;
        }
      });
      
      // Check for indexes
      const indexes = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'messages'
        AND indexname IN ('idx_messages_slug', 'idx_messages_status', 'idx_messages_stripe_session_id');
      `);
      
      const expectedIndexes = ['idx_messages_slug', 'idx_messages_status', 'idx_messages_stripe_session_id'];
      const existingIndexes = indexes.rows.map(r => r.indexname);
      
      expectedIndexes.forEach(idx => {
        if (existingIndexes.includes(idx)) {
          console.log(`   ✓ Index '${idx}' exists`);
        } else {
          console.log(`   ✗ Index '${idx}' is missing`);
          allChecksPass = false;
        }
      });
    } else {
      console.log('   ✗ Messages table does not exist');
      console.log('   → Run: npm run db:migrate');
      allChecksPass = false;
    }
  } catch (error) {
    console.log('   ✗ Schema check failed:', error);
    allChecksPass = false;
  }
  
  // 4. Check required dependencies
  console.log('\n4. Checking installed dependencies...');
  const requiredDeps = ['pg', 'stripe', 'qrcode', 'sharp', 'zod', 'dotenv'];
  
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    requiredDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        console.log(`   ✓ ${dep} is installed (${packageJson.dependencies[dep]})`);
      } else {
        console.log(`   ✗ ${dep} is NOT installed`);
        allChecksPass = false;
      }
    });
  } catch (error) {
    console.log('   ✗ Could not read package.json');
    allChecksPass = false;
  }
  
  // 5. Check file structure
  console.log('\n5. Checking file structure...');
  const requiredFiles = [
    'src/lib/db.ts',
    'src/lib/migrations/001_create_messages_table.sql',
    'src/lib/migrations/migrate.ts',
    'src/types/message.ts',
    '.env.example'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✓ ${file} exists`);
    } else {
      console.log(`   ✗ ${file} is missing`);
      allChecksPass = false;
    }
  });
  
  // Summary
  console.log('\n=== Validation Summary ===');
  if (allChecksPass) {
    console.log('✓ All checks passed! Setup is complete.');
    console.log('\nNext steps:');
    console.log('  1. Configure Stripe keys in .env.local');
    console.log('  2. Start implementing the next task');
  } else {
    console.log('✗ Some checks failed. Please review the errors above.');
    process.exit(1);
  }
  
  await closePool();
}

validateSetup();
