import { NextResponse } from 'next/server';
import { priceService } from '@/services/PriceService';

// Cache por 60 segundos para não sobrecarregar o banco
export const revalidate = 60;

export async function GET() {
  try {
    const prices = await priceService.getAllPrices();
    
    // Formatar para uso no frontend
    const formattedPrices = prices.reduce((acc, price) => {
      acc[price.productId] = {
        productId: price.productId,
        productName: price.productName,
        priceCents: price.priceCents,
        priceFromCents: price.priceFromCents,
        priceFormatted: formatCurrency(price.priceCents),
        priceFromFormatted: price.priceFromCents ? formatCurrency(price.priceFromCents) : null,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(formattedPrices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Fallback para preços padrão em caso de erro
    return NextResponse.json({
      message: {
        productId: 'message',
        priceCents: 1990,
        priceFormatted: 'R$ 19,90',
        priceFromCents: null,
        priceFromFormatted: null,
      },
      'card-collection': {
        productId: 'card-collection',
        priceCents: 2990,
        priceFormatted: 'R$ 29,90',
        priceFromCents: null,
        priceFromFormatted: null,
      },
      'gender-reveal': {
        productId: 'gender-reveal',
        priceCents: 1990,
        priceFormatted: 'R$ 19,90',
        priceFromCents: null,
        priceFromFormatted: null,
      },
    });
  }
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}
