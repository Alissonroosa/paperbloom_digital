import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/MessageService';

/**
 * GET /api/messages/id/[messageId]
 * Retrieves a message by its ID
 * Used by the delivery page to display QR code and message details
 * 
 * Requirements: 11.1, 11.2, 11.3
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing the messageId
 * @returns JSON response with message data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Parse messageId from URL parameters
    const { messageId } = params;

    if (!messageId || messageId.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_MESSAGE_ID',
            message: 'Message ID parameter is required',
          },
        },
        { status: 400, headers }
      );
    }

    // Call MessageService.findById()
    const message = await messageService.findById(messageId);

    // Handle 404 for non-existent messages
    if (!message) {
      return NextResponse.json(
        {
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Message not found',
          },
        },
        { status: 404, headers }
      );
    }

    // Return message data including QR code URL and slug
    // Requirements: 11.2, 11.3
    return NextResponse.json(
      {
        id: message.id,
        recipientName: message.recipientName,
        senderName: message.senderName,
        slug: message.slug,
        qrCodeUrl: message.qrCodeUrl,
        status: message.status,
        title: message.title,
        messageText: message.messageText,
        imageUrl: message.imageUrl,
        youtubeUrl: message.youtubeUrl,
        specialDate: message.specialDate?.toISOString() || null,
        closingMessage: message.closingMessage,
        signature: message.signature,
        galleryImages: message.galleryImages || [],
        createdAt: message.createdAt.toISOString(),
        // Theme customization fields
        backgroundColor: message.backgroundColor,
        theme: message.theme,
        customEmoji: message.customEmoji,
        musicStartTime: message.musicStartTime,
        showTimeCounter: message.showTimeCounter,
        timeCounterLabel: message.timeCounterLabel,
      },
      { status: 200, headers }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in GET /api/messages/id/[messageId]:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while retrieving the message',
        },
      },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/messages/id/[messageId]
 * Handle preflight CORS requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
