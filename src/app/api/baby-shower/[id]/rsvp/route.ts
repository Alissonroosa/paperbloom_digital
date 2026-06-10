import { NextRequest, NextResponse } from 'next/server';
import { babyShowerService } from '@/services/BabyShowerService';
import { validateCreateRsvp } from '@/types/baby-shower';

/**
 * POST /api/baby-shower/[id]/rsvp
 * Guest RSVP: confirm attendance, optionally reserve a gift, leave a message.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateCreateRsvp({ ...body, babyShowerId: id });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const event = await babyShowerService.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Chá de fralda não encontrado' }, { status: 404 });
    }
    if (event.status !== 'paid') {
      return NextResponse.json({ error: 'Chá de fralda não disponível' }, { status: 403 });
    }

    try {
      const rsvp = await babyShowerService.createRsvp(validation.data);
      return NextResponse.json(
        {
          success: true,
          rsvp: {
            id: rsvp.id,
            guestName: rsvp.guestName,
            attendance: rsvp.attendance,
            giftId: rsvp.giftId,
            giftQty: rsvp.giftQty,
          },
        },
        { status: 201 }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg === 'GIFT_UNAVAILABLE') {
        return NextResponse.json(
          { error: 'Este presente já foi totalmente reservado. Escolha outro.' },
          { status: 409 }
        );
      }
      if (msg === 'GIFT_NOT_FOUND') {
        return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 });
      }
      throw err;
    }
  } catch (error) {
    console.error('[API] Error creating RSVP:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create RSVP' },
      { status: 500 }
    );
  }
}
