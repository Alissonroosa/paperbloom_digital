import { testConnection, closePool } from './db';

async function main() {
  try {
    const success = await testConnection();
    if (success) {
      console.log('✓ Database connection test passed');
      process.exit(0);
    } else {
      console.error('✗ Database connection test failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Database connection test error:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
