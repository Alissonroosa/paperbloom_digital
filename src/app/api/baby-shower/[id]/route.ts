import { NextRequest, NextResponse } from 'next/server';
import { babyShowerService } from '@/services/BabyShowerService';

/**
 * GET /api/baby-shower/[id]
 * Fetch a baby shower by id (used by the delivery/confirmation page).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await babyShowerService.findById(id);

    if (!event) {
      return NextResponse.json({ error: 'Chá de fralda não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      babyShower: {
        id: event.id,
        babyName: event.babyName,
        hostName: event.hostName,
        partnerName: event.partnerName,
        slug: event.slug,
        dashboardSlug: event.dashboardSlug,
        qrCodeUrl: event.qrCodeUrl,
        status: event.status,
        contactName: event.contactName,
        contactEmail: event.contactEmail,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching baby shower:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch baby shower' },
      { status: 500 }
    );
  }
}
