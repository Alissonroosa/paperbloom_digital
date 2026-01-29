/**
 * Manual test for POST /api/checkout/card-collection
 * Tests the checkout session creation flow for card collections
 * 
 * Run with: npx ts-node --project tsconfig.node.json test-card-collection-checkout.ts
 */

import { cardCollectionService } from './src/services/CardCollectionService';
import { cardService } from './src/services/CardService';
import { CARD_TEMPLATES } from './src/types/card';

async function testCardCollectionCheckout() {
  console.log('🧪 Testing POST /api/checkout/card-collection...\n');

  try {
    // Step 1: Create a test card collection
    console.log('📝 Step 1: Creating test card collection...');
    const collection = await cardCollectionService.create({
      recipientName: 'João Silva',
      senderName: 'Maria Santos',
      contactEmail: 'maria@example.com',
    });
    console.log(`   ✓ Created collection: ${collection.id}`);
    console.log(`   ✓ Status: ${collection.status}`);

    // Step 2: Create 12 cards for the collection
    console.log('\n📝 Step 2: Creating 12 cards...');
    const cards = await cardService.createBulk(collection.id, CARD_TEMPLATES);
    console.log(`   ✓ Created ${cards.length} cards`);

    // Step 3: Test checkout API
    console.log('\n📝 Step 3: Testing checkout API...');
    const response = await fetch('http://localhost:3000/api/checkout/card-collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionId: collection.id,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('   ✗ Checkout failed:', error);
      throw new Error(`Checkout failed: ${error.error.message}`);
    }

    const result = await response.json();
    console.log('   ✓ Checkout session created successfully');
    console.log(`   ✓ Session ID: ${result.sessionId}`);
    console.log(`   ✓ Checkout URL: ${result.url}`);

    // Step 4: Verify collection was updated with session ID
    console.log('\n📝 Step 4: Verifying collection update...');
    const updatedCollection = await cardCollectionService.findById(collection.id);
    
    if (!updatedCollection) {
      throw new Error('Collection not found after checkout');
    }

    if (updatedCollection.stripeSessionId !== result.sessionId) {
      throw new Error('Collection was not updated with Stripe session ID');
    }

    console.log('   ✓ Collection updated with Stripe session ID');
    console.log(`   ✓ Stripe Session ID: ${updatedCollection.stripeSessionId}`);

    // Step 5: Test error cases
    console.log('\n📝 Step 5: Testing error cases...');

    // Test with invalid UUID
    console.log('   Testing invalid UUID...');
    const invalidUuidResponse = await fetch('http://localhost:3000/api/checkout/card-collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionId: 'invalid-uuid',
      }),
    });

    if (invalidUuidResponse.status !== 400) {
      throw new Error('Expected 400 for invalid UUID');
    }
    console.log('   ✓ Invalid UUID rejected correctly');

    // Test with non-existent collection
    console.log('   Testing non-existent collection...');
    const nonExistentResponse = await fetch('http://localhost:3000/api/checkout/card-collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionId: '00000000-0000-0000-0000-000000000000',
      }),
    });

    if (nonExistentResponse.status !== 404) {
      throw new Error('Expected 404 for non-existent collection');
    }
    console.log('   ✓ Non-existent collection rejected correctly');

    // Test with already paid collection
    console.log('   Testing already paid collection...');
    await cardCollectionService.updateStatus(collection.id, 'paid');
    
    const alreadyPaidResponse = await fetch('http://localhost:3000/api/checkout/card-collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collectionId: collection.id,
      }),
    });

    if (alreadyPaidResponse.status !== 400) {
      throw new Error('Expected 400 for already paid collection');
    }
    console.log('   ✓ Already paid collection rejected correctly');

    console.log('\n🎉 All tests passed! POST /api/checkout/card-collection is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`   - Collection ID: ${collection.id}`);
    console.log(`   - Stripe Session ID: ${result.sessionId}`);
    console.log(`   - Checkout URL: ${result.url}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Visit the checkout URL to complete payment (test mode)');
    console.log('   2. Verify webhook processing updates the collection');
    console.log('   3. Test the complete flow in the UI');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCardCollectionCheckout();
