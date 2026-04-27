import { NextRequest, NextResponse } from 'next/server';
import { cardService } from '@/services/CardService';

/**
 * PATCH /api/cards/[id]
 * Updates a card's title, message, or image
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { title, message, imageUrl } = body;

    console.log('[API] PATCH /api/cards/[id] - Request:', {
      id: params.id,
      body,
    });

    // Validate at least one field is provided
    if (!title && !message && imageUrl === undefined) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one field (title, message, or imageUrl) must be provided',
          },
        },
        { status: 400, headers }
      );
    }

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.messageText = message;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    console.log('[API] PATCH /api/cards/[id] - Update data:', updateData);

    // Card-lock guard: reject update if card has already been opened
    const existingCard = await cardService.findById(params.id);
    if (!existingCard) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Card not found' } },
        { status: 404, headers }
      );
    }

    if (existingCard.openedAt !== null) {
      return NextResponse.json(
        {
          error: {
            code: 'CARD_LOCKED',
            message: 'Esta carta já foi aberta e não pode ser editada',
          },
        },
        { status: 409, headers }
      );
    }

    // Update card
    const card = await cardService.update(params.id, updateData);

    console.log('[API] PATCH /api/cards/[id] - Response:', card);

    return NextResponse.json(
      {
        card,
        message: 'Card updated successfully',
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error in PATCH /api/cards/[id]:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while updating the card',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/cards/[id]
 * Handle preflight CORS requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
