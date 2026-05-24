import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService } from '@/services/MercadoPagoService';
import { messageService } from '@/services/MessageService';
import { cardCollectionService } from '@/services/CardCollectionService';
import { genderRevealService } from '@/services/GenderRevealService';
import { slugService } from '@/services/SlugService';
import { qrCodeService } from '@/services/QRCodeService';
import { emailService } from '@/services/EmailService';
import { digitalArtOrderService } from '@/services/DigitalArtOrderService';
import { catalogService } from '@/services/CatalogService';
import { validateStoredURLs } from '@/lib/utils';
import { generateRevealSlug } from '@/types/gender-reveal';
import { loadQRCodeAsDataUrl } from '@/lib/qr-utils';

/**
 * Handle message payment processing
 */
async function handleMessagePayment(
  paymentId: number,
  metadata: Record<string, string>,
  payerEmail: string | undefined
): Promise<void> {
  const messageId = metadata.message_id || metadata.messageId;
  if (!messageId) throw new Error('Message ID not found in payment metadata');

  const message = await messageService.findById(messageId);
  if (!message) throw new Error(`Message not found for ID: ${messageId}`);

  await messageService.updateStatus(messageId, 'paid');
  await messageService.updatePaymentId(messageId, String(paymentId));

  const slug = slugService.generateSlug(message.recipientName, messageId);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${slug}`;
  const qrCodeUrl = await qrCodeService.generate(fullUrl, messageId);
  await messageService.updateQRCode(messageId, qrCodeUrl, slug);

  const urlValidation = await validateStoredURLs(message.imageUrl, qrCodeUrl, {
    maxRetries: 3, retryDelay: 1000, timeout: 5000,
  });
  if (!urlValidation.allAccessible) {
    console.warn('Warning: Some URLs may not be immediately accessible', { messageId });
  }

  await sendQRCodeEmail(payerEmail, messageId, fullUrl, qrCodeUrl, {
    recipientName: message.recipientName,
    senderName: message.senderName,
    title: message.title || `Mensagem para ${message.recipientName}`,
    contactEmail: message.contactEmail,
    contactName: message.contactName,
    metadataEmail: metadata.contact_email || metadata.contactEmail,
    metadataName: metadata.contact_name || metadata.contactName,
  });

  console.log(`Successfully processed payment for message ${messageId}`);
}

/**
 * Handle card collection payment processing
 */
async function handleCardCollectionPayment(
  paymentId: number,
  metadata: Record<string, string>,
  payerEmail: string | undefined
): Promise<void> {
  const collectionId = metadata.collection_id || metadata.collectionId;
  if (!collectionId) throw new Error('Collection ID not found in payment metadata');

  const collection = await cardCollectionService.findById(collectionId);
  if (!collection) throw new Error(`Card collection not found for ID: ${collectionId}`);

  await cardCollectionService.updateStatus(collectionId, 'paid');
  await cardCollectionService.updatePaymentId(collectionId, String(paymentId));

  const slug = slugService.generateSlug(collection.recipientName, collectionId, 'c');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${slug}`;
  const qrCodeUrl = await qrCodeService.generate(fullUrl, collectionId);
  await cardCollectionService.updateQRCode(collectionId, qrCodeUrl, slug);

  // Idempotency check: if token already existed, skip email to avoid duplicate sends
  const tokenAlreadyExisted = !!collection.dashboardToken;
  const dashboardToken = await cardCollectionService.setDashboardToken(collectionId);

  if (tokenAlreadyExisted) {
    console.warn(`[Webhook] ⚠️ Dashboard token already existed for collection ${collectionId} — skipping email to avoid duplicate send`);
  } else {
    const contactEmail = payerEmail || metadata.contact_email || metadata.contactEmail || collection.contactEmail;
    const contactName = metadata.contact_name || metadata.contactName || collection.contactName || collection.senderName;

    if (contactEmail) {
      const emailResult = await emailService.sendPaymentConfirmationEmail({
        contactEmail,
        contactName: contactName || '',
        collectionId,
        dashboardToken,
      });

      if (emailResult.success) {
        console.log(`[Webhook] ✅ Payment confirmation email sent for collection ${collectionId}`);
      } else {
        console.error(`[Webhook] ❌ Failed to send payment confirmation email for ${collectionId}`, emailResult.error);
      }
    } else {
      console.warn(`[Webhook] ⚠️ No email found for collection ${collectionId}`);
    }
  }

  console.log(`Successfully processed payment for card collection ${collectionId}`);
}

/**
 * Handle gender reveal payment processing
 */
async function handleGenderRevealPayment(
  paymentId: number,
  metadata: Record<string, string>,
  payerEmail: string | undefined
): Promise<void> {
  const revealId = metadata.reveal_id || metadata.revealId || metadata.collection_id || metadata.collectionId;
  if (!revealId) throw new Error('Reveal ID not found in payment metadata');

  const reveal = await genderRevealService.findById(revealId);
  if (!reveal) throw new Error(`Gender reveal not found for ID: ${revealId}`);

  // Generate slugs
  const slug = generateRevealSlug(reveal.boyName, reveal.girlName, revealId);
  const dashboardSlug = `dashboard-${slug}`;
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const publicUrl = `${baseUrl}/revelacao-virtual/${slug}`;
  const dashboardUrl = `${baseUrl}/revelacao-virtual/dashboard/${dashboardSlug}`;
  
  // Generate QR code for public URL
  const qrCodeUrl = await qrCodeService.generate(publicUrl, revealId);

  // Update reveal with all info
  await genderRevealService.update(revealId, {
    status: 'paid',
    paymentId: String(paymentId),
    slug,
    dashboardSlug,
    qrCodeUrl,
  });

  // Send email with both links
  await sendGenderRevealEmail(payerEmail, revealId, publicUrl, dashboardUrl, qrCodeUrl, {
    boyName: reveal.boyName,
    girlName: reveal.girlName,
    dadName: reveal.dadName,
    momName: reveal.momName,
    contactEmail: reveal.contactEmail,
    contactName: reveal.contactName,
    metadataEmail: metadata.contact_email || metadata.contactEmail,
    metadataName: metadata.contact_name || metadata.contactName,
  });

  console.log(`Successfully processed payment for gender reveal ${revealId}`);
}

/**
 * Handle digital art payment processing
 * Idempotent: no-op if order already paid.
 */
async function handleDigitalArtPayment(
  paymentId: number,
  metadata: Record<string, string>,
  payerEmail: string | undefined
): Promise<void> {
  const orderId = metadata.order_id || metadata.orderId;
  if (!orderId) throw new Error('Order ID not found in digital-art payment metadata');

  // Idempotência: se já existe com status paid, no-op
  const existingByPayment = await digitalArtOrderService.findByMpPaymentId(String(paymentId));
  if (existingByPayment && existingByPayment.status === 'paid') {
    console.log(`[Webhook] ⚠️ Digital art order already paid (mp_payment_id: ${paymentId}) — skipping`);
    return;
  }

  const order = await digitalArtOrderService.findById(orderId);
  if (!order) throw new Error(`Digital art order not found for ID: ${orderId}`);

  await digitalArtOrderService.markAsPaid(orderId, String(paymentId));

  const product = catalogService.getProductBySlug(order.product_slug);
  if (!product?.art?.canvaTemplateUrl) {
    console.error(`[Webhook] ❌ Product ${order.product_slug} has no canvaTemplateUrl — cannot send email`);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const recoveryUrl = `${baseUrl}/loja/recuperar-arte`;

  const emailResult = await emailService.sendArtDeliveryEmail({
    recipientEmail: payerEmail || order.email,
    productTitle: order.product_title,
    canvaUrl: product.art.canvaTemplateUrl,
    canvaLabel: product.art.canvaTemplateLabel,
    canvaUrlSecondary: product.art.canvaTemplateUrlSecondary,
    canvaLabelSecondary: product.art.canvaTemplateLabelSecondary,
    recoveryUrl,
    licenseText: product.art.licenseText,
  });

  if (emailResult.success) {
    console.log(`[Webhook] ✅ Art delivery email sent for order ${orderId}`);
  } else {
    console.error(`[Webhook] ❌ Failed to send art delivery email for ${orderId}:`, emailResult.error);
  }

  console.log(`Successfully processed digital art payment for order ${orderId}`);
}

/**
 * Send QR code email to customer
 */
async function sendQRCodeEmail(
  payerEmail: string | undefined,
  itemId: string,
  fullUrl: string,
  qrCodeUrl: string,
  itemData: {
    recipientName: string;
    senderName: string;
    title: string;
    contactEmail: string | null;
    contactName: string | null;
    metadataEmail?: string;
    metadataName?: string;
  }
): Promise<void> {
  try {
    const qrCodeDataUrl = await loadQRCodeAsDataUrl(qrCodeUrl);

    const contactEmail = payerEmail || itemData.metadataEmail || itemData.contactEmail;
    const contactName = itemData.metadataName || itemData.contactName || itemData.senderName;

    if (contactEmail) {
      const emailResult = await emailService.sendQRCodeEmail({
        recipientEmail: contactEmail,
        recipientName: contactName,
        messageUrl: fullUrl,
        qrCodeDataUrl,
        senderName: itemData.senderName,
        messageTitle: itemData.title,
      });

      if (emailResult.success) {
        console.log(`[Webhook] ✅ Email sent for item ${itemId}`);
      } else {
        console.error(`[Webhook] ❌ Failed to send email for item ${itemId}`, emailResult.error);
      }
    } else {
      console.warn(`[Webhook] ⚠️ No email found for item ${itemId}`);
    }
  } catch (emailError) {
    console.error('[Webhook] ❌ Error sending email:', emailError);
  }
}

/**
 * Send card collection email to customer
 * @deprecated Use sendPaymentConfirmationEmail via emailService instead.
 * Kept for reference — no longer called from handleCardCollectionPayment.
 */
async function sendCardCollectionEmail(
  payerEmail: string | undefined,
  collectionId: string,
  fullUrl: string,
  qrCodeUrl: string,
  collectionData: {
    recipientName: string;
    senderName: string;
    contactEmail: string | null;
    contactName: string | null;
    metadataEmail?: string;
    metadataName?: string;
  }
): Promise<void> {
  try {
    const qrCodeDataUrl = await loadQRCodeAsDataUrl(qrCodeUrl);

    const contactEmail = payerEmail || collectionData.metadataEmail || collectionData.contactEmail;
    const contactName = collectionData.metadataName || collectionData.contactName || collectionData.senderName;

    if (contactEmail) {
      const emailResult = await emailService.sendCardCollectionEmail({
        recipientEmail: contactEmail,
        recipientName: collectionData.recipientName,
        senderName: collectionData.senderName,
        collectionUrl: fullUrl,
        qrCodeDataUrl,
      });

      if (emailResult.success) {
        console.log(`[Webhook] ✅ Card collection email sent for ${collectionId}`);
      } else {
        console.error(`[Webhook] ❌ Failed to send card collection email for ${collectionId}`, emailResult.error);
      }
    } else {
      console.warn(`[Webhook] ⚠️ No email found for collection ${collectionId}`);
    }
  } catch (emailError) {
    console.error('[Webhook] ❌ Error sending card collection email:', emailError);
  }
}

/**
 * Send gender reveal email to customer with both links
 */
async function sendGenderRevealEmail(
  payerEmail: string | undefined,
  revealId: string,
  publicUrl: string,
  dashboardUrl: string,
  qrCodeUrl: string,
  revealData: {
    boyName: string;
    girlName: string;
    dadName: string;
    momName: string;
    contactEmail: string | null;
    contactName: string | null;
    metadataEmail?: string;
    metadataName?: string;
  }
): Promise<void> {
  try {
    const qrCodeDataUrl = await loadQRCodeAsDataUrl(qrCodeUrl);

    const contactEmail = payerEmail || revealData.metadataEmail || revealData.contactEmail;
    const contactName = revealData.metadataName || revealData.contactName || revealData.dadName;

    if (contactEmail) {
      const emailResult = await emailService.sendGenderRevealEmail({
        recipientEmail: contactEmail,
        recipientName: contactName,
        boyName: revealData.boyName,
        girlName: revealData.girlName,
        dadName: revealData.dadName,
        momName: revealData.momName,
        publicUrl,
        dashboardUrl,
        qrCodeDataUrl,
      });

      if (emailResult.success) {
        console.log(`[Webhook] ✅ Gender reveal email sent for ${revealId}`);
      } else {
        console.error(`[Webhook] ❌ Failed to send gender reveal email for ${revealId}`, emailResult.error);
      }
    } else {
      console.warn(`[Webhook] ⚠️ No email found for gender reveal ${revealId}`);
    }
  } catch (emailError) {
    console.error('[Webhook] ❌ Error sending gender reveal email:', emailError);
  }
}

/**
 * POST /api/checkout/webhook
 * Handles Mercado Pago webhook notifications (IPN)
 * Processes payment notifications when status is "approved"
 */
export async function POST(request: NextRequest) {
  try {
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    const body = await request.json();
    console.log('[Webhook] Received notification:', JSON.stringify(body));

    const { type, data, action } = body;

    // Only process payment notifications
    if (type !== 'payment' || !data?.id) {
      console.log(`[Webhook] Ignoring notification type: ${type}, action: ${action}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Validate webhook signature
    const isValid = mercadoPagoService.validateWebhookSignature(
      xSignature,
      xRequestId,
      String(data.id)
    );

    if (!isValid) {
      console.warn('[Webhook] Invalid signature - proceeding with caution');
    }

    // Fetch payment details from Mercado Pago API
    const payment = await mercadoPagoService.getPayment(data.id);
    console.log(`[Webhook] Payment ${payment.id} status: ${payment.status}`);

    // Only process approved payments (or handle refunds)
    if (payment.status === 'refunded') {
      const metadata = payment.metadata;
      const productType = metadata.product_type || metadata.productType || 'message';
      console.log(`[Webhook] Processing refund for ${productType} payment ${payment.id}`);
      if (productType === 'digital-art') {
        await digitalArtOrderService.markAsRefunded(String(payment.id));
        console.log(`[Webhook] ✅ Digital art order marked as refunded (mp_payment_id: ${payment.id})`);
      } else {
        console.warn(`[Webhook] ⚠️ Refund received for ${productType} payment ${payment.id} — ação manual necessária`);
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (payment.status !== 'approved') {
      console.log(`[Webhook] Payment ${payment.id} not approved (status: ${payment.status}), skipping`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    try {
      // Mercado Pago converts camelCase metadata keys to snake_case
      const metadata = payment.metadata;
      const productType = metadata.product_type || metadata.productType || 'message';

      console.log(`[Webhook] Processing ${productType} payment ${payment.id}`);

      if (productType === 'gender-reveal') {
        await handleGenderRevealPayment(payment.id, metadata, payment.payer.email);
      } else if (productType === 'card-collection') {
        await handleCardCollectionPayment(payment.id, metadata, payment.payer.email);
      } else if (productType === 'digital-art') {
        await handleDigitalArtPayment(payment.id, metadata, payment.payer.email);
      } else {
        await handleMessagePayment(payment.id, metadata, payment.payer.email);
      }

      console.log(`[Webhook] Successfully processed ${productType} payment ${payment.id}`);
    } catch (error) {
      console.error('[Webhook] Error processing payment:', error);
      return NextResponse.json(
        { received: true, error: 'Processing failed but acknowledged' },
        { status: 200 }
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected error processing webhook' } },
      { status: 500 }
    );
  }
}
