import { NextRequest, NextResponse } from 'next/server';
import { priceService } from '@/services/PriceService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const history = await priceService.getPriceHistory(productId, limit);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Price history error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar histórico' },
      { status: 500 }
    );
  }
}
