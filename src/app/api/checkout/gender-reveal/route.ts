import { NextRequest, NextResponse } from 'next/server';
import { genderRevealService } from '@/services/GenderRevealService';
import { mercadoPagoService } from '@/services/MercadoPagoService';
import { z } from 'zod';

const checkoutSchema = z.object({
  revealId: z.string().uuid('ID inválido'),
  contactName: z.string().min(1, 'Nome é obrigatório').optional(),
  contactEmail: z.string().email('Email inválido').optional(),
  contactPhone: z.string().optional(),
});

/**
 * POST /api/checkout/gender-reveal
 * Create a checkout session for a gender reveal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { revealId, contactName, contactEmail, contactPhone } = validation.data;

    // Find the gender reveal
    const reveal = await genderRevealService.findById(revealId);
    if (!reveal) {
      return NextResponse.json(
        { error: 'Gender reveal not found' },
        { status: 404 }
      );
    }

    // Update contact info if provided
    if (contactName || contactEmail || contactPhone) {
      await genderRevealService.update(revealId, {
        contactName: contactName || reveal.contactName,
        contactEmail: contactEmail || reveal.contactEmail,
        contactPhone: contactPhone || reveal.contactPhone,
      });
    }

    // Create Mercado Pago checkout session
    const { preferenceId, url } = await mercadoPagoService.createCheckoutSession(
      revealId,
      'gender-reveal',
      {
        contactName,
        contactEmail,
        contactPhone,
      }
    );

    // Update reveal with payment ID
    await genderRevealService.updatePaymentId(revealId, preferenceId);

    return NextResponse.json({
      success: true,
      preferenceId,
      url,
    });
  } catch (error) {
    console.error('[API] Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
