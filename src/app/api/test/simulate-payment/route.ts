import { NextRequest, NextResponse } from 'next/server';
import { cardCollectionService } from '@/services/CardCollectionService';
import { messageService } from '@/services/MessageService';
import { cardService } from '@/services/CardService';
import { qrCodeService } from '@/services/QRCodeService';
import { slugService } from '@/services/SlugService';
import { emailService } from '@/services/EmailService';

/**
 * POST /api/test/simulate-payment
 * 
 * Simulates a successful payment for testing purposes.
 * This bypasses Mercado Pago and directly processes the payment.
 * 
 * Also supports creating test records with action: 'create-test'
 * 
 * ⚠️ FOR TESTING ONLY - Do not use in production!
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { type, collectionId, messageId, action } = body;

    // Handle create-test action
    if (action === 'create-test') {
      if (type === 'card-collection') {
        // Create a test card collection
        const collection = await cardCollectionService.create({
          recipientName: 'Teste Destinatário',
          senderName: 'Teste Remetente',
          contactEmail: 'teste@example.com',
        });

        // Create 12 cards
        const cards = await cardService.createBulk(collection.id);

        return NextResponse.json({
          success: true,
          message: 'Test card collection created',
          collection,
          cardsCount: cards.length,
        });
      } else if (type === 'message') {
        // Create a test message
        const message = await messageService.create({
          recipientName: 'Teste Destinatário',
          senderName: 'Teste Remetente',
          messageText: 'Esta é uma mensagem de teste criada automaticamente para fins de desenvolvimento.',
          contactEmail: 'teste@example.com',
          galleryImages: [],
        });

        return NextResponse.json({
          success: true,
          message: 'Test message created',
          messageData: message,
        });
      }
    }

    if (type === 'card-collection') {
      if (!collectionId) {
        return NextResponse.json(
          { error: 'collectionId is required' },
          { status: 400 }
        );
      }

      // Find the collection
      const collection = await cardCollectionService.findById(collectionId);
      if (!collection) {
        return NextResponse.json(
          { error: `Card collection not found: ${collectionId}` },
          { status: 404 }
        );
      }

      // Check if already paid
      if (collection.status === 'paid') {
        return NextResponse.json(
          { 
            error: 'Collection already paid',
            slug: collection.slug,
            qrCodeUrl: collection.qrCodeUrl,
          },
          { status: 400 }
        );
      }

      // Simulate payment processing
      const fakePaymentId = `TEST_${Date.now()}`;
      
      // Update status to paid
      await cardCollectionService.updateStatus(collectionId, 'paid');
      await cardCollectionService.updatePaymentId(collectionId, fakePaymentId);

      // Generate slug and QR code
      const slug = slugService.generateSlug(collection.recipientName, collectionId, 'c');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const fullUrl = `${baseUrl}${slug}`;
      const qrCodeUrl = await qrCodeService.generate(fullUrl, collectionId);
      
      // Update collection with slug and QR code
      await cardCollectionService.updateQRCode(collectionId, qrCodeUrl, slug);

      // Fetch updated collection
      const updatedCollection = await cardCollectionService.findById(collectionId);

      // Send email if contact email exists
      let emailResult = null;
      if (collection.contactEmail) {
        try {
          emailResult = await emailService.sendCardCollectionEmail({
            recipientEmail: collection.contactEmail,
            recipientName: collection.recipientName,
            senderName: collection.senderName,
            collectionUrl: fullUrl,
            qrCodeDataUrl: qrCodeUrl,
          });
          console.log('[SimulatePayment] Email sent:', emailResult);
        } catch (emailError) {
          console.error('[SimulatePayment] Failed to send email:', emailError);
          emailResult = { success: false, error: emailError instanceof Error ? emailError.message : 'Unknown error' };
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment simulated successfully',
        type: 'card-collection',
        collectionId,
        paymentId: fakePaymentId,
        slug,
        fullUrl,
        qrCodeUrl,
        collection: updatedCollection,
        emailSent: emailResult?.success || false,
        emailError: emailResult && !emailResult.success ? emailResult.error : undefined,
      });

    } else if (type === 'message') {
      if (!messageId) {
        return NextResponse.json(
          { error: 'messageId is required' },
          { status: 400 }
        );
      }

      // Find the message
      const message = await messageService.findById(messageId);
      if (!message) {
        return NextResponse.json(
          { error: `Message not found: ${messageId}` },
          { status: 404 }
        );
      }

      // Check if already paid
      if (message.status === 'paid') {
        return NextResponse.json(
          { 
            error: 'Message already paid',
            slug: message.slug,
            qrCodeUrl: message.qrCodeUrl,
          },
          { status: 400 }
        );
      }

      // Simulate payment processing
      const fakePaymentId = `TEST_${Date.now()}`;
      
      // Update status to paid
      await messageService.updateStatus(messageId, 'paid');
      await messageService.updatePaymentId(messageId, fakePaymentId);

      // Generate slug and QR code
      const slug = slugService.generateSlug(message.recipientName, messageId);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const fullUrl = `${baseUrl}${slug}`;
      const qrCodeUrl = await qrCodeService.generate(fullUrl, messageId);
      
      // Update message with slug and QR code
      await messageService.updateQRCode(messageId, qrCodeUrl, slug);

      // Fetch updated message
      const updatedMessage = await messageService.findById(messageId);

      // Send email if contact email exists
      let emailResult = null;
      if (message.contactEmail) {
        try {
          emailResult = await emailService.sendQRCodeEmail({
            recipientEmail: message.contactEmail,
            recipientName: message.contactName || message.recipientName,
            senderName: message.senderName,
            messageUrl: fullUrl,
            qrCodeDataUrl: qrCodeUrl,
            messageTitle: message.title || 'Mensagem Especial',
          });
          console.log('[SimulatePayment] Email sent:', emailResult);
        } catch (emailError) {
          console.error('[SimulatePayment] Failed to send email:', emailError);
          emailResult = { success: false, error: emailError instanceof Error ? emailError.message : 'Unknown error' };
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment simulated successfully',
        type: 'message',
        messageId,
        paymentId: fakePaymentId,
        slug,
        fullUrl,
        qrCodeUrl,
        messageData: updatedMessage,
        emailSent: emailResult?.success || false,
        emailError: emailResult && !emailResult.success ? emailResult.error : undefined,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "card-collection" or "message"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error simulating payment:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
