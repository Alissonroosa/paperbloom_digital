/**
 * Manual test script for CardCollectionService and CardService
 * Run with: npx tsx test-card-services.ts
 */

import { CardCollectionService } from './src/services/CardCollectionService';
import { CardService } from './src/services/CardService';
import { CARD_TEMPLATES } from './src/types/card';

async function testServices() {
  console.log('🧪 Testing Card Services...\n');

  const collectionService = new CardCollectionService();
  const cardService = new CardService();

  try {
    // Test 1: Create a card collection
    console.log('📝 Test 1: Creating card collection...');
    const collection = await collectionService.create({
      recipientName: 'João Silva',
      senderName: 'Maria Santos',
      contactEmail: 'test@example.com',
    });

    console.log(`  ✓ Collection created with ID: ${collection.id}`);
    console.log(`  ✓ Recipient: ${collection.recipientName}`);
    console.log(`  ✓ Sender: ${collection.senderName}`);
    console.log(`  ✓ Status: ${collection.status}`);

    // Test 2: Create 12 cards using createBulk
    console.log('\n📝 Test 2: Creating 12 cards with templates...');
    const createdCards = await cardService.createBulk(collection.id, CARD_TEMPLATES);
    console.log(`  ✓ Created ${createdCards.length} cards`);

    // Test 3: Verify 12 cards were created
    console.log('\n📝 Test 3: Verifying 12 cards in database...');
    const cards = await cardService.findByCollectionId(collection.id);
    
    if (cards.length !== 12) {
      throw new Error(`Expected 12 cards but found ${cards.length}`);
    }
    console.log(`  ✓ Found ${cards.length} cards in database`);

    // Test 4: Verify cards have pre-filled content
    console.log('\n📝 Test 4: Verifying cards have pre-filled content...');
    cards.forEach((card, index) => {
      if (!card.title || card.title.trim() === '') {
        throw new Error(`Card ${index + 1} has empty title`);
      }
      if (!card.messageText || card.messageText.trim() === '') {
        throw new Error(`Card ${index + 1} has empty message`);
      }
      if (card.order !== index + 1) {
        throw new Error(`Card ${index + 1} has wrong order: ${card.order}`);
      }
      if (card.status !== 'unopened') {
        throw new Error(`Card ${index + 1} has wrong status: ${card.status}`);
      }
    });
    console.log('  ✓ All cards have valid titles');
    console.log('  ✓ All cards have valid messages');
    console.log('  ✓ All cards are in correct order (1-12)');
    console.log('  ✓ All cards have status "unopened"');

    // Test 5: Update a card
    console.log('\n📝 Test 5: Updating a card...');
    const firstCard = cards[0];
    const updatedCard = await cardService.update(firstCard.id, {
      title: 'Updated Title',
      messageText: 'Updated message text',
    });
    console.log(`  ✓ Card updated successfully`);
    console.log(`  ✓ New title: ${updatedCard.title}`);
    console.log(`  ✓ New message: ${updatedCard.messageText.substring(0, 50)}...`);

    // Test 6: Find collection by ID
    console.log('\n📝 Test 6: Finding collection by ID...');
    const foundCollection = await collectionService.findById(collection.id);
    if (!foundCollection) {
      throw new Error('Collection not found');
    }
    console.log(`  ✓ Collection found: ${foundCollection.id}`);

    // Test 7: Mark card as opened
    console.log('\n📝 Test 7: Marking card as opened...');
    const openedCard = await cardService.markAsOpened(firstCard.id);
    if (openedCard.status !== 'opened') {
      throw new Error(`Expected status "opened" but got "${openedCard.status}"`);
    }
    if (!openedCard.openedAt) {
      throw new Error('openedAt timestamp not set');
    }
    console.log(`  ✓ Card marked as opened`);
    console.log(`  ✓ Opened at: ${openedCard.openedAt}`);

    // Test 8: Verify canOpen returns false for opened card
    console.log('\n📝 Test 8: Verifying canOpen for opened card...');
    const canOpen = await cardService.canOpen(firstCard.id);
    if (canOpen) {
      throw new Error('canOpen should return false for opened card');
    }
    console.log(`  ✓ canOpen correctly returns false for opened card`);

    // Test 9: Update Stripe session
    console.log('\n📝 Test 9: Updating Stripe session...');
    const sessionId = 'cs_test_' + Date.now();
    const updatedCollection = await collectionService.updateStripeSession(
      collection.id,
      sessionId
    );
    if (updatedCollection.stripeSessionId !== sessionId) {
      throw new Error('Stripe session ID not updated');
    }
    console.log(`  ✓ Stripe session updated: ${updatedCollection.stripeSessionId}`);

    // Test 10: Find by Stripe session ID
    console.log('\n📝 Test 10: Finding collection by Stripe session ID...');
    const foundBySession = await collectionService.findByStripeSessionId(sessionId);
    if (!foundBySession || foundBySession.id !== collection.id) {
      throw new Error('Collection not found by Stripe session ID');
    }
    console.log(`  ✓ Collection found by Stripe session ID`);

    // Test 11: Update status to paid
    console.log('\n📝 Test 11: Updating collection status to paid...');
    const paidCollection = await collectionService.updateStatus(collection.id, 'paid');
    if (paidCollection.status !== 'paid') {
      throw new Error('Status not updated to paid');
    }
    console.log(`  ✓ Collection status updated to paid`);

    // Test 12: Update QR code and slug
    console.log('\n📝 Test 12: Updating QR code and slug...');
    const slug = 'test-slug-' + Date.now();
    const qrCodeUrl = 'https://example.com/qr/' + slug + '.png';
    const withQR = await collectionService.updateQRCode(collection.id, qrCodeUrl, slug);
    if (withQR.slug !== slug || withQR.qrCodeUrl !== qrCodeUrl) {
      throw new Error('QR code or slug not updated');
    }
    console.log(`  ✓ Slug updated: ${withQR.slug}`);
    console.log(`  ✓ QR code URL updated: ${withQR.qrCodeUrl}`);

    // Test 13: Find by slug
    console.log('\n📝 Test 13: Finding collection by slug...');
    const foundBySlug = await collectionService.findBySlug(slug);
    if (!foundBySlug || foundBySlug.id !== collection.id) {
      throw new Error('Collection not found by slug');
    }
    console.log(`  ✓ Collection found by slug`);

    console.log('\n✅ All tests passed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Created 1 collection`);
    console.log(`  - Created 12 cards automatically`);
    console.log(`  - Updated card content`);
    console.log(`  - Marked card as opened`);
    console.log(`  - Updated collection with payment info`);
    console.log(`  - All CRUD operations working correctly`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

testServices()
  .then(() => {
    console.log('\n🎉 Service verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Service verification failed!');
    process.exit(1);
  });
