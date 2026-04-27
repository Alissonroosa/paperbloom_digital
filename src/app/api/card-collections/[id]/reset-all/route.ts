import { NextRequest, NextResponse } from 'next/server';
import { cardService } from '@/services/CardService';

/**
 * POST /api/card-collections/[id]/reset-all
 * Resets all cards in a collection back to unopened status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const cards = await cardService.resetAllForCollection(params.id);

    return NextResponse.json(
      { cards, count: cards.length },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error in POST /api/card-collections/[id]/reset-all:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500, headers }
    );
  }
}

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
