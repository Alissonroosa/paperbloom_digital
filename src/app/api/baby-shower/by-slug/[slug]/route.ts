import { NextRequest, NextResponse } from 'next/server';
import { babyShowerService } from '@/services/BabyShowerService';

/**
 * GET /api/baby-shower/by-slug/[slug]
 * Public event data for guests (increments view count) + available gifts.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await babyShowerService.findBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: 'Chá de fralda não encontrado' }, { status: 404 });
    }

    if (event.status !== 'paid') {
      return NextResponse.json({ error: 'Chá de fralda não disponível' }, { status: 403 });
    }

    await babyShowerService.incrementViewCount(event.id);

    const gifts = await babyShowerService.getPublicGifts(event.id);

    return NextResponse.json({
      babyShower: {
        id: event.id,
        babyName: event.babyName,
        babyGender: event.babyGender,
        hostName: event.hostName,
        partnerName: event.partnerName,
        welcomeMessage: event.welcomeMessage,
        eventDate: event.eventDate,
        locationName: event.locationName,
        locationAddress: event.locationAddress,
        locationMapsUrl: event.locationMapsUrl,
        photos: event.photos,
        primaryColor: event.primaryColor,
        theme: event.theme,
      },
      gifts: gifts.map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        diaperSize: g.diaperSize,
        qtyDesired: g.qtyDesired,
        qtyReserved: g.qtyReserved,
        qtyAvailable: g.qtyAvailable,
        priceCents: g.priceCents,
      })),
    });
  } catch (error) {
    console.error('[API] Error getting baby shower by slug:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get baby shower' },
      { status: 500 }
    );
  }
}
