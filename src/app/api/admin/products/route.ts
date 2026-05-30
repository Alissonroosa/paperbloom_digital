import { NextRequest, NextResponse } from 'next/server';
import { adminProductService } from '@/services/AdminProductService';
import { getSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === '1';
    const products = await adminProductService.listAll(includeInactive);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[admin/products GET]', error);
    return NextResponse.json({ error: 'Erro ao listar produtos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await request.json();
    const { name, defaultCostCents, defaultPriceCents, active } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const product = await adminProductService.create({
      name,
      defaultCostCents,
      defaultPriceCents,
      active,
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('[admin/products POST]', error);
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}
