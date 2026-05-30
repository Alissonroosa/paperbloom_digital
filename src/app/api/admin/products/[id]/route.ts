import { NextRequest, NextResponse } from 'next/server';
import { adminProductService } from '@/services/AdminProductService';
import { getSession } from '@/lib/admin-auth';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const product = await adminProductService.update(id, {
      name: body.name,
      defaultCostCents: body.defaultCostCents,
      defaultPriceCents: body.defaultPriceCents,
      active: body.active,
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error('[admin/products PATCH]', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const { id } = await params;
    const ok = await adminProductService.delete(id);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error('[admin/products DELETE]', error);
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  }
}
