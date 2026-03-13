import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/MessageService';
import { slugService } from '@/services/SlugService';
import { qrCodeService } from '@/services/QRCodeService';
import { emailService } from '@/services/EmailService';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * POST /api/test/update-message-status
 * Fallback endpoint to update message status to 'paid' and generate QR code
 * Also sends email with QR code to ensure user receives it even if webhook fails
 * 
 * This is called by the success page as a fallback mechanism
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_MESSAGE_ID',
            message: 'Message ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Verify message exists
    const message = await messageService.findById(messageId);
    
    if (!message) {
      return NextResponse.json(
        {
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Message not found',
          },
        },
        { status: 404 }
      );
    }

    // Update message status to 'paid'
    await messageService.updateStatus(messageId, 'paid');
    
    // Generate slug (format: /mensagem/{name}/{id})
    const slug = slugService.generateSlug(message.recipientName, messageId);
    
    // Generate full URL for QR code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}${slug}`;
    
    // Generate QR code
    const qrCodeUrl = await qrCodeService.generate(fullUrl, messageId);
    
    // Update message with slug and qrCodeUrl
    await messageService.updateQRCode(messageId, qrCodeUrl, slug);
    
    console.log(`📍 Message URL: ${fullUrl}`);
    
    console.log(`✅ Successfully updated message ${messageId} to 'paid' status`);
    console.log(`   QR Code: ${qrCodeUrl}`);
    console.log(`   Slug: ${slug}`);
    console.log(`   URL: ${fullUrl}`);

    // Send QR code email (same as webhook does)
    try {
      console.log('[Fallback] Attempting to send QR code email...');
      
      // Read QR code file and convert to base64 data URL
      const qrCodePath = path.join(process.cwd(), 'public', qrCodeUrl);
      const qrCodeBuffer = await fs.readFile(qrCodePath);
      const qrCodeBase64 = qrCodeBuffer.toString('base64');
      const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;
      
      // Get contact email from message
      const contactEmail = message.contactEmail;
      const contactName = message.contactName || message.senderName;
      
      console.log('[Fallback] Email delivery check:', {
        messageEmail: message.contactEmail,
        finalEmail: contactEmail,
        contactName: contactName,
      });
      
      if (contactEmail) {
        console.log('[Fallback] Preparing to send email to:', contactEmail);
        
        const emailResult = await emailService.sendQRCodeEmail({
          recipientEmail: contactEmail,
          recipientName: contactName,
          messageUrl: fullUrl,
          qrCodeDataUrl: qrCodeDataUrl,
          senderName: message.senderName,
          messageTitle: message.title || `Mensagem para ${message.recipientName}`,
        });
        
        if (emailResult.success) {
          console.log(`[Fallback] ✅ Successfully sent QR code email for message ${messageId}`, {
            emailMessageId: emailResult.messageId,
            recipientEmail: contactEmail,
          });
        } else {
          console.error(`[Fallback] ❌ Failed to send QR code email for message ${messageId}`, {
            error: emailResult.error,
            recipientEmail: contactEmail,
          });
        }
      } else {
        console.warn(`[Fallback] ⚠️ No contact email found for message ${messageId}, skipping email send`);
      }
    } catch (emailError) {
      // Log but don't fail the request
      console.error('[Fallback] ❌ Error sending QR code email:', {
        messageId,
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
      });
    }

    return NextResponse.json(
      {
        success: true,
        messageId,
        status: 'paid',
        qrCodeUrl,
        slug,
        fullUrl,
        deliveryUrl: `${baseUrl}/delivery/${messageId}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/test/update-message-status:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
