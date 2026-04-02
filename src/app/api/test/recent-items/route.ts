import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/test/recent-items
 * 
 * Returns the most recent card collections and messages for testing.
 * 
 * ⚠️ FOR TESTING ONLY - Do not use in production!
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    console.log('[recent-items] Starting query...');
    
    // Get recent card collections
    let collections: any = { rows: [] };
    try {
      collections = await pool.query(`
        SELECT 
          id, 
          recipient_name, 
          sender_name, 
          status, 
          slug,
          created_at,
          updated_at
        FROM card_collections 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      console.log('[recent-items] Collections found:', collections.rows.length);
    } catch (collectionError) {
      console.error('[recent-items] Error querying card_collections:', collectionError);
    }

    // Get recent messages
    let messages: any = { rows: [] };
    try {
      messages = await pool.query(`
        SELECT 
          id, 
          title,
          recipient_name, 
          sender_name, 
          status, 
          slug,
          created_at,
          updated_at
        FROM messages 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      console.log('[recent-items] Messages found:', messages.rows.length);
    } catch (messageError) {
      console.error('[recent-items] Error querying messages:', messageError);
    }

    const result = {
      collections: collections.rows.map((row: any) => ({
        id: row.id,
        recipientName: row.recipient_name,
        senderName: row.sender_name,
        status: row.status,
        slug: row.slug,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      messages: messages.rows.map((row: any) => ({
        id: row.id,
        pageTitle: row.title,
        recipientName: row.recipient_name,
        senderName: row.sender_name,
        status: row.status,
        slug: row.slug,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      debug: {
        collectionsCount: collections.rows.length,
        messagesCount: messages.rows.length,
      }
    };

    console.log('[recent-items] Returning result:', JSON.stringify(result.debug));
    return NextResponse.json(result);

  } catch (error) {
    console.error('[recent-items] Error fetching recent items:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
