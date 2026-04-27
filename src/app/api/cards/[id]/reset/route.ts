import { NextRequest, NextResponse } from 'next/server';
import { cardService } from '@/services/CardService';

/**
 * POST /api/cards/[id]/reset
 * Resets a card back to unopened status
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
    const card = await cardService.reset(params.id);

    return NextResponse.json({ card }, { status: 200, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('not found')) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Card not found' } },
        { status: 404, headers }
      );
    }

    console.error('Error in POST /api/cards/[id]/reset:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
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
