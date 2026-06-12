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
    // Aceita `messageText` (nome canônico do schema, usado pelo editor)
    // ou `message` (legado, usado pelo painel pós-compra EditarTab).
    // Antes só lia `message`, então edição no editor durante criação não salvava o texto.
    const { title, messageText, message, imageUrl, youtubeUrl } = body;
    const resolvedMessage = messageText !== undefined ? messageText : message;

    console.log('[API] PATCH /api/cards/[id] - Request:', {
      id: params.id,
      body,
    });

    // Validate at least one field is provided
    if (title === undefined && resolvedMessage === undefined && imageUrl === undefined && youtubeUrl === undefined) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one field (title, messageText, imageUrl, youtubeUrl) must be provided',
          },
        },
        { status: 400, headers }
      );
    }

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (resolvedMessage !== undefined) updateData.messageText = resolvedMessage;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;

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
