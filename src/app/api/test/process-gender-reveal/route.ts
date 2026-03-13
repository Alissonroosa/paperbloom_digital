import { NextRequest, NextResponse } from 'next/server';
import { genderRevealService } from '@/services/GenderRevealService';
import { qrCodeService } from '@/services/QRCodeService';
import { emailService } from '@/services/EmailService';
import { generateRevealSlug } from '@/types/gender-reveal';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * POST /api/test/process-gender-reveal
 * Test endpoint to manually process a gender reveal payment
 * This simulates what the webhook does
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { revealId } = await request.json();

    if (!revealId) {
      return NextResponse.json(
        { error: 'revealId is required' },
        { status: 400 }
      );
    }

    // Find the reveal
    const reveal = await genderRevealService.findById(revealId);
    if (!reveal) {
      return NextResponse.json(
        { error: 'Gender reveal not found' },
        { status: 404 }
      );
    }

    // Generate slugs
    const slug = generateRevealSlug(reveal.boyName, reveal.girlName, revealId);
    const dashboardSlug = `dashboard-${slug}`;
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const publicUrl = `${baseUrl}/revelacao-virtual/${slug}`;
    const dashboardUrl = `${baseUrl}/revelacao-virtual/dashboard/${dashboardSlug}`;
    
    // Generate QR code for public URL
    const qrCodeUrl = await qrCodeService.generate(publicUrl, revealId);

    // Update reveal with all info
    await genderRevealService.update(revealId, {
      status: 'paid',
      paymentId: `test-${Date.now()}`,
      slug,
      dashboardSlug,
      qrCodeUrl,
    });

    // Try to send email
    let emailSent = false;
    if (reveal.contactEmail) {
      try {
        const qrCodePath = path.join(process.cwd(), 'public', qrCodeUrl);
        const qrCodeBuffer = await fs.readFile(qrCodePath);
        const qrCodeBase64 = qrCodeBuffer.toString('base64');
        const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;

        const emailResult = await emailService.sendGenderRevealEmail({
          recipientEmail: reveal.contactEmail,
          recipientName: reveal.contactName || reveal.dadName,
          boyName: reveal.boyName,
          girlName: reveal.girlName,
          dadName: reveal.dadName,
          momName: reveal.momName,
          publicUrl,
          dashboardUrl,
          qrCodeDataUrl,
        });

        emailSent = emailResult.success;
        if (!emailResult.success) {
          console.error('Email send failed:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      publicUrl,
      dashboardUrl,
      deliveryUrl: `${baseUrl}/delivery/revelacao-virtual/${revealId}`,
      emailSent,
      slug,
      dashboardSlug,
      qrCodeUrl,
    });
  } catch (error) {
    console.error('Error processing test payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process payment' },
      { status: 500 }
    );
  }
}
