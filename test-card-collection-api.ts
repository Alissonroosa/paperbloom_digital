/**
 * Test script for card collection creation API
 * Tests the POST /api/card-collections/create endpoint
 */

import { cardCollectionService } from './src/services/CardCollectionService';
import { cardService } from './src/services/CardService';
import { validateCreateCardCollection } from './src/types/card';

async function testCardCollectionCreation() {
  console.log('🧪 Testing Card Collection Creation API Logic...\n');

  try {
    // Test 1: Validate input schema
    console.log('Test 1: Validating input schema...');
    const testInput = {
      recipientName: 'Maria Silva',
      senderName: 'João Santos',
      contactEmail: 'joao@example.com',
    };

    const validation = validateCreateCardCollection(testInput);
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.error);
      return;
    }
    console.log('✅ Input validation passed');

    // Test 2: Create card collection
    console.log('\nTest 2: Creating card collection...');
    const collection = await cardCollectionService.create(validation.data);
    console.log('✅ Card collection created:', {
      id: collection.id,
      recipientName: collection.recipientName,
      senderName: collection.senderName,
      status: collection.status,
    });

    // Test 3: Create 12 cards with templates
    console.log('\nTest 3: Creating 12 cards with templates...');
    const cards = await cardService.createBulk(collection.id);
    console.log(`✅ Created ${cards.length} cards`);

    // Verify all cards
    console.log('\nVerifying cards:');
    cards.forEach((card, index) => {
      console.log(`  Card ${index + 1}:`, {
        order: card.order,
        title: card.title.substring(0, 40) + '...',
        messageLength: card.messageText.length,
        status: card.status,
      });
    });

    // Test 4: Verify card count
    console.log('\nTest 4: Verifying card count...');
    if (cards.length !== 12) {
      console.error(`❌ Expected 12 cards, got ${cards.length}`);
      return;
    }
    console.log('✅ Correct number of cards created');

    // Test 5: Verify card order
    console.log('\nTest 5: Verifying card order...');
    const orders = cards.map(c => c.order).sort((a, b) => a - b);
    const expectedOrders = Array.from({ length: 12 }, (_, i) => i + 1);
    const ordersMatch = JSON.stringify(orders) === JSON.stringify(expectedOrders);
    if (!ordersMatch) {
      console.error('❌ Card orders do not match expected sequence');
      console.error('Expected:', expectedOrders);
      console.error('Got:', orders);
      return;
    }
    console.log('✅ Card orders are correct (1-12)');

    // Test 6: Verify all cards have status 'unopened'
    console.log('\nTest 6: Verifying card status...');
    const allUnopened = cards.every(c => c.status === 'unopened');
    if (!allUnopened) {
      console.error('❌ Not all cards have status "unopened"');
      return;
    }
    console.log('✅ All cards have status "unopened"');

    // Test 7: Verify all cards have content
    console.log('\nTest 7: Verifying card content...');
    const allHaveContent = cards.every(c => c.title && c.messageText);
    if (!allHaveContent) {
      console.error('❌ Not all cards have title and message');
      return;
    }
    console.log('✅ All cards have title and message');

    // Test 8: Verify collection can be retrieved
    console.log('\nTest 8: Retrieving collection by ID...');
    const retrievedCollection = await cardCollectionService.findById(collection.id);
    if (!retrievedCollection) {
      console.error('❌ Could not retrieve collection');
      return;
    }
    console.log('✅ Collection retrieved successfully');

    // Test 9: Verify cards can be retrieved by collection ID
    console.log('\nTest 9: Retrieving cards by collection ID...');
    const retrievedCards = await cardService.findByCollectionId(collection.id);
    if (retrievedCards.length !== 12) {
      console.error(`❌ Expected 12 cards, got ${retrievedCards.length}`);
      return;
    }
    console.log('✅ All cards retrieved successfully');

    console.log('\n✅ All tests passed! API logic is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`  - Collection ID: ${collection.id}`);
    console.log(`  - Recipient: ${collection.recipientName}`);
    console.log(`  - Sender: ${collection.senderName}`);
    console.log(`  - Cards created: ${cards.length}`);
    console.log(`  - Status: ${collection.status}`);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testCardCollectionCreation()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
