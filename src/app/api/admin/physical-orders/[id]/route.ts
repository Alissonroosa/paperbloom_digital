import { NextRequest, NextResponse } from 'next/server';
import { physicalOrderService, type DeliveryType, type PaymentStatus, type OrderStatus } from '@/services/PhysicalOrderService';
import { getSession } from '@/lib/admin-auth';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const order = await physicalOrderService.update(id, {
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

    if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error('[admin/physical-orders PATCH]', error);
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { id } = await params;
    const ok = await physicalOrderService.delete(id);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error('[admin/physical-orders DELETE]', error);
    return NextResponse.json({ error: 'Erro ao remover pedido' }, { status: 500 });
  }
}
