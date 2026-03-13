import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * POST /api/test/run-migrations
 * GET /api/test/run-migrations
 * Run pending migrations (development only)
 */
export async function POST() {
  return runMigrations();
}

export async function GET() {
  return runMigrations();
}

async function runMigrations() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const results: { file: string; success: boolean; error?: string }[] = [];

  try {
    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'src/lib/migrations');
    const files = await fs.readdir(migrationsDir);
    
    // Filter only .sql files (not rollback files)
    const migrationFiles = files
      .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
      .sort();

    for (const file of migrationFiles) {
      try {
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf-8');
        
        await pool.query(sql);
        results.push({ file, success: true });
        console.log(`✅ Migration ${file} executed successfully`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ file, success: false, error: errorMessage });
        console.error(`❌ Migration ${file} failed:`, errorMessage);
      }
    }

    return NextResponse.json({
      message: 'Migrations completed',
      results,
    });
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run migrations' },
      { status: 500 }
    );
  }
}
