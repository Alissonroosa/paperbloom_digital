import { NextRequest, NextResponse } from 'next/server';
import { babyShowerService } from '@/services/BabyShowerService';

/**
 * GET /api/baby-shower/dashboard/[slug]
 * Host dashboard: confirmations, gifts (reserved/available), messages.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await babyShowerService.findByDashboardSlug(slug);

    if (!event) {
      return NextResponse.json({ error: 'Painel não encontrado' }, { status: 404 });
    }
    if (event.status !== 'paid') {
      return NextResponse.json({ error: 'Painel não disponível' }, { status: 403 });
    }

    const stats = await babyShowerService.getStats(event.id);

    // Map gift_id -> guest names for the gift breakdown (across all reserved gifts)
    const reservationsByGift = new Map<string, { guestName: string; qty: number }[]>();
    for (const r of stats.rsvps) {
      for (const g of r.gifts) {
        const list = reservationsByGift.get(g.giftId) ?? [];
        list.push({ guestName: r.guestName, qty: g.qty });
        reservationsByGift.set(g.giftId, list);
      }
    }

    return NextResponse.json({
      babyShower: {
        id: event.id,
        babyName: event.babyName,
        babyGender: event.babyGender,
        hostName: event.hostName,
        partnerName: event.partnerName,
        eventDate: event.eventDate,
        locationName: event.locationName,
        slug: event.slug,
        qrCodeUrl: event.qrCodeUrl,
        createdAt: event.createdAt,
      },
      stats: {
        totalRsvps: stats.totalRsvps,
        confirmedYes: stats.confirmedYes,
        confirmedNo: stats.confirmedNo,
        confirmedMaybe: stats.confirmedMaybe,
        viewCount: stats.viewCount,
      },
      rsvps: stats.rsvps.map((r) => ({
        id: r.id,
        guestName: r.guestName,
        attendance: r.attendance,
        message: r.message,
        gifts: r.gifts.map((g) => ({
          giftId: g.giftId,
          qty: g.qty,
          name: g.giftName,
          category: g.giftCategory,
          diaperSize: g.diaperSize,
        })),
        createdAt: r.createdAt,
      })),
      gifts: stats.gifts.map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        diaperSize: g.diaperSize,
        qtyDesired: g.qtyDesired,
        qtyReserved: g.qtyReserved,
        qtyAvailable: Math.max(0, g.qtyDesired - g.qtyReserved),
        priceCents: g.priceCents,
        reservedBy: reservationsByGift.get(g.id) ?? [],
      })),
    });
  } catch (error) {
    console.error('[API] Error getting baby shower dashboard:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get dashboard' },
      { status: 500 }
    );
  }
}
