import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService } from '@/services/MercadoPagoService';

/**
 * GET /api/checkout/session
 * Retrieves payment details from Mercado Pago
 * Used by success page to get messageId/collectionId and redirect to delivery
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PAYMENT_ID', message: 'Payment ID is required' } },
        { status: 400 }
      );
    }

    // Retrieve payment from Mercado Pago
    const payment = await mercadoPagoService.getPayment(paymentId);

    // Mercado Pago converts camelCase metadata to snake_case
    const metadata = payment.metadata;
    const messageId = metadata.message_id || metadata.messageId;
    const collectionId = metadata.collection_id || metadata.collectionId;
    const revealId = metadata.reveal_id || metadata.revealId;
    const productType = metadata.product_type || metadata.productType;

    if (!messageId && !collectionId && !revealId) {
      return NextResponse.json(
        { error: { code: 'ITEM_ID_NOT_FOUND', message: 'Message ID, Collection ID or Reveal ID not found in payment metadata' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        messageId,
        collectionId,
        revealId,
        productType,
        paymentId: payment.id,
        paymentStatus: payment.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/checkout/session:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred while retrieving payment' } },
      { status: 500 }
    );
  }
}
