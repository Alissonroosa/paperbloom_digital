import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { catalogService } from '@/services/CatalogService';
import { digitalArtOrderService } from '@/services/DigitalArtOrderService';
import { mercadoPagoService } from '@/services/MercadoPagoService';

/**
 * POST /api/checkout/digital-art/create-session
 * Creates a pending digital art order and returns a Mercado Pago checkout URL.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const requestSchema = z.object({
  productSlug: z.string().min(1, 'productSlug is required'),
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: validation.error.issues.reduce(
              (acc, issue) => {
                acc[issue.path.join('.')] = issue.message;
                return acc;
              },
              {} as Record<string, string>
            ),
          },
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const { productSlug, email } = validation.data;

    // Valida que o produto existe e tem arte digital
    const product = catalogService.getProductBySlug(productSlug);
    if (!product || !product.active) {
      return NextResponse.json(
        { error: { code: 'PRODUCT_NOT_FOUND', message: 'Produto não encontrado' } },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    if (!product.art) {
      return NextResponse.json(
        { error: { code: 'PRODUCT_NOT_DIGITAL_ART', message: 'Este produto não é uma arte digital' } },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Cria pedido pendente (sem mp_preference_id ainda)
    const order = await digitalArtOrderService.createPendingOrder({
      email,
      productSlug,
      productTitle: product.title,
      amountCents: product.art.priceInCents,
    });

    // Cria preferência no Mercado Pago
    const { preferenceId, url } = await mercadoPagoService.createCheckoutSessionForArt(order.id, {
      artTitle: product.title,
      priceInCents: product.art.priceInCents,
      payerEmail: email,
    });

    // Atualiza o pedido com o mp_preference_id
    await digitalArtOrderService.updatePreferenceId(order.id, preferenceId);

    console.log(`[create-session] Pedido criado: ${order.id} (${email}) → pref ${preferenceId}`);

    return NextResponse.json({ preferenceId, url }, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    console.error('[create-session] Erro interno:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar sessão de checkout' } },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
