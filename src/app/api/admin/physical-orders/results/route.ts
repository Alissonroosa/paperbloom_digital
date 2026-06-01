import { NextRequest, NextResponse } from 'next/server';
import { physicalOrderService } from '@/services/PhysicalOrderService';
import { getSession } from '@/lib/admin-auth';

/**
 * Retorna o dashboard de resultados (KPIs + agrupamentos) em uma única chamada.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const sp = request.nextUrl.searchParams;
    const fromDate = sp.get('fromDate') ?? undefined;
    const toDate = sp.get('toDate') ?? undefined;

    const [summary, byOrderStatus, byPaymentStatus, byDeliveryType, byProduct, topCustomers] = await Promise.all([
      physicalOrderService.summary(fromDate, toDate),
      physicalOrderService.byOrderStatus(fromDate, toDate),
      physicalOrderService.byPaymentStatus(fromDate, toDate),
      physicalOrderService.byDeliveryType(fromDate, toDate),
      physicalOrderService.groupedByProduct(fromDate, toDate),
      physicalOrderService.topCustomers(fromDate, toDate, 10),
    ]);

    return NextResponse.json({
      summary,
      byOrderStatus,
      byPaymentStatus,
      byDeliveryType,
      byProduct,
      topCustomers,
    });
  } catch (error) {
    console.error('[admin/physical-orders/results]', error);
    return NextResponse.json({ error: 'Erro ao carregar resultados' }, { status: 500 });
  }
}
