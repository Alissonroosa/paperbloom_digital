import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/MessageService';
import { mercadoPagoService } from '@/services/MercadoPagoService';
import { z } from 'zod';

/**
 * POST /api/checkout/create-session
 * Creates a Mercado Pago checkout preference for a message
 */
export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON format in request body' } },
        { status: 400, headers }
      );
    }

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

    const message = await messageService.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { error: { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' } },
        { status: 404, headers }
      );
    }

    if (message.status !== 'pending') {
      return NextResponse.json(
        { error: { code: 'MESSAGE_ALREADY_PAID', message: 'Message has already been paid for' } },
        { status: 400, headers }
      );
    }

    const { preferenceId, url } = await mercadoPagoService.createCheckoutSession(
      messageId,
      'message',
      { contactName, contactEmail, contactPhone }
    );

    await messageService.updatePaymentId(messageId, preferenceId);

    return NextResponse.json({ preferenceId, url }, { status: 200, headers });
  } catch (error) {
    console.error('Error in POST /api/checkout/create-session:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred while creating checkout session' } },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
