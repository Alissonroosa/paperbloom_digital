/**
 * Test script for Card Opening API Route
 * Tests the POST /api/cards/[id]/open endpoint
 * 
 * Requirements tested: 4.2, 4.3, 4.4, 4.5
 */

import { cardCollectionService } from './src/services/CardCollectionService';
import { cardService } from './src/services/CardService';

const BASE_URL = 'http://localhost:3000';

async function testCardOpenRoute() {
  console.log('🧪 Testing Card Opening API Route\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Create a test collection with cards
    console.log('\n📝 Step 1: Creating test collection...');
    const collection = await cardCollectionService.create({
      recipientName: 'Test Recipient',
      senderName: 'Test Sender',
      contactEmail: 'test@example.com',
    });
    console.log(`✅ Collection created: ${collection.id}`);

    // Create the 12 cards for the collection
    console.log('📝 Creating 12 cards for the collection...');
    const cards = await cardService.createBulk(collection.id);
    console.log(`✅ Created ${cards.length} cards`);

    // Get the first card
    const testCard = cards[0];
    console.log(`✅ Test card ID: ${testCard.id}`);
    console.log(`   Status: ${testCard.status}`);
    console.log(`   Title: ${testCard.title}`);

    // Step 2: Test opening card for the first time
    console.log('\n📝 Step 2: Opening card for the first time...');
    const firstOpenResponse = await fetch(`${BASE_URL}/api/cards/${testCard.id}/open`, {
      method: 'POST',
    });

    if (!firstOpenResponse.ok) {
      throw new Error(`First open failed: ${firstOpenResponse.status} ${firstOpenResponse.statusText}`);
    }

    const firstOpenData = await firstOpenResponse.json();
    console.log('✅ First opening successful!');
    console.log(`   Message: ${firstOpenData.message}`);
    console.log(`   Already Opened: ${firstOpenData.alreadyOpened}`);
    console.log(`   Card Status: ${firstOpenData.card.status}`);
    console.log(`   Opened At: ${firstOpenData.card.openedAt}`);
    console.log(`   Has Message Text: ${!!firstOpenData.card.messageText}`);
    console.log(`   Has Full Content: ${!!firstOpenData.card.collectionId}`);

    // Verify requirements
    if (firstOpenData.card.status !== 'opened') {
      throw new Error('❌ Requirement 4.2 failed: Status should be "opened"');
    }
    if (!firstOpenData.card.openedAt) {
      throw new Error('❌ Requirement 4.4 failed: openedAt timestamp should be recorded');
    }
    if (!firstOpenData.card.messageText) {
      throw new Error('❌ Requirement 4.5 failed: Full content should be returned on first opening');
    }
    if (firstOpenData.alreadyOpened !== false) {
      throw new Error('❌ alreadyOpened should be false on first opening');
    }

    console.log('✅ Requirements 4.2, 4.4, 4.5 verified for first opening');

    // Step 3: Test opening the same card again
    console.log('\n📝 Step 3: Attempting to open the same card again...');
    const secondOpenResponse = await fetch(`${BASE_URL}/api/cards/${testCard.id}/open`, {
      method: 'POST',
    });

    if (!secondOpenResponse.ok) {
      throw new Error(`Second open failed: ${secondOpenResponse.status} ${secondOpenResponse.statusText}`);
    }

    const secondOpenData = await secondOpenResponse.json();
    console.log('✅ Second opening handled correctly!');
    console.log(`   Message: ${secondOpenData.message}`);
    console.log(`   Already Opened: ${secondOpenData.alreadyOpened}`);
    console.log(`   Card Status: ${secondOpenData.card.status}`);
    console.log(`   Has Message Text: ${!!secondOpenData.card.messageText}`);
    console.log(`   Has Full Content: ${!!secondOpenData.card.collectionId}`);

    // Verify requirements for already opened card
    if (secondOpenData.alreadyOpened !== true) {
      throw new Error('❌ Requirement 4.3 failed: alreadyOpened should be true');
    }
    if (secondOpenData.card.messageText) {
      throw new Error('❌ Requirement 4.5 failed: Full content should NOT be returned on subsequent attempts');
    }
    if (secondOpenData.card.collectionId) {
      throw new Error('❌ Requirement 4.5 failed: collectionId should NOT be returned on subsequent attempts');
    }
    if (!secondOpenData.card.title) {
      throw new Error('❌ Title should still be returned for already opened cards');
    }

    console.log('✅ Requirements 4.3, 4.5 verified for subsequent opening');

    // Step 4: Test with invalid card ID
    console.log('\n📝 Step 4: Testing with invalid card ID...');
    const invalidIdResponse = await fetch(`${BASE_URL}/api/cards/invalid-id/open`, {
      method: 'POST',
    });

    if (invalidIdResponse.status !== 400) {
      throw new Error(`Expected 400 for invalid ID, got ${invalidIdResponse.status}`);
    }

    const invalidIdData = await invalidIdResponse.json();
    console.log('✅ Invalid ID handled correctly');
    console.log(`   Status: ${invalidIdResponse.status}`);
    console.log(`   Error: ${invalidIdData.error}`);

    // Step 5: Test with non-existent card ID
    console.log('\n📝 Step 5: Testing with non-existent card ID...');
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const notFoundResponse = await fetch(`${BASE_URL}/api/cards/${nonExistentId}/open`, {
      method: 'POST',
    });

    if (notFoundResponse.status !== 404) {
      throw new Error(`Expected 404 for non-existent card, got ${notFoundResponse.status}`);
    }

    const notFoundData = await notFoundResponse.json();
    console.log('✅ Non-existent card handled correctly');
    console.log(`   Status: ${notFoundResponse.status}`);
    console.log(`   Error: ${notFoundData.error}`);

    // Step 6: Verify database state
    console.log('\n📝 Step 6: Verifying database state...');
    const updatedCard = await cardService.findById(testCard.id);
    
    if (!updatedCard) {
      throw new Error('Card not found in database');
    }

    console.log('✅ Database state verified:');
    console.log(`   Status: ${updatedCard.status}`);
    console.log(`   Opened At: ${updatedCard.openedAt}`);
    console.log(`   Can Open: ${await cardService.canOpen(testCard.id)}`);

    if (updatedCard.status !== 'opened') {
      throw new Error('Database status should be "opened"');
    }
    if (!updatedCard.openedAt) {
      throw new Error('Database should have openedAt timestamp');
    }
    if (await cardService.canOpen(testCard.id)) {
      throw new Error('canOpen should return false for opened card');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📋 Summary:');
    console.log('   ✅ First opening returns full content (Req 4.5)');
    console.log('   ✅ Status changes to "opened" (Req 4.2)');
    console.log('   ✅ Timestamp recorded (Req 4.4)');
    console.log('   ✅ Subsequent openings blocked from full content (Req 4.3, 4.5)');
    console.log('   ✅ Invalid ID handled correctly');
    console.log('   ✅ Non-existent card handled correctly');
    console.log('   ✅ Database state consistent');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run tests
console.log('Starting Card Opening API Route tests...');
console.log('Make sure the Next.js dev server is running on http://localhost:3000\n');

testCardOpenRoute()
  .then(() => {
    console.log('\n✅ Test suite completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
