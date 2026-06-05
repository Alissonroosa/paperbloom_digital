import { NextRequest, NextResponse } from 'next/server';
import { cardCollectionService } from '@/services/CardCollectionService';
import { mercadoPagoService } from '@/services/MercadoPagoService';
import { z } from 'zod';

/**
 * POST /api/checkout/card-collection
 * Creates a Mercado Pago checkout preference for a card collection
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

    const collection = await cardCollectionService.findById(collectionId);
    if (!collection) {
      return NextResponse.json(
        { error: { code: 'COLLECTION_NOT_FOUND', message: 'Card collection not found' } },
        { status: 404, headers }
      );
    }

    if (collection.status !== 'pending') {
      return NextResponse.json(
        { error: { code: 'COLLECTION_ALREADY_PAID', message: 'Card collection has already been paid for' } },
        { status: 400, headers }
      );
    }

    // Prioriza o nome do comprador (preenchido no Step 5). Cai pra senderName
    // só como fallback (ex.: edge case onde o form não foi preenchido).
    const { preferenceId, url } = await mercadoPagoService.createCheckoutSession(
      collectionId,
      'card-collection',
      {
        contactName: collection.contactName || collection.senderName,
        contactEmail: collection.contactEmail || undefined,
      }
    );

    await cardCollectionService.updatePaymentId(collectionId, preferenceId);

    return NextResponse.json({ preferenceId, url }, { status: 200, headers });
  } catch (error) {
    console.error('Error in POST /api/checkout/card-collection:', error);
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
