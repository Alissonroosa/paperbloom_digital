import { NextRequest, NextResponse } from 'next/server';
import { cardCollectionService } from '@/services/CardCollectionService';
import { stripeService } from '@/services/StripeService';
import { z } from 'zod';

/**
 * POST /api/checkout/card-collection
 * Creates a Stripe checkout session for a card collection
 * 
 * Requirements: 6.1, 6.2
 * 
 * @param request - Next.js request object
 * @returns JSON response with session ID and checkout URL or error
 */
export async function POST(request: NextRequest) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Parse and validate JSON request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON format in request body',
          },
        },
        { status: 400, headers }
      );
    }

    // Validate collectionId in request body (Requirement 6.1)
    const requestSchema = z.object({
      collectionId: z.string().uuid('Collection ID must be a valid UUID'),
    });

    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: validation.error.issues.reduce((acc, issue) => {
              acc[issue.path.join('.')] = issue.message;
              return acc;
            }, {} as Record<string, string>),
          },
        },
        { status: 400, headers }
      );
    }

    const { collectionId } = validation.data;

    // Verify card collection exists (Requirement 6.1)
    const collection = await cardCollectionService.findById(collectionId);
    
    if (!collection) {
      return NextResponse.json(
        {
          error: {
            code: 'COLLECTION_NOT_FOUND',
            message: 'Card collection not found',
          },
        },
        { status: 404, headers }
      );
    }

    // Verify collection is pending (Requirement 6.1)
    if (collection.status !== 'pending') {
      return NextResponse.json(
        {
          error: {
            code: 'COLLECTION_ALREADY_PAID',
            message: 'Card collection has already been paid for',
          },
        },
        { status: 400, headers }
      );
    }

    // Call StripeService.createCheckoutSession() (Requirement 6.1, 6.2)
    // Amount is 2990 cents = R$ 29.90 for "12 Cartas" product (promotional price, was R$ 49.90)
    const amount = 2990;
    const { sessionId, url } = await stripeService.createCheckoutSession(
      collectionId,
      amount,
      {
        contactName: collection.senderName,
        contactEmail: collection.contactEmail || undefined,
      },
      'card-collection' // Specify product type for card collection
    );

    // Update collection with stripeSessionId (Requirement 6.1)
    await cardCollectionService.updateStripeSession(collectionId, sessionId);

    // Return session ID and checkout URL (Requirement 6.1)
    return NextResponse.json(
      {
        sessionId,
        url,
      },
      { status: 200, headers }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in POST /api/checkout/card-collection:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while creating checkout session',
        },
      },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/checkout/card-collection
 * Handle preflight CORS requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
