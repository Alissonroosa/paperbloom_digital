import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/services/StripeService';
import { messageService } from '@/services/MessageService';

/**
 * GET /api/messages/by-session
 * Fetch message data using Stripe session ID
 * Requirements: 3.4, 7.5
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id parameter is required' },
        { status: 400 }
      );
    }

    // Retrieve the Stripe session
    const session = await stripeService.getCheckoutSession(sessionId);

    // Extract messageId from session metadata
    const messageId = session.metadata?.messageId;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID not found in session metadata' },
        { status: 404 }
      );
    }

    // Fetch the message from database
    const message = await messageService.findById(messageId);

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Return message data with QR code and link
    return NextResponse.json({
      id: message.id,
      recipientName: message.recipientName,
      senderName: message.senderName,
      slug: message.slug,
      qrCodeUrl: message.qrCodeUrl,
      status: message.status,
    });
  } catch (error) {
    console.error('Error fetching message by session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch message data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
