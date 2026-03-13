import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/AnalyticsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      productType: searchParams.get('productType') || undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    const result = await analyticsService.getAllOrders(options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar pedidos' },
      { status: 500 }
    );
  }
}
