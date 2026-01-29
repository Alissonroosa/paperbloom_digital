/**
 * Test script for Card Collection Fetch API Routes
 * Tests both GET /api/card-collections/[id] and GET /api/card-collections/slug/[slug]
 * 
 * Requirements tested: 5.1, 5.5
 */

import { cardCollectionService } from './src/services/CardCollectionService';
import { cardService } from './src/services/CardService';

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function logResult(test: string, passed: boolean, message: string) {
  results.push({ test, passed, message });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
}

async function runTests() {
  console.log('🧪 Testing Card Collection Fetch API Routes\n');
  console.log('=' .repeat(60));

  let testCollectionId: string;
  let testSlug: string;
  let testCardId: string;

  try {
    // Setup: Create a test collection with cards
    console.log('\n📝 Setup: Creating test collection...');
    
    const collection = await cardCollectionService.create({
      recipientName: 'Test Recipient',
      senderName: 'Test Sender',
      contactEmail: 'test@example.com',
    });
    
    testCollectionId = collection.id;
    console.log(`Created collection: ${testCollectionId}`);

    // Create 12 cards
    const cards = await cardService.createBulk(testCollectionId);
    testCardId = cards[0].id;
    console.log(`Created ${cards.length} cards`);

    // Update collection with a slug (simulate post-payment)
    const updatedCollection = await cardCollectionService.updateQRCode(
      testCollectionId,
      'https://example.com/qr/test.png',
      'test-recipient-12-cartas-2024'
    );
    testSlug = updatedCollection.slug!;
    console.log(`Updated collection with slug: ${testSlug}`);

    // Mark one card as opened
    await cardService.markAsOpened(testCardId);
    console.log(`Marked card ${testCardId} as opened`);

    console.log('\n' + '='.repeat(60));
    console.log('🧪 Running Tests\n');

    // Test 1: Fetch collection by ID
    console.log('\n--- Test 1: GET /api/card-collections/[id] ---');
    try {
      const response = await fetch(`${BASE_URL}/api/card-collections/${testCollectionId}`);
      const data = await response.json();

      if (response.status === 200) {
        logResult(
          'Fetch by ID - Status',
          true,
          'Returns 200 OK'
        );

        // Verify collection data
        if (data.collection && data.collection.id === testCollectionId) {
          logResult(
            'Fetch by ID - Collection Data',
            true,
            'Collection data is present and correct'
          );
        } else {
          logResult(
            'Fetch by ID - Collection Data',
            false,
            'Collection data is missing or incorrect'
          );
        }

        // Verify cards array
        if (data.cards && Array.isArray(data.cards) && data.cards.length === 12) {
          logResult(
            'Fetch by ID - Cards Count',
            true,
            'Returns exactly 12 cards'
          );
        } else {
          logResult(
            'Fetch by ID - Cards Count',
            false,
            `Expected 12 cards, got ${data.cards?.length || 0}`
          );
        }

        // Verify unopened card has full content
        const unopenedCard = data.cards.find((c: any) => c.status === 'unopened');
        if (unopenedCard && unopenedCard.messageText && unopenedCard.title) {
          logResult(
            'Fetch by ID - Unopened Card Content',
            true,
            'Unopened cards include full content (messageText, title)'
          );
        } else {
          logResult(
            'Fetch by ID - Unopened Card Content',
            false,
            'Unopened cards missing content'
          );
        }

        // Verify opened card does NOT have full content (Requirement 5.5)
        const openedCard = data.cards.find((c: any) => c.status === 'opened');
        if (openedCard) {
          const hasMessageText = 'messageText' in openedCard;
          const hasImageUrl = 'imageUrl' in openedCard;
          const hasYoutubeUrl = 'youtubeUrl' in openedCard;
          
          if (!hasMessageText && !hasImageUrl && !hasYoutubeUrl) {
            logResult(
              'Fetch by ID - Opened Card Content Filtering',
              true,
              'Opened cards correctly omit messageText, imageUrl, youtubeUrl'
            );
          } else {
            logResult(
              'Fetch by ID - Opened Card Content Filtering',
              false,
              'Opened cards still contain sensitive content'
            );
          }

          // Verify opened card still has basic metadata
          if (openedCard.id && openedCard.title && openedCard.status && openedCard.openedAt) {
            logResult(
              'Fetch by ID - Opened Card Metadata',
              true,
              'Opened cards include basic metadata (id, title, status, openedAt)'
            );
          } else {
            logResult(
              'Fetch by ID - Opened Card Metadata',
              false,
              'Opened cards missing basic metadata'
            );
          }
        }
      } else {
        logResult(
          'Fetch by ID - Status',
          false,
          `Expected 200, got ${response.status}`
        );
      }
    } catch (error) {
      logResult(
        'Fetch by ID',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 2: Fetch collection by slug
    console.log('\n--- Test 2: GET /api/card-collections/slug/[slug] ---');
    try {
      const response = await fetch(`${BASE_URL}/api/card-collections/slug/${testSlug}`);
      const data = await response.json();

      if (response.status === 200) {
        logResult(
          'Fetch by Slug - Status',
          true,
          'Returns 200 OK'
        );

        // Verify collection data
        if (data.collection && data.collection.slug === testSlug) {
          logResult(
            'Fetch by Slug - Collection Data',
            true,
            'Collection data is present with correct slug'
          );
        } else {
          logResult(
            'Fetch by Slug - Collection Data',
            false,
            'Collection data is missing or slug is incorrect'
          );
        }

        // Verify cards array
        if (data.cards && Array.isArray(data.cards) && data.cards.length === 12) {
          logResult(
            'Fetch by Slug - Cards Count',
            true,
            'Returns exactly 12 cards'
          );
        } else {
          logResult(
            'Fetch by Slug - Cards Count',
            false,
            `Expected 12 cards, got ${data.cards?.length || 0}`
          );
        }

        // Verify card ordering
        const isOrdered = data.cards.every((card: any, index: number) => card.order === index + 1);
        if (isOrdered) {
          logResult(
            'Fetch by Slug - Card Ordering',
            true,
            'Cards are correctly ordered from 1 to 12'
          );
        } else {
          logResult(
            'Fetch by Slug - Card Ordering',
            false,
            'Cards are not in correct order'
          );
        }

        // Verify content filtering (Requirement 5.5)
        const openedCard = data.cards.find((c: any) => c.status === 'opened');
        if (openedCard) {
          const hasMessageText = 'messageText' in openedCard;
          const hasImageUrl = 'imageUrl' in openedCard;
          const hasYoutubeUrl = 'youtubeUrl' in openedCard;
          
          if (!hasMessageText && !hasImageUrl && !hasYoutubeUrl) {
            logResult(
              'Fetch by Slug - Content Filtering',
              true,
              'Opened cards correctly omit sensitive content'
            );
          } else {
            logResult(
              'Fetch by Slug - Content Filtering',
              false,
              'Opened cards still contain sensitive content'
            );
          }
        }
      } else {
        logResult(
          'Fetch by Slug - Status',
          false,
          `Expected 200, got ${response.status}`
        );
      }
    } catch (error) {
      logResult(
        'Fetch by Slug',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 3: Invalid ID format
    console.log('\n--- Test 3: Invalid ID Format ---');
    try {
      const response = await fetch(`${BASE_URL}/api/card-collections/invalid-id`);
      const data = await response.json();

      if (response.status === 400 && data.error?.code === 'INVALID_ID') {
        logResult(
          'Invalid ID Format',
          true,
          'Returns 400 with INVALID_ID error code'
        );
      } else {
        logResult(
          'Invalid ID Format',
          false,
          `Expected 400 with INVALID_ID, got ${response.status}`
        );
      }
    } catch (error) {
      logResult(
        'Invalid ID Format',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 4: Non-existent collection ID
    console.log('\n--- Test 4: Non-existent Collection ID ---');
    try {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`${BASE_URL}/api/card-collections/${fakeId}`);
      const data = await response.json();

      if (response.status === 404 && data.error?.code === 'NOT_FOUND') {
        logResult(
          'Non-existent ID',
          true,
          'Returns 404 with NOT_FOUND error code'
        );
      } else {
        logResult(
          'Non-existent ID',
          false,
          `Expected 404 with NOT_FOUND, got ${response.status}`
        );
      }
    } catch (error) {
      logResult(
        'Non-existent ID',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 5: Non-existent slug
    console.log('\n--- Test 5: Non-existent Slug ---');
    try {
      const response = await fetch(`${BASE_URL}/api/card-collections/slug/non-existent-slug`);
      const data = await response.json();

      if (response.status === 404 && data.error?.code === 'NOT_FOUND') {
        logResult(
          'Non-existent Slug',
          true,
          'Returns 404 with NOT_FOUND error code'
        );
      } else {
        logResult(
          'Non-existent Slug',
          false,
          `Expected 404 with NOT_FOUND, got ${response.status}`
        );
      }
    } catch (error) {
      logResult(
        'Non-existent Slug',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Test 6: Empty slug
    console.log('\n--- Test 6: Empty Slug ---');
    try {
      const response = await fetch(`${BASE_URL}/api/card-collections/slug/`);
      
      // This might return 404 from Next.js routing or 400 from our validation
      if (response.status === 404 || response.status === 400) {
        logResult(
          'Empty Slug',
          true,
          `Returns ${response.status} (route not found or validation error)`
        );
      } else {
        logResult(
          'Empty Slug',
          false,
          `Expected 404 or 400, got ${response.status}`
        );
      }
    } catch (error) {
      logResult(
        'Empty Slug',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} (${percentage}%)`);
  console.log(`Failed: ${total - passed}`);

  if (passed === total) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.');
  }

  console.log('\n' + '='.repeat(60));
}

// Run tests
runTests().catch(console.error);
