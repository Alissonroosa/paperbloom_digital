import { NextRequest, NextResponse } from 'next/server';
import { babyShowerService } from '@/services/BabyShowerService';
import { qrCodeService } from '@/services/QRCodeService';
import { generateBabyShowerSlug } from '@/types/baby-shower';
import { CATALOG_DIAPERS, CATALOG_MIMOS } from '@/config/baby-shower-catalog';

/**
 * GET /api/test/seed-baby-shower
 * Dev-only: creates a fully "paid" baby shower (with gifts, slugs and QR) so the
 * product can be tested end-to-end without going through Mercado Pago.
 *
 * Query params (all optional):
 *   - redirect=public | dashboard | delivery (default: public) — where to send the browser
 *   - json=1 — return the links as JSON instead of redirecting
 *
 * Just open in the browser:  http://localhost:3000/api/test/seed-baby-shower
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get('redirect') || 'public';
    const asJson = searchParams.get('json') === '1';

    // 1. Create the event with a sample gift list (from the base catalog)
    const event = await babyShowerService.create({
      babyName: 'Helena',
      babyGender: 'menina',
      hostName: 'Mariana',
      partnerName: 'Lucas',
      welcomeMessage: 'Estamos muito felizes em compartilhar esse momento com você! Sua presença é o nosso maior presente. 💕',
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 dias
      locationName: 'Salão de Festas Jardim',
      locationAddress: 'Rua das Flores, 123 — São Paulo, SP',
      locationMapsUrl: 'https://maps.google.com',
      guestCount: 30,
      photos: [],
      primaryColor: '#E6C2C2',
      theme: 'safari',
      contactName: 'Mariana',
      contactEmail: 'teste@exemplo.com',
      contactPhone: '(11) 99999-9999',
      // Seed all 5 diaper sizes + several mimos so the gift modal has rich options
      gifts: [...CATALOG_DIAPERS, ...CATALOG_MIMOS.slice(0, 5)].map((c) => ({
        name: c.name,
        category: c.category,
        diaperSize: c.diaperSize,
        qtyDesired: c.defaultQty,
        priceCents: c.priceCents,
        isCustom: false,
      })),
    });

    // 2. Generate slugs + (optional) QR, mark as paid — same as the webhook
    const slug = generateBabyShowerSlug(event.hostName, event.babyName, event.id);
    const dashboardSlug = `dashboard-${slug}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const publicUrl = `${baseUrl}/cha-de-fralda/${slug}`;
    const dashboardUrl = `${baseUrl}/cha-de-fralda/dashboard/${dashboardSlug}`;
    const deliveryUrl = `${baseUrl}/delivery/cha-de-fralda/${event.id}`;

    let qrCodeUrl: string | null = null;
    try {
      qrCodeUrl = await qrCodeService.generate(publicUrl, event.id);
    } catch (qrError) {
      // R2 may not be configured locally — QR is optional for visual testing
      console.warn('[seed-baby-shower] QR code generation skipped:', qrError instanceof Error ? qrError.message : qrError);
    }

    await babyShowerService.update(event.id, {
      status: 'paid',
      paymentId: `test-${Date.now()}`,
      slug,
      dashboardSlug,
      ...(qrCodeUrl ? { qrCodeUrl } : {}),
    });

    const links = { publicUrl, dashboardUrl, deliveryUrl, slug, dashboardSlug, qrCodeUrl, id: event.id };

    if (asJson) {
      return NextResponse.json({ success: true, ...links });
    }

    const target =
      redirectTo === 'dashboard' ? dashboardUrl : redirectTo === 'delivery' ? deliveryUrl : publicUrl;
    return NextResponse.redirect(target);
  } catch (error) {
    console.error('[seed-baby-shower] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to seed baby shower' },
      { status: 500 }
    );
  }
}
