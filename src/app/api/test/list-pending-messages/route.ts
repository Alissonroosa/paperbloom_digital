import { NextResponse } from 'next/server';
import { messageService } from '@/services/MessageService';

/**
 * GET /api/test/list-pending-messages
 * Lista mensagens com status pendente
 * 
 * @returns JSON com lista de mensagens pendentes
 */
export async function GET() {
  try {
    // Buscar todas as mensagens pendentes
    const db = await messageService.getDatabase();
    
    const messages = await db.all(`
      SELECT 
        id, 
        recipientName, 
        senderName, 
        status, 
        createdAt,
        title
      FROM messages 
      WHERE status = ? 
      ORDER BY createdAt DESC 
      LIMIT 20
    `, ['pending']);

    return NextResponse.json({
      success: true,
      count: messages.length,
      messages: messages
    });
  } catch (error) {
    console.error('Error listing pending messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        messages: []
      },
      { status: 500 }
    );
  }
}
