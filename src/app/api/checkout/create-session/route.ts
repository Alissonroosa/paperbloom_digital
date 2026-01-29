import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/MessageService';
import { stripeService } from '@/services/StripeService';
import { z } from 'zod';

/**
 * POST /api/checkout/create-session
 * Creates a Stripe checkout session for a message
 * 
 * Requirements: 2.1
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

    // Validate messageId and optional contact info in request body (Requirement 2.1)
    const requestSchema = z.object({
      messageId: z.string().uuid('Message ID must be a valid UUID'),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
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

    const { messageId, contactName, contactEmail, contactPhone } = validation.data;

    // Verify message exists (Requirement 2.1)
    const message = await messageService.findById(messageId);
    
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

    // Verify message is pending (Requirement 2.1)
    if (message.status !== 'pending') {
      return NextResponse.json(
        {
          error: {
            code: 'MESSAGE_ALREADY_PAID',
            message: 'Message has already been paid for',
          },
        },
        { status: 400, headers }
      );
    }

    // Call StripeService.createCheckoutSession() (Requirement 2.1)
    // Amount is 1990 cents = R$ 19.90
    const amount = 1990;
    const { sessionId, url } = await stripeService.createCheckoutSession(
      messageId,
      amount,
      {
        contactName,
        contactEmail,
        contactPhone,
      },
      'message' // Explicitly specify product type
    );

    // Update message with stripeSessionId (Requirement 2.1)
    await messageService.updateStripeSession(messageId, sessionId);

    // Return session ID and checkout URL (Requirement 2.1)
    return NextResponse.json(
      {
        sessionId,
        url,
      },
      { status: 200, headers }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in POST /api/checkout/create-session:', error);
    
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
 * OPTIONS /api/checkout/create-session
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
