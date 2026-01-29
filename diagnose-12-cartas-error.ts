/**
 * Comprehensive diagnostic script for 12 Cartas editor page error
 */

import { db } from './src/lib/db';
import { cardCollectionService } from './src/services/CardCollectionService';
import { cardService } from './src/services/CardService';

async function diagnose() {
  console.log('🔍 Diagnosing 12 Cartas Editor Error...\n');

  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);

    // Test 2: Check if tables exist
    console.log('\n2️⃣ Checking if tables exist...');
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('card_collections', 'cards')
      ORDER BY table_name
    `);
    console.log('Tables found:', tablesResult.rows.map(r => r.table_name));
    
    if (tablesResult.rows.length !== 2) {
      console.error('❌ Missing tables! Expected: card_collections, cards');
      return;
    }
    console.log('✅ All required tables exist');

    // Test 3: Create a test collection
    console.log('\n3️⃣ Testing CardCollectionService.create()...');
    const testCollection = await cardCollectionService.create({
      recipientName: 'Test Recipient',
      senderName: 'Test Sender',
      contactEmail: 'test@example.com',
    });
    console.log('✅ Collection created:', testCollection.id);

    // Test 4: Create 12 cards
    console.log('\n4️⃣ Testing CardService.createBulk()...');
    const testCards = await cardService.createBulk(testCollection.id);
    console.log('✅ Cards created:', testCards.length);
    
    if (testCards.length !== 12) {
      console.error('❌ Expected 12 cards, got:', testCards.length);
      return;
    }

    // Test 5: Fetch collection
    console.log('\n5️⃣ Testing CardCollectionService.findById()...');
    const fetchedCollection = await cardCollectionService.findById(testCollection.id);
    console.log('✅ Collection fetched:', fetchedCollection?.id);

    // Test 6: Fetch cards
    console.log('\n6️⃣ Testing CardService.findByCollectionId()...');
    const fetchedCards = await cardService.findByCollectionId(testCollection.id);
    console.log('✅ Cards fetched:', fetchedCards.length);

    // Test 7: Update a card
    console.log('\n7️⃣ Testing CardService.update()...');
    const updatedCard = await cardService.update(testCards[0].id, {
      title: 'Updated Title',
      messageText: 'Updated message',
    });
    console.log('✅ Card updated:', updatedCard.id);

    // Clean up
    console.log('\n8️⃣ Cleaning up test data...');
    await db.query('DELETE FROM cards WHERE collection_id = $1', [testCollection.id]);
    await db.query('DELETE FROM card_collections WHERE id = $1', [testCollection.id]);
    console.log('✅ Test data cleaned up');

    console.log('\n✅ All diagnostic tests passed!');
    console.log('\n📝 Summary:');
    console.log('- Database connection: ✅');
    console.log('- Tables exist: ✅');
    console.log('- Collection creation: ✅');
    console.log('- Bulk card creation: ✅');
    console.log('- Collection fetching: ✅');
    console.log('- Cards fetching: ✅');
    console.log('- Card updating: ✅');
    console.log('\n💡 The backend services are working correctly.');
    console.log('The error is likely in the frontend or API route.');
    console.log('\n🔍 Next steps:');
    console.log('1. Check browser console for errors');
    console.log('2. Check Next.js server logs');
    console.log('3. Verify the dev server is running on http://localhost:3000');

  } catch (error) {
    console.error('\n❌ Diagnostic failed with error:');
    console.error(error);
    
    if (error instanceof Error) {
      console.error('\nError details:');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await db.end();
  }
}

// Run diagnostics
diagnose().catch(console.error);
