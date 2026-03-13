import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/test/list-pending-reveals
 * List all gender reveals (for testing purposes)
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const result = await pool.query(`
      SELECT id, boy_name, girl_name, dad_name, mom_name, contact_email, status, created_at
      FROM gender_reveals
      ORDER BY created_at DESC
      LIMIT 20
    `);

    return NextResponse.json({
      reveals: result.rows.map(row => ({
        id: row.id,
        boyName: row.boy_name,
        girlName: row.girl_name,
        dadName: row.dad_name,
        momName: row.mom_name,
        contactEmail: row.contact_email,
        status: row.status,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error('Error listing reveals:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list reveals' },
      { status: 500 }
    );
  }
}
