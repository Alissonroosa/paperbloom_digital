import { NextRequest, NextResponse } from 'next/server';
import { cardCollectionService } from '@/services/CardCollectionService';
import { cardService } from '@/services/CardService';

/**
 * GET /api/card-collections/[id]
 * Fetches a card collection by ID with all its cards
 * 
 * Requirements: 5.1, 5.5
 * 
 * For cards with status "opened", the full content is not returned
 * to maintain the one-time viewing experience.
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing the collection ID
 * @returns JSON response with collection and cards or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Validate ID format (basic UUID validation)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'Invalid collection ID format',
          },
        },
        { status: 400, headers }
      );
    }

    // Fetch collection by ID (Requirement 5.1)
    const collection = await cardCollectionService.findById(id);

    if (!collection) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Card collection not found',
          },
        },
        { status: 404, headers }
      );
    }

    // Fetch all cards for this collection (Requirement 5.1)
    const cards = await cardService.findByCollectionId(id);

    // Filter card content based on status (Requirement 5.5)
    // For opened cards, remove sensitive content to prevent re-viewing
    const filteredCards = cards.map(card => {
      if (card.status === 'opened') {
        // Return card with limited information for opened cards
        return {
          id: card.id,
          collectionId: card.collectionId,
          order: card.order,
          title: card.title,
          status: card.status,
          openedAt: card.openedAt,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
          // Omit: messageText, imageUrl, youtubeUrl
        };
      }
      // Return full card data for unopened cards
      return card;
    });

    // Return success response with collection and filtered cards
    return NextResponse.json(
      {
        collection,
        cards: filteredCards,
      },
      { status: 200, headers }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in GET /api/card-collections/[id]:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while fetching the card collection',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/card-collections/[id]
 * Handle preflight CORS requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

/**
 * PATCH /api/card-collections/[id]
 * Updates a card collection
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing the collection ID
 * @returns JSON response with updated collection or error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { id } = params;

    // Validate ID format (basic UUID validation)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'Invalid collection ID format',
          },
        },
        { status: 400, headers }
      );
    }

    // Parse request body
    const body = await request.json();

    console.log('[API] PATCH /api/card-collections/[id] - Request:', {
      id,
      body,
    });

    // Update collection
    const collection = await cardCollectionService.update(id, body);

    if (!collection) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Card collection not found',
          },
        },
        { status: 404, headers }
      );
    }

    console.log('[API] PATCH /api/card-collections/[id] - Response:', {
      collection,
    });

    // Return success response with updated collection
    return NextResponse.json(
      {
        collection,
      },
      { status: 200, headers }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in PATCH /api/card-collections/[id]:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while updating the card collection',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500, headers }
    );
  }
}
