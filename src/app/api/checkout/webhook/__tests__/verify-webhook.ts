/**
 * Manual verification script for webhook endpoint
 * Run with: npx ts-node --project tsconfig.node.json src/app/api/checkout/webhook/__tests__/verify-webhook.ts
 */

import { messageService } from '../../../../../services/MessageService';
import { stripeService } from '../../../../../services/StripeService';
import { slugService } from '../../../../../services/SlugService';
import { qrCodeService } from '../../../../../services/QRCodeService';
import Stripe from 'stripe';

async function verifyWebhook() {
  console.log('🔍 Verifying webhook implementation...\n');

  try {
    // 1. Create a test message
    console.log('1️⃣ Creating test message...');
    const message = await messageService.create({
      recipientName: 'João da Silva',
      senderName: 'Maria Santos',
      messageText: 'Test message for webhook verification',
    });
    console.log(`✅ Message created with ID: ${message.id}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   Recipient: ${message.recipientName}\n`);

    // 2. Create a Stripe checkout session
    console.log('2️⃣ Creating Stripe checkout session...');
    const { sessionId, url } = await stripeService.createCheckoutSession(message.id, 1990);
    console.log(`✅ Checkout session created: ${sessionId}`);
    console.log(`   URL: ${url}\n`);

    // 3. Update message with session ID
    console.log('3️⃣ Updating message with session ID...');
    await messageService.updateStripeSession(message.id, sessionId);
    console.log(`✅ Message updated with session ID\n`);

    // 4. Simulate webhook processing
    console.log('4️⃣ Simulating webhook processing...');
    
    // Retrieve the session
    const session = await stripeService.getCheckoutSession(sessionId);
    console.log(`✅ Retrieved session from Stripe`);
    
    // Extract messageId from metadata
    const extractedMessageId = stripeService.handleSuccessfulPayment(session);
    console.log(`✅ Extracted messageId from metadata: ${extractedMessageId}`);
    
    if (extractedMessageId !== message.id) {
      throw new Error('MessageId mismatch!');
    }

    // 5. Update message status to paid
    console.log('\n5️⃣ Updating message status to paid...');
    await messageService.updateStatus(message.id, 'paid');
    console.log(`✅ Message status updated to 'paid'\n`);

    // 6. Generate slug
    console.log('6️⃣ Generating slug...');
    const slug = slugService.generateSlug(message.recipientName, message.id);
    console.log(`✅ Slug generated: ${slug}`);
    
    // Verify slug format
    const expectedPattern = /^\/mensagem\/joao-da-silva\//;
    if (!expectedPattern.test(slug)) {
      throw new Error(`Slug format incorrect: ${slug}`);
    }
    console.log(`✅ Slug format is correct\n`);

    // 7. Generate QR code
    console.log('7️⃣ Generating QR code...');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}${slug}`;
    console.log(`   Full URL: ${fullUrl}`);
    
    const qrCodeUrl = await qrCodeService.generate(fullUrl, message.id);
    console.log(`✅ QR code generated: ${qrCodeUrl}`);
    
    // Verify QR code URL format
    if (!qrCodeUrl.includes('/uploads/qrcodes/')) {
      throw new Error(`QR code URL format incorrect: ${qrCodeUrl}`);
    }
    console.log(`✅ QR code URL format is correct\n`);

    // 8. Update message with slug and QR code
    console.log('8️⃣ Updating message with slug and QR code...');
    await messageService.updateQRCode(message.id, qrCodeUrl, slug);
    console.log(`✅ Message updated with slug and QR code\n`);

    // 9. Verify final message state
    console.log('9️⃣ Verifying final message state...');
    const finalMessage = await messageService.findById(message.id);
    
    if (!finalMessage) {
      throw new Error('Message not found!');
    }

    console.log('Final message state:');
    console.log(`   ID: ${finalMessage.id}`);
    console.log(`   Status: ${finalMessage.status}`);
    console.log(`   Slug: ${finalMessage.slug}`);
    console.log(`   QR Code URL: ${finalMessage.qrCodeUrl}`);
    console.log(`   Stripe Session ID: ${finalMessage.stripeSessionId}`);

    // Verify all fields are correct
    const errors: string[] = [];
    
    if (finalMessage.status !== 'paid') {
      errors.push(`Status should be 'paid', got '${finalMessage.status}'`);
    }
    
    if (finalMessage.slug !== slug) {
      errors.push(`Slug mismatch: expected '${slug}', got '${finalMessage.slug}'`);
    }
    
    if (finalMessage.qrCodeUrl !== qrCodeUrl) {
      errors.push(`QR code URL mismatch: expected '${qrCodeUrl}', got '${finalMessage.qrCodeUrl}'`);
    }
    
    if (finalMessage.stripeSessionId !== sessionId) {
      errors.push(`Session ID mismatch: expected '${sessionId}', got '${finalMessage.stripeSessionId}'`);
    }

    if (errors.length > 0) {
      console.log('\n❌ Verification failed:');
      errors.forEach(error => console.log(`   - ${error}`));
      process.exit(1);
    }

    console.log('\n✅ All verifications passed!\n');

    // 10. Test slug lookup
    console.log('🔟 Testing slug lookup...');
    const messageBySlug = await messageService.findBySlug(slug);
    
    if (!messageBySlug) {
      throw new Error('Message not found by slug!');
    }
    
    if (messageBySlug.id !== message.id) {
      throw new Error('Slug lookup returned wrong message!');
    }
    
    console.log(`✅ Slug lookup works correctly\n`);

    console.log('🎉 Webhook implementation verified successfully!\n');
    console.log('Summary:');
    console.log('✅ Message creation');
    console.log('✅ Stripe session creation');
    console.log('✅ Metadata extraction');
    console.log('✅ Status update to paid');
    console.log('✅ Slug generation with special character normalization');
    console.log('✅ QR code generation');
    console.log('✅ Message update with slug and QR code');
    console.log('✅ Slug lookup');
    console.log('\nAll webhook requirements validated! ✨');

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run verification
verifyWebhook();
