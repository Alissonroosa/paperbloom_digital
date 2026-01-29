import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/services/EmailService';
import QRCode from 'qrcode';

/**
 * POST /api/test/send-qrcode-email
 * Test endpoint for QR code email sending
 * 
 * This is a test-only endpoint to verify email integration
 * DO NOT use in production
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      recipientEmail,
      recipientName,
      messageUrl,
      senderName,
      messageTitle,
    } = body;

    // Validate required fields
    if (!recipientEmail || !recipientName || !messageUrl || !senderName || !messageTitle) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['recipientEmail', 'recipientName', 'messageUrl', 'senderName', 'messageTitle'],
        },
        { status: 400 }
      );
    }

    // Generate a test QR code
    const qrCodeDataUrl = await QRCode.toDataURL(messageUrl, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    // Send email
    const result = await emailService.sendQRCodeEmail({
      recipientEmail,
      recipientName,
      messageUrl,
      qrCodeDataUrl,
      senderName,
      messageTitle,
    });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          messageId: result.messageId,
          message: 'Email sent successfully',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: 'Failed to send email',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in test email endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error sending test email',
      },
      { status: 500 }
    );
  }
}
