import { NextRequest, NextResponse } from 'next/server';
import { cardCollectionService } from '@/services/CardCollectionService';
import { cardService } from '@/services/CardService';

/**
 * GET /api/card-collections/slug/[slug]
 * Fetches a card collection by slug with all its cards
 * 
 * Requirements: 5.1, 5.5
 * 
 * This endpoint is used by recipients to view their card collection.
 * For cards with status "opened", the full content is not returned
 * to maintain the one-time viewing experience.
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing the collection slug
 * @returns JSON response with collection and cards or error
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
    const { slug } = params;

    // Validate slug is not empty
    if (!slug || slug.trim() === '') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_SLUG',
            message: 'Slug cannot be empty',
          },
        },
        { status: 400, headers }
      );
    }

    // Fetch collection by slug (Requirement 5.1)
    const collection = await cardCollectionService.findBySlug(slug);

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
    const cards = await cardService.findByCollectionId(collection.id);

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
    console.error('Error in GET /api/card-collections/slug/[slug]:', error);
    
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
 * OPTIONS /api/card-collections/slug/[slug]
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
