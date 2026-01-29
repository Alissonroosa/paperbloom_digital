/**
 * Test script for Card API routes
 * Tests GET and PATCH endpoints for /api/cards/[id]
 * 
 * Requirements tested: 1.4, 1.5, 1.6, 1.7, 3.2
 */

import { cardCollectionService } from './src/services/CardCollectionService';
import { cardService } from './src/services/CardService';

async function testCardApiRoutes() {
  console.log('🧪 Testing Card API Routes\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create a test collection with 12 cards
    console.log('\n📝 Step 1: Creating test collection...');
    const collection = await cardCollectionService.create({
      recipientName: 'Test Recipient',
      senderName: 'Test Sender',
      contactEmail: 'test@example.com',
    });
    console.log('✅ Collection created:', collection.id);

    // Create 12 cards for the collection
    const cards = await cardService.createBulk(collection.id);
    console.log(`✅ ${cards.length} cards created`);

    if (cards.length === 0) {
      throw new Error('No cards found for collection');
    }

    const testCard = cards[0];
    console.log(`\n📋 Test card ID: ${testCard.id}`);
    console.log(`   Status: ${testCard.status}`);
    console.log(`   Title: ${testCard.title}`);

    // Step 2: Test GET endpoint
    console.log('\n🔍 Step 2: Testing GET /api/cards/[id]...');
    const baseUrl = 'http://localhost:3001';
    
    const getResponse = await fetch(`${baseUrl}/api/cards/${testCard.id}`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET request successful');
      console.log('   Card retrieved:', getData.card.id);
      console.log('   Title:', getData.card.title);
      console.log('   Status:', getData.card.status);
    } else {
      console.log('❌ GET request failed:', getData);
    }

    // Step 3: Test PATCH endpoint with valid data
    console.log('\n✏️  Step 3: Testing PATCH /api/cards/[id] with valid data...');
    
    const updateData = {
      title: 'Updated Title - Test',
      messageText: 'This is an updated message for testing purposes.',
      imageUrl: 'https://example.com/test-image.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    };

    const patchResponse = await fetch(`${baseUrl}/api/cards/${testCard.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    const patchData = await patchResponse.json();
    
    if (patchResponse.ok) {
      console.log('✅ PATCH request successful');
      console.log('   Updated title:', patchData.card.title);
      console.log('   Updated message:', patchData.card.messageText.substring(0, 50) + '...');
      console.log('   Image URL:', patchData.card.imageUrl);
      console.log('   YouTube URL:', patchData.card.youtubeUrl);
    } else {
      console.log('❌ PATCH request failed:', patchData);
    }

    // Step 4: Test PATCH with invalid data (message too long)
    console.log('\n🚫 Step 4: Testing PATCH with invalid data (message > 500 chars)...');
    
    const invalidData = {
      messageText: 'a'.repeat(501), // 501 characters - exceeds limit
    };

    const invalidPatchResponse = await fetch(`${baseUrl}/api/cards/${testCard.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    });
    const invalidPatchData = await invalidPatchResponse.json();
    
    if (invalidPatchResponse.status === 400) {
      console.log('✅ Validation error correctly returned (400)');
      console.log('   Error code:', invalidPatchData.error.code);
      console.log('   Error message:', invalidPatchData.error.message);
    } else {
      console.log('❌ Expected 400 error, got:', invalidPatchResponse.status);
    }

    // Step 5: Test PATCH with invalid YouTube URL
    console.log('\n🚫 Step 5: Testing PATCH with invalid YouTube URL...');
    
    const invalidYouTubeData = {
      youtubeUrl: 'https://not-youtube.com/video',
    };

    const invalidYouTubeResponse = await fetch(`${baseUrl}/api/cards/${testCard.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidYouTubeData),
    });
    const invalidYouTubeData2 = await invalidYouTubeResponse.json();
    
    if (invalidYouTubeResponse.status === 400) {
      console.log('✅ Validation error correctly returned (400)');
      console.log('   Error code:', invalidYouTubeData2.error.code);
    } else {
      console.log('❌ Expected 400 error, got:', invalidYouTubeResponse.status);
    }

    // Step 6: Mark card as opened
    console.log('\n🔓 Step 6: Marking card as opened...');
    await cardService.markAsOpened(testCard.id);
    console.log('✅ Card marked as opened');

    // Step 7: Test PATCH on opened card (should fail)
    console.log('\n🚫 Step 7: Testing PATCH on opened card (should fail)...');
    
    const openedCardUpdate = {
      title: 'This should not work',
    };

    const openedPatchResponse = await fetch(`${baseUrl}/api/cards/${testCard.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openedCardUpdate),
    });
    const openedPatchData = await openedPatchResponse.json();
    
    if (openedPatchResponse.status === 403) {
      console.log('✅ Correctly blocked editing of opened card (403)');
      console.log('   Error code:', openedPatchData.error.code);
      console.log('   Error message:', openedPatchData.error.message);
    } else {
      console.log('❌ Expected 403 error, got:', openedPatchResponse.status);
    }

    // Step 8: Test GET with invalid UUID
    console.log('\n🚫 Step 8: Testing GET with invalid UUID...');
    
    const invalidGetResponse = await fetch(`${baseUrl}/api/cards/invalid-uuid`);
    const invalidGetData = await invalidGetResponse.json();
    
    if (invalidGetResponse.status === 400) {
      console.log('✅ Invalid UUID correctly rejected (400)');
      console.log('   Error code:', invalidGetData.error.code);
    } else {
      console.log('❌ Expected 400 error, got:', invalidGetResponse.status);
    }

    // Step 9: Test GET with non-existent UUID
    console.log('\n🚫 Step 9: Testing GET with non-existent UUID...');
    
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const notFoundResponse = await fetch(`${baseUrl}/api/cards/${nonExistentId}`);
    const notFoundData = await notFoundResponse.json();
    
    if (notFoundResponse.status === 404) {
      console.log('✅ Non-existent card correctly returned 404');
      console.log('   Error code:', notFoundData.error.code);
    } else {
      console.log('❌ Expected 404 error, got:', notFoundResponse.status);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All Card API route tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run tests
console.log('⚠️  Make sure the Next.js dev server is running on http://localhost:3001');
console.log('   Run: npm run dev\n');

testCardApiRoutes()
  .then(() => {
    console.log('✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
