import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/services/StripeService';
import { messageService } from '@/services/MessageService';
import { cardCollectionService } from '@/services/CardCollectionService';
import { slugService } from '@/services/SlugService';
import { qrCodeService } from '@/services/QRCodeService';
import { emailService } from '@/services/EmailService';
import { validateStoredURLs } from '@/lib/utils';
import Stripe from 'stripe';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Handle message payment processing
 * Requirements: 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3
 */
async function handleMessagePayment(session: Stripe.Checkout.Session): Promise<void> {
  // Extract messageId from session metadata (Requirement 2.2)
  const messageId = stripeService.handleSuccessfulPayment(session);
  
  // Verify message exists
  const message = await messageService.findById(messageId);
  
  if (!message) {
    throw new Error(`Message not found for ID: ${messageId}`);
  }

  // Update message status to 'paid' (Requirements 2.2, 2.3)
  await messageService.updateStatus(messageId, 'paid');
  
  // Generate slug using SlugService (Requirement 3.1)
  const slug = slugService.generateSlug(message.recipientName, messageId);
  
  // Generate full URL for QR code
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${slug}`;
  
  // Generate QR code using QRCodeService (Requirements 3.2, 3.3)
  const qrCodeUrl = await qrCodeService.generate(fullUrl, messageId);
  
  // Update message with slug and qrCodeUrl (Requirements 3.1, 3.2, 3.3)
  await messageService.updateQRCode(messageId, qrCodeUrl, slug);
  
  // Validate URL accessibility (Requirement 6.5)
  const urlValidation = await validateStoredURLs(
    message.imageUrl,
    qrCodeUrl,
    {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 5000,
    }
  );
  
  if (!urlValidation.allAccessible) {
    console.warn('Warning: Some URLs may not be immediately accessible', {
      messageId,
      imageUrl: urlValidation.imageUrl,
      qrCodeUrl: urlValidation.qrCodeUrl,
    });
  }
  
  // Send QR code email (Requirements 12.1, 12.5, 12.6, 12.7)
  await sendQRCodeEmail(session, messageId, fullUrl, qrCodeUrl, {
    recipientName: message.recipientName,
    senderName: message.senderName,
    title: message.title || `Mensagem para ${message.recipientName}`,
    contactEmail: message.contactEmail,
    contactName: message.contactName,
  });
  
  console.log(`Successfully processed payment for message ${messageId}`);
}

/**
 * Handle card collection payment processing
 * Requirements: 6.3, 6.4, 6.5, 6.6
 */
async function handleCardCollectionPayment(session: Stripe.Checkout.Session): Promise<void> {
  // Extract collectionId from session metadata (Requirement 6.3)
  const collectionId = session.metadata?.collectionId;
  
  if (!collectionId) {
    throw new Error('Collection ID not found in session metadata');
  }
  
  // Verify collection exists
  const collection = await cardCollectionService.findById(collectionId);
  
  if (!collection) {
    throw new Error(`Card collection not found for ID: ${collectionId}`);
  }

  // Update collection status to 'paid' (Requirement 6.6)
  await cardCollectionService.updateStatus(collectionId, 'paid');
  
  // Generate slug using SlugService (Requirement 6.3)
  const slug = slugService.generateSlug(collection.recipientName, collectionId, 'c');
  
  // Generate full URL for QR code
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${slug}`;
  
  // Generate QR code using QRCodeService (Requirement 6.4)
  const qrCodeUrl = await qrCodeService.generate(fullUrl, collectionId);
  
  // Update collection with slug and qrCodeUrl (Requirements 6.3, 6.4)
  await cardCollectionService.updateQRCode(collectionId, qrCodeUrl, slug);
  
  // Send card collection email (Requirement 6.5)
  await sendCardCollectionEmail(session, collectionId, fullUrl, qrCodeUrl, {
    recipientName: collection.recipientName,
    senderName: collection.senderName,
    contactEmail: collection.contactEmail,
    contactName: collection.contactName,
  });
  
  console.log(`Successfully processed payment for card collection ${collectionId}`);
}

/**
 * Send QR code email to customer
 * Requirements: 12.1, 12.5, 12.6, 12.7, 6.5
 */
async function sendQRCodeEmail(
  session: Stripe.Checkout.Session,
  itemId: string,
  fullUrl: string,
  qrCodeUrl: string,
  itemData: {
    recipientName: string;
    senderName: string;
    title: string;
    contactEmail: string | null;
    contactName: string | null;
  }
): Promise<void> {
  try {
    console.log(`[Webhook] Starting email send process for item: ${itemId}`);
    
    // Read QR code file and convert to base64 data URL
    const qrCodePath = path.join(process.cwd(), 'public', qrCodeUrl);
    console.log('[Webhook] Reading QR code from:', qrCodePath);
    
    const qrCodeBuffer = await fs.readFile(qrCodePath);
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;
    
    console.log('[Webhook] QR code loaded, size:', qrCodeBuffer.length, 'bytes');
    
    // Get contact email from session metadata or item database
    const contactEmail = session.customer_details?.email || session.metadata?.contactEmail || itemData.contactEmail;
    const contactName = session.metadata?.contactName || itemData.contactName || itemData.senderName;
    
    console.log('[Webhook] Email delivery check:', {
      sessionEmail: session.customer_details?.email,
      metadataEmail: session.metadata?.contactEmail,
      itemEmail: itemData.contactEmail,
      finalEmail: contactEmail,
      contactName: contactName,
    });
    
    if (contactEmail) {
      console.log('[Webhook] Preparing to send email to:', contactEmail);
      
      // Send email with QR code (Requirements 12.1, 6.5)
      const emailData = {
        recipientEmail: contactEmail,
        recipientName: contactName,
        messageUrl: fullUrl,
        qrCodeDataUrl: qrCodeDataUrl,
        senderName: itemData.senderName,
        messageTitle: itemData.title,
      };
      
      console.log('[Webhook] Email data prepared:', {
        recipientEmail: emailData.recipientEmail,
        recipientName: emailData.recipientName,
        messageUrl: emailData.messageUrl,
        senderName: emailData.senderName,
        messageTitle: emailData.messageTitle,
        qrCodeSize: qrCodeDataUrl.length,
      });
      
      console.log('[Webhook] Calling emailService.sendQRCodeEmail...');
      const emailResult = await emailService.sendQRCodeEmail(emailData);
      
      if (emailResult.success) {
        console.log(`[Webhook] ✅ Successfully sent QR code email for item ${itemId}`, {
          emailMessageId: emailResult.messageId,
          recipientEmail: contactEmail,
        });
      } else {
        // Handle email send failures gracefully (Requirements 12.5, 6.5)
        // Log but don't block the webhook response
        console.error(`[Webhook] ❌ Failed to send QR code email for item ${itemId}`, {
          error: emailResult.error,
          recipientEmail: contactEmail,
        });
      }
    } else {
      console.warn(`[Webhook] ⚠️ No contact email found for item ${itemId}, skipping email send`);
      console.warn('[Webhook] Available data:', {
        sessionCustomerEmail: session.customer_details?.email,
        sessionMetadataEmail: session.metadata?.contactEmail,
        itemContactEmail: itemData.contactEmail,
      });
    }
  } catch (emailError) {
    // Handle email send failures gracefully (Requirements 12.5, 6.5)
    // Log but don't block the webhook response
    console.error('[Webhook] ❌ Error sending QR code email:', {
      itemId,
      error: emailError instanceof Error ? emailError.message : 'Unknown error',
      stack: emailError instanceof Error ? emailError.stack : undefined,
    });
  }
}

/**
 * Send card collection email to customer
 * Requirement: 6.5
 */
async function sendCardCollectionEmail(
  session: Stripe.Checkout.Session,
  collectionId: string,
  fullUrl: string,
  qrCodeUrl: string,
  collectionData: {
    recipientName: string;
    senderName: string;
    contactEmail: string | null;
    contactName: string | null;
  }
): Promise<void> {
  try {
    console.log(`[Webhook] Starting card collection email send process for collection: ${collectionId}`);
    
    // Read QR code file and convert to base64 data URL
    const qrCodePath = path.join(process.cwd(), 'public', qrCodeUrl);
    console.log('[Webhook] Reading QR code from:', qrCodePath);
    
    const qrCodeBuffer = await fs.readFile(qrCodePath);
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;
    
    console.log('[Webhook] QR code loaded, size:', qrCodeBuffer.length, 'bytes');
    
    // Get contact email from session metadata or collection database
    const contactEmail = session.customer_details?.email || session.metadata?.contactEmail || collectionData.contactEmail;
    const contactName = session.metadata?.contactName || collectionData.contactName || collectionData.senderName;
    
    console.log('[Webhook] Email delivery check:', {
      sessionEmail: session.customer_details?.email,
      metadataEmail: session.metadata?.contactEmail,
      collectionEmail: collectionData.contactEmail,
      finalEmail: contactEmail,
      contactName: contactName,
      recipientName: collectionData.recipientName,
    });
    
    if (contactEmail) {
      console.log('[Webhook] Preparing to send card collection email to:', contactEmail);
      
      // Send card collection email with QR code (Requirement 6.5)
      // recipientEmail = email de quem está comprando (contactEmail)
      // recipientName = nome do destinatário das cartas (usado no assunto/conteúdo)
      // senderName = nome de quem está enviando as cartas
      const emailData = {
        recipientEmail: contactEmail,
        recipientName: collectionData.recipientName, // Nome do destinatário das cartas (para o assunto)
        senderName: collectionData.senderName,
        collectionUrl: fullUrl,
        qrCodeDataUrl: qrCodeDataUrl,
      };
      
      console.log('[Webhook] Card collection email data prepared:', {
        recipientEmail: emailData.recipientEmail,
        recipientName: emailData.recipientName,
        senderName: emailData.senderName,
        collectionUrl: emailData.collectionUrl,
        qrCodeSize: qrCodeDataUrl.length,
      });
      
      console.log('[Webhook] Calling emailService.sendCardCollectionEmail...');
      const emailResult = await emailService.sendCardCollectionEmail(emailData);
      
      if (emailResult.success) {
        console.log(`[Webhook] ✅ Successfully sent card collection email for collection ${collectionId}`, {
          emailMessageId: emailResult.messageId,
          recipientEmail: contactEmail,
        });
      } else {
        // Handle email send failures gracefully (Requirement 6.5)
        // Log but don't block the webhook response
        console.error(`[Webhook] ❌ Failed to send card collection email for collection ${collectionId}`, {
          error: emailResult.error,
          recipientEmail: contactEmail,
        });
      }
    } else {
      console.warn(`[Webhook] ⚠️ No contact email found for collection ${collectionId}, skipping email send`);
      console.warn('[Webhook] Available data:', {
        sessionCustomerEmail: session.customer_details?.email,
        sessionMetadataEmail: session.metadata?.contactEmail,
        collectionContactEmail: collectionData.contactEmail,
      });
    }
  } catch (emailError) {
    // Handle email send failures gracefully (Requirement 6.5)
    // Log but don't block the webhook response
    console.error('[Webhook] ❌ Error sending card collection email:', {
      collectionId,
      error: emailError instanceof Error ? emailError.message : 'Unknown error',
      stack: emailError instanceof Error ? emailError.stack : undefined,
    });
  }
}


/**
 * POST /api/checkout/webhook
 * Handles Stripe webhook events for payment processing
 * Supports both "message" and "card-collection" products
 * 
 * Requirements: 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 6.3, 6.4, 6.5, 6.6
 * 
 * @param request - Next.js request object
 * @returns JSON response with success status or error
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body as text for signature verification (Requirement 2.5)
    const body = await request.text();
    
    // Get Stripe signature from headers (Requirement 2.5)
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_SIGNATURE',
            message: 'Missing Stripe signature header',
          },
        },
        { status: 400 }
      );
    }

    // Verify webhook signature (Requirement 2.5)
    let event: Stripe.Event;
    try {
      event = stripeService.constructWebhookEvent(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Invalid webhook signature',
          },
        },
        { status: 400 }
      );
    }

    // Handle 'checkout.session.completed' event (Requirement 2.2)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      try {
        // Detect product type from session metadata (Requirements 2.2, 6.3)
        const productType = session.metadata?.productType || 'message';
        
        console.log(`[Webhook] Processing ${productType} payment for session ${session.id}`);
        
        if (productType === 'card-collection') {
          // Handle card collection payment (Requirements 6.3, 6.4, 6.5, 6.6)
          await handleCardCollectionPayment(session);
        } else {
          // Handle message payment (Requirements 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3)
          await handleMessagePayment(session);
        }
        
        console.log(`Successfully processed ${productType} payment for session ${session.id}`);
      } catch (error) {
        console.error('Error processing successful payment:', error);
        // Return 200 to Stripe even if processing fails to avoid retries
        // Log the error for manual investigation
        return NextResponse.json(
          { received: true, error: 'Processing failed but acknowledged' },
          { status: 200 }
        );
      }
    }

    // Return 200 response to Stripe (Requirement 2.5)
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in POST /api/checkout/webhook:', error);
    
    // Return 500 for unexpected errors
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while processing webhook',
        },
      },
      { status: 500 }
    );
  }
}
