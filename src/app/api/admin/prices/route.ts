import { NextRequest, NextResponse } from 'next/server';
import { priceService } from '@/services/PriceService';
import { getSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const prices = await priceService.getAllPrices();
    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Prices error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar preços' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    const { productId, priceCents, priceFromCents, reason } = await request.json();

    if (!productId || priceCents === undefined) {
      return NextResponse.json(
        { error: 'productId e priceCents são obrigatórios' },
        { status: 400 }
      );
    }

    if (priceCents < 0) {
      return NextResponse.json(
        { error: 'Preço não pode ser negativo' },
        { status: 400 }
      );
    }

    const updated = await priceService.updatePrice(
      productId,
      priceCents,
      priceFromCents || null,
      session?.user.id,
      reason
    );

    return NextResponse.json({ price: updated });
  } catch (error) {
    console.error('Update price error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar preço' },
      { status: 500 }
    );
  }
}
