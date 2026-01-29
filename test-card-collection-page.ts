/**
 * Test Script: Card Collection Visualization Page
 * 
 * This script tests the card collection visualization page by:
 * 1. Creating a test collection with 12 cards
 * 2. Completing payment to generate slug
 * 3. Verifying the page can be accessed
 * 4. Testing card opening functionality
 * 
 * Requirements tested: 5.1, 5.5
 */

import { cardCollectionService } from './src/services/CardCollectionService';
import { cardService } from './src/services/CardService';
import { CARD_TEMPLATES } from './src/types/card';

async function testCardCollectionPage() {
  console.log('🧪 Testing Card Collection Visualization Page\n');

  try {
    // Step 1: Create a test collection
    console.log('📝 Step 1: Creating test collection...');
    const collection = await cardCollectionService.create({
      recipientName: 'Maria Silva',
      senderName: 'João Santos',
      contactEmail: 'test@example.com',
    });
    console.log('✅ Collection created:', collection.id);

    // Step 2: Create 12 cards
    console.log('\n📝 Step 2: Creating 12 cards...');
    const cards = await cardService.createBulk(collection.id, CARD_TEMPLATES);
    console.log(`✅ Created ${cards.length} cards`);

    // Step 3: Simulate payment by generating slug
    console.log('\n📝 Step 3: Simulating payment (generating slug)...');
    const slug = `test-collection-${Date.now()}`;
    const qrCodeUrl = `https://example.com/qr/${slug}.png`;
    
    await cardCollectionService.updateQRCode(collection.id, qrCodeUrl, slug);
    await cardCollectionService.updateStatus(collection.id, 'paid');
    console.log('✅ Slug generated:', slug);
    console.log('✅ Status updated to: paid');

    // Step 4: Test fetching collection by slug (simulating page load)
    console.log('\n📝 Step 4: Testing collection fetch by slug...');
    const fetchedCollection = await cardCollectionService.findBySlug(slug);
    
    if (!fetchedCollection) {
      throw new Error('Collection not found by slug');
    }
    
    console.log('✅ Collection fetched successfully');
    console.log('   - ID:', fetchedCollection.id);
    console.log('   - Sender:', fetchedCollection.senderName);
    console.log('   - Recipient:', fetchedCollection.recipientName);
    console.log('   - Slug:', fetchedCollection.slug);
    console.log('   - Status:', fetchedCollection.status);

    // Step 5: Test fetching cards for the collection
    console.log('\n📝 Step 5: Testing cards fetch...');
    const fetchedCards = await cardService.findByCollectionId(collection.id);
    console.log(`✅ Fetched ${fetchedCards.length} cards`);
    
    // Verify all cards are unopened initially
    const unopenedCount = fetchedCards.filter(c => c.status === 'unopened').length;
    console.log(`   - Unopened cards: ${unopenedCount}/12`);
    
    if (unopenedCount !== 12) {
      throw new Error('Expected all 12 cards to be unopened');
    }

    // Step 6: Test opening a card
    console.log('\n📝 Step 6: Testing card opening...');
    const firstCard = fetchedCards[0];
    console.log(`   Opening card ${firstCard.order}: "${firstCard.title}"`);
    
    const canOpen = await cardService.canOpen(firstCard.id);
    console.log('   - Can open?', canOpen);
    
    if (!canOpen) {
      throw new Error('Card should be openable');
    }
    
    const openedCard = await cardService.markAsOpened(firstCard.id);
    console.log('✅ Card opened successfully');
    console.log('   - Status:', openedCard.status);
    console.log('   - Opened at:', openedCard.openedAt);

    // Step 7: Test that card cannot be opened again
    console.log('\n📝 Step 7: Testing card cannot be opened twice...');
    const canOpenAgain = await cardService.canOpen(firstCard.id);
    console.log('   - Can open again?', canOpenAgain);
    
    if (canOpenAgain) {
      throw new Error('Card should not be openable twice');
    }
    console.log('✅ Card correctly blocked from reopening');

    // Step 8: Verify filtered content for opened cards
    console.log('\n📝 Step 8: Testing content filtering for opened cards...');
    const updatedCards = await cardService.findByCollectionId(collection.id);
    const openedCards = updatedCards.filter(c => c.status === 'opened');
    const unopenedCards = updatedCards.filter(c => c.status === 'unopened');
    
    console.log(`   - Opened cards: ${openedCards.length}`);
    console.log(`   - Unopened cards: ${unopenedCards.length}`);
    
    if (openedCards.length !== 1) {
      throw new Error('Expected exactly 1 opened card');
    }
    
    if (unopenedCards.length !== 11) {
      throw new Error('Expected exactly 11 unopened cards');
    }

    // Step 9: Display page URL
    console.log('\n📝 Step 9: Page URL for testing...');
    console.log(`   🌐 Visit: http://localhost:3000/cartas/${slug}`);
    console.log('   📱 Or scan the QR code (when generated)');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log(`   - Collection ID: ${collection.id}`);
    console.log(`   - Slug: ${slug}`);
    console.log(`   - Total cards: ${cards.length}`);
    console.log(`   - Opened cards: ${openedCards.length}`);
    console.log(`   - Unopened cards: ${unopenedCards.length}`);
    console.log(`   - Sender: ${collection.senderName}`);
    console.log(`   - Recipient: ${collection.recipientName}`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log(`   2. Visit: http://localhost:3000/cartas/${slug}`);
    console.log('   3. Test opening cards through the UI');
    console.log('   4. Verify modal displays correctly');
    console.log('   5. Test that opened cards cannot be reopened');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testCardCollectionPage();
