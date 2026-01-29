/**
 * Checkpoint 16: Test Complete Creation and Editing Flow
 * 
 * This script tests:
 * 1. Creating a new card collection via UI
 * 2. Editing all 12 cards
 * 3. Verifying auto-save functionality
 * 4. Testing navigation between cards
 * 5. Verifying field validations
 */

import { CardCollectionService } from './src/services/CardCollectionService';
import { CardService } from './src/services/CardService';

const cardCollectionService = new CardCollectionService();
const cardService = new CardService();

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logResult(test: string, passed: boolean, message: string, details?: any) {
  results.push({ test, passed, message, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
  if (details) {
    console.log('   Details:', JSON.stringify(details, null, 2));
  }
}

async function testCreateNewCollection() {
  console.log('\n📝 Test 1: Creating a new card collection with 12 cards...');
  
  try {
    // Create collection
    const collection = await cardCollectionService.create({
      recipientName: 'Maria Silva',
      senderName: 'João Santos',
      contactEmail: 'joao@example.com'
    });

    if (!collection.id) {
      logResult('Create Collection', false, 'Collection ID not generated');
      return null;
    }

    // Create 12 cards with templates (simulating what the API route does)
    const cards = await cardService.createBulk(collection.id);

    if (cards.length !== 12) {
      logResult('Create Collection', false, `Expected 12 cards, got ${cards.length}`);
      return null;
    }

    logResult('Create Collection', true, 'Collection and 12 cards created successfully', {
      id: collection.id,
      recipientName: collection.recipientName,
      senderName: collection.senderName,
      cardsCreated: cards.length
    });

    return collection;
  } catch (error) {
    logResult('Create Collection', false, `Error: ${error.message}`);
    return null;
  }
}

async function testCardsCreatedWithCollection(collectionId: string) {
  console.log('\n📝 Test 2: Verifying 12 cards were created...');
  
  try {
    const cards = await cardService.findByCollectionId(collectionId);

    if (cards.length !== 12) {
      logResult('12 Cards Created', false, `Expected 12 cards, got ${cards.length}`);
      return null;
    }

    // Verify all cards have pre-filled content
    const allHaveContent = cards.every(card => 
      card.title && card.title.length > 0 &&
      card.messageText && card.messageText.length > 0
    );

    if (!allHaveContent) {
      logResult('12 Cards Created', false, 'Some cards missing pre-filled content');
      return null;
    }

    // Verify cards are ordered 1-12
    const orders = cards.map(c => c.order).sort((a, b) => a - b);
    const expectedOrders = Array.from({ length: 12 }, (_, i) => i + 1);
    const ordersCorrect = JSON.stringify(orders) === JSON.stringify(expectedOrders);

    if (!ordersCorrect) {
      logResult('12 Cards Created', false, 'Cards not properly ordered 1-12', { orders });
      return null;
    }

    logResult('12 Cards Created', true, 'All 12 cards created with correct order and content', {
      count: cards.length,
      sampleTitles: cards.slice(0, 3).map(c => c.title)
    });

    return cards;
  } catch (error) {
    logResult('12 Cards Created', false, `Error: ${error.message}`);
    return null;
  }
}

async function testEditAllCards(cards: any[]) {
  console.log('\n📝 Test 3: Editing all 12 cards...');
  
  try {
    let successCount = 0;
    const editedCards = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const updatedData = {
        title: `Carta ${i + 1} - Editada`,
        messageText: `Esta é a mensagem editada para a carta ${i + 1}. Conteúdo personalizado pelo usuário.`,
        imageUrl: i % 3 === 0 ? 'https://example.com/image.jpg' : null,
        youtubeUrl: i % 4 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null
      };

      const updated = await cardService.update(card.id, updatedData);
      
      if (updated.title === updatedData.title && updated.messageText === updatedData.messageText) {
        successCount++;
        editedCards.push(updated);
      }
    }

    if (successCount === 12) {
      logResult('Edit All Cards', true, 'Successfully edited all 12 cards', {
        editedCount: successCount,
        sampleEdits: editedCards.slice(0, 2).map(c => ({
          order: c.order,
          title: c.title,
          hasImage: !!c.imageUrl,
          hasMusic: !!c.youtubeUrl
        }))
      });
      return editedCards;
    } else {
      logResult('Edit All Cards', false, `Only ${successCount}/12 cards edited successfully`);
      return null;
    }
  } catch (error) {
    logResult('Edit All Cards', false, `Error: ${error.message}`);
    return null;
  }
}

async function testPersistence(cards: any[]) {
  console.log('\n📝 Test 4: Verifying persistence (auto-save)...');
  
  try {
    // Re-fetch cards from database to verify persistence
    const refetchedCards = await cardService.findByCollectionId(cards[0].collectionId);

    let allPersisted = true;
    const mismatches = [];

    for (const originalCard of cards) {
      const refetched = refetchedCards.find(c => c.id === originalCard.id);
      
      if (!refetched) {
        allPersisted = false;
        mismatches.push({ cardId: originalCard.id, issue: 'Card not found after refetch' });
        continue;
      }

      if (refetched.title !== originalCard.title || 
          refetched.messageText !== originalCard.messageText ||
          refetched.imageUrl !== originalCard.imageUrl ||
          refetched.youtubeUrl !== originalCard.youtubeUrl) {
        allPersisted = false;
        mismatches.push({
          cardId: originalCard.id,
          issue: 'Data mismatch',
          original: { title: originalCard.title, message: originalCard.messageText },
          refetched: { title: refetched.title, message: refetched.messageText }
        });
      }
    }

    if (allPersisted) {
      logResult('Persistence/Auto-save', true, 'All edits persisted correctly to database');
    } else {
      logResult('Persistence/Auto-save', false, 'Some edits not persisted', { mismatches });
    }

    return allPersisted;
  } catch (error) {
    logResult('Persistence/Auto-save', false, `Error: ${error.message}`);
    return false;
  }
}

async function testNavigation(cards: any[]) {
  console.log('\n📝 Test 5: Testing navigation between cards...');
  
  try {
    // Simulate navigation by fetching cards in different orders
    const navigationTests = [
      { from: 0, to: 11, description: 'First to Last' },
      { from: 11, to: 0, description: 'Last to First' },
      { from: 5, to: 6, description: 'Sequential forward' },
      { from: 8, to: 3, description: 'Random jump backward' }
    ];

    let allNavigationPassed = true;

    for (const nav of navigationTests) {
      const fromCard = cards[nav.from];
      const toCard = cards[nav.to];

      // Verify we can access both cards
      const fetchedFrom = await cardService.findById(fromCard.id);
      const fetchedTo = await cardService.findById(toCard.id);

      if (!fetchedFrom || !fetchedTo) {
        allNavigationPassed = false;
        logResult(`Navigation: ${nav.description}`, false, 'Failed to fetch cards');
      } else {
        logResult(`Navigation: ${nav.description}`, true, `Successfully navigated from card ${nav.from + 1} to ${nav.to + 1}`);
      }
    }

    return allNavigationPassed;
  } catch (error) {
    logResult('Navigation', false, `Error: ${error.message}`);
    return false;
  }
}

async function testFieldValidations() {
  console.log('\n📝 Test 6: Testing field validations...');
  
  try {
    // Create a test collection for validation tests
    const testCollection = await cardCollectionService.create({
      recipientName: 'Test User',
      senderName: 'Validator',
      contactEmail: 'test@example.com'
    });

    // Create 12 cards for this collection
    await cardService.createBulk(testCollection.id);
    const testCards = await cardService.findByCollectionId(testCollection.id);

    const validationTests = [
      {
        name: 'Text exceeding 500 chars',
        data: { messageText: 'a'.repeat(501) },
        shouldFail: true
      },
      {
        name: 'Text at 500 chars limit',
        data: { messageText: 'a'.repeat(500) },
        shouldFail: false
      },
      {
        name: 'Empty title',
        data: { title: '' },
        shouldFail: true
      },
      {
        name: 'Invalid YouTube URL',
        data: { youtubeUrl: 'https://example.com/not-youtube' },
        shouldFail: true
      },
      {
        name: 'Valid YouTube URL',
        data: { youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        shouldFail: false
      },
      {
        name: 'Invalid image URL',
        data: { imageUrl: 'not-a-url' },
        shouldFail: true
      },
      {
        name: 'Valid image URL',
        data: { imageUrl: 'https://example.com/image.jpg' },
        shouldFail: false
      }
    ];

    let validationsPassed = 0;
    let validationsFailed = 0;

    // Use a different card for each test to avoid state issues
    for (let i = 0; i < validationTests.length; i++) {
      const test = validationTests[i];
      const testCard = testCards[i % testCards.length]; // Cycle through cards if needed
      
      try {
        await cardService.update(testCard.id, test.data);
        
        if (test.shouldFail) {
          logResult(`Validation: ${test.name}`, false, 'Expected validation to fail but it passed');
          validationsFailed++;
        } else {
          logResult(`Validation: ${test.name}`, true, 'Validation passed as expected');
          validationsPassed++;
        }
      } catch (error) {
        if (test.shouldFail) {
          logResult(`Validation: ${test.name}`, true, 'Validation correctly rejected invalid data');
          validationsPassed++;
        } else {
          logResult(`Validation: ${test.name}`, false, `Validation incorrectly rejected valid data: ${error.message}`);
          validationsFailed++;
        }
      }
    }

    return validationsFailed === 0;
  } catch (error) {
    logResult('Field Validations', false, `Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Checkpoint 16: Full Flow Testing\n');
  console.log('=' .repeat(60));

  // Test 1: Create collection
  const collection = await testCreateNewCollection();
  if (!collection) {
    console.log('\n❌ Cannot continue - collection creation failed');
    return printSummary();
  }

  // Test 2: Verify 12 cards created
  const cards = await testCardsCreatedWithCollection(collection.id);
  if (!cards) {
    console.log('\n❌ Cannot continue - cards not created properly');
    return printSummary();
  }

  // Test 3: Edit all cards
  const editedCards = await testEditAllCards(cards);
  if (!editedCards) {
    console.log('\n❌ Cannot continue - editing failed');
    return printSummary();
  }

  // Test 4: Verify persistence
  await testPersistence(editedCards);

  // Test 5: Test navigation
  await testNavigation(editedCards);

  // Test 6: Test validations
  await testFieldValidations();

  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.test}: ${r.message}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED! The creation and editing flow is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.');
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
