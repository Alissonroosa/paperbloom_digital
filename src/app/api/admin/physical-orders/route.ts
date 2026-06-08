import { NextRequest, NextResponse } from 'next/server';
import { physicalOrderService, type OrderFilters, type DeliveryType, type PaymentStatus, type OrderStatus } from '@/services/PhysicalOrderService';
import { getSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const sp = request.nextUrl.searchParams;
    const filters: OrderFilters = {};
    const ps = sp.get('paymentStatus');
    const os = sp.get('orderStatus');
    const pid = sp.get('productId');
    const q = sp.get('search');
    const pq = sp.get('productSearch');
    const fd = sp.get('fromDate');
    const td = sp.get('toDate');
    if (ps) filters.paymentStatus = ps as PaymentStatus;
    if (os) filters.orderStatus = os as OrderStatus;
    if (pid) filters.productId = pid;
    if (q) filters.search = q;
    if (pq) filters.productSearch = pq;
    if (fd) filters.fromDate = fd;
    if (td) filters.toDate = td;

    const orders = await physicalOrderService.list(filters);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[admin/physical-orders GET]', error);
    return NextResponse.json({ error: 'Erro ao listar pedidos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    if (!body.customerName || !body.productName) {
      return NextResponse.json(
        { error: 'customerName e productName são obrigatórios' },
        { status: 400 }
      );
    }

    const order = await physicalOrderService.create({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerCity: body.customerCity,
      productId: body.productId,
      productName: body.productName,
      quantity: body.quantity,
      costCents: body.costCents,
      priceCents: body.priceCents,
      productionDays: body.productionDays,
      orderDate: body.orderDate,
      deliveryDate: body.deliveryDate,
      deliveryType: body.deliveryType as DeliveryType | undefined,
      paymentStatus: body.paymentStatus as PaymentStatus | undefined,
      orderStatus: body.orderStatus as OrderStatus | undefined,
      notes: body.notes,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('[admin/physical-orders POST]', error);
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
  }
}
