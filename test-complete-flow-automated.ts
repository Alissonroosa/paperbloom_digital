/**
 * Automated Test Script for Complete Flow - 12 Cartas
 * 
 * This script tests the complete technical flow:
 * 1. Create collection via API
 * 2. Update all 12 cards
 * 3. Verify data persistence
 * 4. Simulate checkout
 * 5. Verify post-payment state
 * 6. Test card opening logic
 * 7. Verify one-time opening constraint
 */

import { CardCollectionService } from './src/services/CardCollectionService';
import { CardService } from './src/services/CardService';
import { SlugService } from './src/services/SlugService';
import { QRCodeService } from './src/services/QRCodeService';

interface TestResult {
  step: string;
  passed: boolean;
  message: string;
  error?: any;
}

const results: TestResult[] = [];

function logResult(step: string, passed: boolean, message: string, error?: any) {
  results.push({ step, passed, message, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${step}: ${message}`);
  if (error) {
    console.error('   Error:', error);
  }
}

async function testCompleteFlow() {
  console.log('🚀 Starting Complete Flow Test for 12 Cartas\n');
  console.log('=' .repeat(60));
  
  const cardCollectionService = new CardCollectionService();
  const cardService = new CardService();
  const slugService = new SlugService();
  const qrCodeService = new QRCodeService();
  
  let collectionId: string;
  let cards: any[];
  let slug: string;
  
  try {
    // Step 1: Create collection with 12 cards
    console.log('\n📝 Step 1: Creating collection with 12 cards...');
    const collection = await cardCollectionService.create({
      recipientName: 'Maria Silva',
      senderName: 'João Santos',
      contactEmail: 'test@example.com'
    });
    
    collectionId = collection.id;
    
    if (collection && collection.id) {
      logResult('1.1', true, 'Collection created successfully');
    } else {
      logResult('1.1', false, 'Failed to create collection');
      return;
    }
    
    // Create 12 cards using bulk method (as the API does)
    cards = await cardService.createBulk(collectionId);
    
    if (cards.length === 12) {
      logResult('1.2', true, `Exactly 12 cards created (found ${cards.length})`);
    } else {
      logResult('1.2', false, `Expected 12 cards, found ${cards.length}`);
    }
    
    // Verify all cards have pre-filled content
    const allHaveContent = cards.every(card => 
      card.title && card.title.length > 0 &&
      card.messageText && card.messageText.length > 0
    );
    
    if (allHaveContent) {
      logResult('1.3', true, 'All cards have pre-filled content');
    } else {
      logResult('1.3', false, 'Some cards missing pre-filled content');
    }
    
    // Verify all cards are unopened
    const allUnopened = cards.every(card => card.status === 'unopened');
    
    if (allUnopened) {
      logResult('1.4', true, 'All cards have status "unopened"');
    } else {
      logResult('1.4', false, 'Some cards do not have status "unopened"');
    }
    
    // Step 2: Edit all 12 cards
    console.log('\n✏️  Step 2: Editing all 12 cards...');
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const updatedCard = await cardService.update(card.id, {
        title: `Carta ${i + 1} - Editada`,
        messageText: `Esta é a mensagem editada da carta ${i + 1}. Conteúdo personalizado para teste.`,
      });
      
      if (updatedCard.title.includes('Editada')) {
        // Success - don't log each one to avoid spam
      } else {
        logResult(`2.${i + 1}`, false, `Failed to update card ${i + 1}`);
      }
    }
    
    logResult('2.0', true, 'All 12 cards updated successfully');
    
    // Step 3: Verify persistence
    console.log('\n💾 Step 3: Verifying data persistence...');
    
    const reloadedCards = await cardService.findByCollectionId(collectionId);
    const allEdited = reloadedCards.every(card => card.title.includes('Editada'));
    
    if (allEdited) {
      logResult('3.1', true, 'All edits persisted correctly');
    } else {
      logResult('3.1', false, 'Some edits did not persist');
    }
    
    // Step 4: Simulate payment (update status, generate slug, QR code)
    console.log('\n💳 Step 4: Simulating payment completion...');
    
    // Generate slug (same way webhook does it)
    slug = slugService.generateSlug(collection.recipientName, collectionId);
    
    if (slug && slug.length > 0) {
      logResult('4.1', true, `Slug generated: ${slug}`);
    } else {
      logResult('4.1', false, 'Failed to generate slug');
      return;
    }
    
    // Generate QR code
    const fullUrl = `http://localhost:3000/cartas${slug}`;
    const qrCodeUrl = await qrCodeService.generate(fullUrl, collectionId);
    
    if (qrCodeUrl && qrCodeUrl.includes(collectionId)) {
      logResult('4.2', true, 'QR code generated successfully');
    } else {
      logResult('4.2', false, 'Failed to generate QR code');
    }
    
    // Update collection with slug and QR code
    await cardCollectionService.updateQRCode(collectionId, qrCodeUrl, slug);
    
    // Update status to paid
    const paidCollection = await cardCollectionService.updateStatus(collectionId, 'paid');
    
    if (paidCollection.status === 'paid') {
      logResult('4.3', true, 'Collection status updated to "paid"');
    } else {
      logResult('4.3', false, 'Failed to update status to "paid"');
    }
    
    // Step 5: Verify post-payment state
    console.log('\n🔍 Step 5: Verifying post-payment state...');
    
    const finalCollection = await cardCollectionService.findBySlug(slug);
    
    if (finalCollection && finalCollection.slug === slug) {
      logResult('5.1', true, 'Collection can be found by slug');
    } else {
      logResult('5.1', false, 'Cannot find collection by slug');
    }
    
    if (finalCollection?.qrCodeUrl && finalCollection.qrCodeUrl.length > 0) {
      logResult('5.2', true, 'QR code URL is stored');
    } else {
      logResult('5.2', false, 'QR code URL not stored');
    }
    
    // Step 6: Test card opening logic
    console.log('\n📬 Step 6: Testing card opening logic...');
    
    const cardToOpen = reloadedCards[0];
    
    // Check if card can be opened
    const canOpen = await cardService.canOpen(cardToOpen.id);
    
    if (canOpen) {
      logResult('6.1', true, 'Unopened card can be opened');
    } else {
      logResult('6.1', false, 'Unopened card cannot be opened (should be able to)');
    }
    
    // Open the card
    const openedCard = await cardService.markAsOpened(cardToOpen.id);
    
    if (openedCard.status === 'opened') {
      logResult('6.2', true, 'Card status changed to "opened"');
    } else {
      logResult('6.2', false, 'Card status did not change to "opened"');
    }
    
    if (openedCard.openedAt) {
      logResult('6.3', true, 'Opened timestamp recorded');
    } else {
      logResult('6.3', false, 'Opened timestamp not recorded');
    }
    
    // Step 7: Verify one-time opening constraint
    console.log('\n🔒 Step 7: Verifying one-time opening constraint...');
    
    const canOpenAgain = await cardService.canOpen(cardToOpen.id);
    
    if (!canOpenAgain) {
      logResult('7.1', true, 'Opened card cannot be opened again');
    } else {
      logResult('7.1', false, 'Opened card can still be opened (should not be possible)');
    }
    
    // Try to open again (should fail or return limited data)
    try {
      const secondOpen = await cardService.markAsOpened(cardToOpen.id);
      // If it doesn't throw, check if it returns the same timestamp
      if (secondOpen.openedAt?.getTime() === openedCard.openedAt?.getTime()) {
        logResult('7.2', true, 'Second open attempt returns original timestamp');
      } else {
        logResult('7.2', false, 'Second open attempt changed timestamp (should not)');
      }
    } catch (error) {
      logResult('7.2', true, 'Second open attempt properly rejected');
    }
    
    // Verify other cards are still unopened
    const otherCards = await cardService.findByCollectionId(collectionId);
    const unopenedCount = otherCards.filter(c => c.status === 'unopened').length;
    
    if (unopenedCount === 11) {
      logResult('7.3', true, `Other 11 cards remain unopened (found ${unopenedCount})`);
    } else {
      logResult('7.3', false, `Expected 11 unopened cards, found ${unopenedCount}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    logResult('ERROR', false, 'Test suite failed', error);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.step}: ${r.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    console.log('✅ All tests passed! The complete flow is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the issues above.');
  }
  
  return { passed, failed, total, results };
}

// Run the test
testCompleteFlow()
  .then((summary) => {
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
