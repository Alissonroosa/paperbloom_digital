import { NextRequest, NextResponse } from 'next/server';
import { physicalOrderService } from '@/services/PhysicalOrderService';
import { getSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const sp = request.nextUrl.searchParams;
    const fromDate = sp.get('fromDate') ?? undefined;
    const toDate = sp.get('toDate') ?? undefined;
    const grouped = sp.get('grouped') === '1';

    if (grouped) {
      const data = await physicalOrderService.groupedByProduct(fromDate, toDate);
      return NextResponse.json({ grouped: data });
    }

    const summary = await physicalOrderService.summary(fromDate, toDate);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('[admin/physical-orders summary]', error);
    return NextResponse.json({ error: 'Erro ao carregar resumo' }, { status: 500 });
  }
}
