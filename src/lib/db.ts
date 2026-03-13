import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import { validateEnv, env } from './env';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  console.error('Failed to validate environment variables:', error);
  throw error;
}

// Database connection pool configuration
const poolConfig: PoolConfig = {
  connectionString: env.database.url,
  max: env.database.pool.max,
  idleTimeoutMillis: env.database.pool.idleTimeoutMillis,
  connectionTimeoutMillis: env.database.pool.connectionTimeoutMillis,
};

// Create connection pool
const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Export pool for use in services
export default pool;

// Helper function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Helper function to close pool (useful for testing)
export async function closePool(): Promise<void> {
  await pool.end();
}
