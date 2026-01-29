import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/MessageService';

/**
 * GET /api/messages/mensagem/[recipient]/[id]
 * Retrieves a message by recipient name and ID for public viewing
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing recipient and id
 * @returns JSON response with message data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { recipient: string; id: string } }
) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { id } = params;

    if (!id || id.trim().length === 0) {
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

    // Find message by ID
    const message = await messageService.findById(id);

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

    // Check if message is paid (only paid messages can be viewed publicly)
    if (message.status !== 'paid') {
      return NextResponse.json(
        {
          error: {
            code: 'MESSAGE_NOT_AVAILABLE',
            message: 'This message is not yet available',
          },
        },
        { status: 402, headers }
      );
    }

    // Increment view count
    try {
      await messageService.incrementViewCount(id);
    } catch (error) {
      // Log but don't fail the request if view count increment fails
      console.error('Failed to increment view count:', error);
    }

    // Return message data for public viewing
    return NextResponse.json(
      {
        id: message.id,
        recipientName: message.recipientName,
        senderName: message.senderName,
        messageText: message.messageText,
        imageUrl: message.imageUrl,
        youtubeUrl: message.youtubeUrl,
        qrCodeUrl: message.qrCodeUrl,
        viewCount: message.viewCount + 1, // Return incremented count
        createdAt: message.createdAt.toISOString(),
        title: message.title,
        specialDate: message.specialDate?.toISOString() || null,
        closingMessage: message.closingMessage,
        signature: message.signature,
        galleryImages: message.galleryImages || [],
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
    console.error('Error in GET /api/messages/mensagem/[recipient]/[id]:', error);
    
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
 * OPTIONS /api/messages/mensagem/[recipient]/[id]
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
