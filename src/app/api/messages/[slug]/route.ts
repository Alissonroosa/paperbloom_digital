import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/MessageService';

/**
 * GET /api/messages/[slug]
 * Retrieves a message by its slug
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing the slug
 * @returns JSON response with message data or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Parse slug from URL parameters (Requirement 4.1)
    const { slug } = params;

    if (!slug || slug.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_SLUG',
            message: 'Slug parameter is required',
          },
        },
        { status: 400, headers }
      );
    }

    // Call MessageService.findBySlug() (Requirement 4.1)
    const message = await messageService.findBySlug(slug);

    // Handle 404 for non-existent messages (Requirement 4.3)
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

    // Check message status (must be 'paid') (Requirement 4.4)
    if (message.status !== 'paid') {
      // Handle 402 for unpaid messages (Requirement 4.4)
      return NextResponse.json(
        {
          error: {
            code: 'PAYMENT_REQUIRED',
            message: 'This message is not available. Payment is required.',
          },
        },
        { status: 402, headers }
      );
    }

    // Increment view count (Requirement 4.5)
    await messageService.incrementViewCount(message.id);

    // Return message data (Requirement 4.2)
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
        // Enhanced message fields
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
    // Handle unexpected errors
    console.error('Error in GET /api/messages/[slug]:', error);
    
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
 * OPTIONS /api/messages/[slug]
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
