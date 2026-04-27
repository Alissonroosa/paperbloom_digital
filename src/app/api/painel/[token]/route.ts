import { NextRequest, NextResponse } from 'next/server';
import { cardCollectionService } from '@/services/CardCollectionService';
import { cardService } from '@/services/CardService';

/**
 * GET /api/painel/[token]
 * Returns collection, cards, and stats for the buyer dashboard
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const collection = await cardCollectionService.findByDashboardToken(params.token);

    if (!collection) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Painel não encontrado' } },
        { status: 404, headers }
      );
    }

    const cards = await cardService.findByCollectionId(collection.id);

    const openedCards = cards.filter(c => c.status === 'opened');
    const openedAts = openedCards
      .map(c => c.openedAt)
      .filter((d): d is Date => d !== null);

    const lastOpenedAt =
      openedAts.length > 0
        ? new Date(Math.max(...openedAts.map(d => d.getTime())))
        : null;

    const stats = {
      total: cards.length,
      opened: openedCards.length,
      lastOpenedAt,
    };

    return NextResponse.json({ collection, cards, stats }, { status: 200, headers });
  } catch (error) {
    console.error('Error in GET /api/painel/[token]:', error);
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
