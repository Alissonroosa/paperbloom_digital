import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/services/StripeService';

/**
 * GET /api/checkout/session
 * Retrieves checkout session details including messageId from metadata
 * Used by success page to redirect to delivery page
 * 
 * @param request - Next.js request object with session_id query param
 * @returns JSON response with messageId or error
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_SESSION_ID',
            message: 'Session ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripeService.getCheckoutSession(sessionId);

    // Extract messageId or collectionId from metadata
    const messageId = session.metadata?.messageId;
    const collectionId = session.metadata?.collectionId;
    const productType = session.metadata?.productType;

    if (!messageId && !collectionId) {
      return NextResponse.json(
        {
          error: {
            code: 'ITEM_ID_NOT_FOUND',
            message: 'Message ID or Collection ID not found in session metadata',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        messageId,
        collectionId,
        productType,
        sessionId: session.id,
        paymentStatus: session.payment_status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/checkout/session:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while retrieving session',
        },
      },
      { status: 500 }
    );
  }
}
