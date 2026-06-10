import { NextRequest, NextResponse } from 'next/server';
import { babyShowerService } from '@/services/BabyShowerService';
import { mercadoPagoService } from '@/services/MercadoPagoService';
import { z } from 'zod';

const checkoutSchema = z.object({
  babyShowerId: z.string().uuid('ID inválido'),
  contactName: z.string().min(1, 'Nome é obrigatório').optional(),
  contactEmail: z.string().email('Email inválido').optional(),
  contactPhone: z.string().optional(),
});

/**
 * POST /api/checkout/baby-shower
 * Create a Mercado Pago checkout session for the host fee of a baby shower.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { babyShowerId, contactName, contactEmail, contactPhone } = validation.data;

    const event = await babyShowerService.findById(babyShowerId);
    if (!event) {
      return NextResponse.json({ error: 'Baby shower not found' }, { status: 404 });
    }

    // Update contact info if provided
    if (contactName || contactEmail || contactPhone) {
      await babyShowerService.update(babyShowerId, {
        contactName: contactName || event.contactName,
        contactEmail: contactEmail || event.contactEmail,
        contactPhone: contactPhone || event.contactPhone,
      });
    }

    const { preferenceId, url } = await mercadoPagoService.createCheckoutSession(
      babyShowerId,
      'baby-shower',
      { contactName, contactEmail, contactPhone }
    );

    await babyShowerService.updatePaymentId(babyShowerId, preferenceId);

    return NextResponse.json({ success: true, preferenceId, url });
  } catch (error) {
    console.error('[API] Error creating baby shower checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
