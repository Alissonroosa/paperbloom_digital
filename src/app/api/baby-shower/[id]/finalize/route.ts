import { NextRequest, NextResponse } from 'next/server';
import { babyShowerService } from '@/services/BabyShowerService';
import { emailService } from '@/services/EmailService';
import { loadQRCodeAsDataUrl } from '@/lib/qr-utils';

/**
 * POST /api/baby-shower/[id]/finalize
 *
 * Free-launch finalization: marks the event as published (slugs + QR), then
 * emails the host the public + dashboard links. This replaces the paid Mercado
 * Pago checkout while the product is offered for free.
 *
 * When paid checkout is re-enabled, this endpoint can stay as-is (or be gated):
 * the actual money flow lives in /api/checkout/baby-shower + the webhook, which
 * are intentionally left intact.
 *
 * Idempotent: calling it again on an already-finalized event re-sends nothing
 * new and just returns the existing links.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { event, publicUrl, dashboardUrl, alreadyFinalized } = await babyShowerService.finalizeFree(id);

    // Send the host email only on first finalization (avoid duplicates).
    if (!alreadyFinalized) {
      const contactEmail = event.contactEmail;
      if (contactEmail) {
        try {
          const qrCodeDataUrl = event.qrCodeUrl ? await loadQRCodeAsDataUrl(event.qrCodeUrl) : '';
          const emailResult = await emailService.sendBabyShowerEmail({
            recipientEmail: contactEmail,
            recipientName: event.contactName || event.hostName,
            hostName: event.hostName,
            partnerName: event.partnerName,
            babyName: event.babyName,
            publicUrl,
            dashboardUrl,
            qrCodeDataUrl,
          });
          if (!emailResult.success) {
            console.error(`[finalize] Failed to send baby shower email for ${id}:`, emailResult.error);
          }
        } catch (emailError) {
          console.error(`[finalize] Error sending baby shower email for ${id}:`, emailError);
        }
      } else {
        console.warn(`[finalize] No contact email for baby shower ${id} — skipping email`);
      }
    }

    return NextResponse.json({
      success: true,
      id: event.id,
      slug: event.slug,
      dashboardSlug: event.dashboardSlug,
      publicUrl,
      dashboardUrl,
      deliveryUrl: `${process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin}/delivery/cha-de-fralda/${event.id}`,
    });
  } catch (error) {
    console.error('[API] Error finalizing baby shower:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to finalize baby shower' },
      { status: 500 }
    );
  }
}
