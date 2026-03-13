import { NextRequest, NextResponse } from 'next/server';
import { cardService } from '@/services/CardService';

/**
 * POST /api/cards/[id]/open
 * 
 * Opens a card for the first time, marking it as opened and recording the timestamp.
 * Returns the full card content only on the first opening.
 * Subsequent attempts return a message indicating the card was already opened.
 * 
 * Requirements: 4.2, 4.3, 4.4, 4.5
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing card ID
 * @returns JSON response with card data or error message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    // Validate ID format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid card ID format' },
        { status: 400 }
      );
    }

    // Check if card exists
    const existingCard = await cardService.findById(id);
    if (!existingCard) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Check if card can be opened (Requirement 4.3)
    const canOpen = await cardService.canOpen(id);
    
    if (!canOpen) {
      // Card has already been opened (Requirement 4.3, 4.5)
      // Return limited information without full content
      return NextResponse.json(
        {
          message: 'Esta carta já foi aberta anteriormente',
          card: {
            id: existingCard.id,
            title: existingCard.title,
            status: existingCard.status,
            openedAt: existingCard.openedAt,
          },
          alreadyOpened: true,
        },
        { status: 200 }
      );
    }

    // Mark card as opened (Requirements 4.2, 4.4)
    // This will update status to 'opened' and record the timestamp
    const openedCard = await cardService.markAsOpened(id);

    // Return full card content on first opening (Requirement 4.5)
    return NextResponse.json(
      {
        message: 'Carta aberta com sucesso',
        card: openedCard,
        alreadyOpened: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error opening card:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('already been opened')) {
        return NextResponse.json(
          { error: 'Esta carta já foi aberta' },
          { status: 403 }
        );
      }
      
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Carta não encontrada' },
          { status: 404 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Erro ao abrir carta' },
      { status: 500 }
    );
  }
}
