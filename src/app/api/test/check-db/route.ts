import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/test/check-db
 * Check database connection and tables
 */
export async function GET() {
  const results: Record<string, any> = {};

  try {
    // Test connection
    const connTest = await pool.query('SELECT NOW() as time');
    results.connection = { success: true, time: connTest.rows[0].time };

    // Check if gender_reveals table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'gender_reveals'
      ) as exists
    `);
    results.genderRevealsTable = { exists: tableCheck.rows[0].exists };

    // If table exists, count rows
    if (tableCheck.rows[0].exists) {
      const countResult = await pool.query('SELECT COUNT(*) as count FROM gender_reveals');
      results.genderRevealsTable.count = parseInt(countResult.rows[0].count);

      // Get recent rows
      const recentRows = await pool.query(`
        SELECT id, boy_name, girl_name, status, created_at 
        FROM gender_reveals 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      results.genderRevealsTable.recentRows = recentRows.rows;
    }

    // Check if gender_reveal_votes table exists
    const votesTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'gender_reveal_votes'
      ) as exists
    `);
    results.genderRevealVotesTable = { exists: votesTableCheck.rows[0].exists };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }, { status: 500 });
  }
}
