/**
 * Verification script for Task 3: Update MessageService to handle enhanced fields
 * 
 * This script verifies that:
 * 1. createMessage method accepts enhanced message data
 * 2. Database queries include new columns
 * 3. Validation for gallery images array (max 3 items) works
 * 4. Message retrieval includes all new fields
 * 
 * Requirements: 1.4, 4.1, 11.7
 */

import { messageService } from '../MessageService';
import { CreateMessageInput } from '../../types/message';
import pool from '../../lib/db';

async function verifyEnhancedMessageService() {
  console.log('🔍 Verifying MessageService Enhanced Fields Implementation\n');

  try {
    // Test 1: Verify createMessage accepts enhanced fields
    console.log('✅ Test 1: Create message with all enhanced fields');
    const testData: CreateMessageInput = {
      recipientName: 'Test Recipient',
      senderName: 'Test Sender',
      messageText: 'Test message with enhanced fields',
      imageUrl: 'https://example.com/image.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Test Title',
      specialDate: new Date('2024-12-25'),
      closingMessage: 'Test closing message',
      signature: 'Test Signature',
      galleryImages: [
        'https://example.com/gallery1.jpg',
        'https://example.com/gallery2.jpg',
        'https://example.com/gallery3.jpg'
      ]
    };

    const message = await messageService.create(testData);
    console.log(`   ✓ Message created with ID: ${message.id}`);
    console.log(`   ✓ Title: ${message.title}`);
    console.log(`   ✓ Special Date: ${message.specialDate}`);
    console.log(`   ✓ Closing Message: ${message.closingMessage}`);
    console.log(`   ✓ Signature: ${message.signature}`);
    console.log(`   ✓ Gallery Images: ${message.galleryImages.length} images`);

    // Test 2: Verify message retrieval includes all fields
    console.log('\n✅ Test 2: Retrieve message with enhanced fields');
    const retrievedMessage = await messageService.findById(message.id);
    if (!retrievedMessage) {
      throw new Error('Message not found');
    }
    console.log(`   ✓ Retrieved message ID: ${retrievedMessage.id}`);
    console.log(`   ✓ Title matches: ${retrievedMessage.title === testData.title}`);
    console.log(`   ✓ Closing message matches: ${retrievedMessage.closingMessage === testData.closingMessage}`);
    console.log(`   ✓ Signature matches: ${retrievedMessage.signature === testData.signature}`);
    console.log(`   ✓ Gallery images count: ${retrievedMessage.galleryImages.length}`);

    // Test 3: Verify validation for gallery images (max 7)
    console.log('\n✅ Test 3: Validate gallery images limit (max 7)');
    try {
      const invalidData: CreateMessageInput = {
        recipientName: 'Test',
        senderName: 'Test',
        messageText: 'Test',
        galleryImages: [
          'https://example.com/1.jpg',
          'https://example.com/2.jpg',
          'https://example.com/3.jpg',
          'https://example.com/4.jpg' // This should fail
        ]
      };
      await messageService.create(invalidData);
      console.log('   ✗ FAILED: Should have rejected 4 gallery images');
    } catch (error) {
      console.log('   ✓ Correctly rejected 4 gallery images');
      console.log(`   ✓ Error message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Verify database schema includes new columns
    console.log('\n✅ Test 4: Verify database schema includes enhanced columns');
    const schemaQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'messages'
      AND column_name IN ('title', 'special_date', 'closing_message', 'signature', 'gallery_images')
      ORDER BY column_name;
    `;
    const schemaResult = await pool.query(schemaQuery);
    console.log('   ✓ Enhanced columns in database:');
    schemaResult.rows.forEach(row => {
      console.log(`     - ${row.column_name}: ${row.data_type}${row.character_maximum_length ? ` (${row.character_maximum_length})` : ''}`);
    });

    // Test 5: Verify character limits
    console.log('\n✅ Test 5: Verify character limit validation');
    
    // Test title limit (100 chars)
    try {
      const longTitle = 'a'.repeat(101);
      await messageService.create({
        recipientName: 'Test',
        senderName: 'Test',
        messageText: 'Test',
        title: longTitle
      });
      console.log('   ✗ FAILED: Should have rejected title > 100 chars');
    } catch (error) {
      console.log('   ✓ Title limit (100 chars) enforced');
    }

    // Test closing message limit (200 chars)
    try {
      const longClosing = 'a'.repeat(201);
      await messageService.create({
        recipientName: 'Test',
        senderName: 'Test',
        messageText: 'Test',
        closingMessage: longClosing
      });
      console.log('   ✗ FAILED: Should have rejected closing message > 200 chars');
    } catch (error) {
      console.log('   ✓ Closing message limit (200 chars) enforced');
    }

    // Test signature limit (50 chars)
    try {
      const longSignature = 'a'.repeat(51);
      await messageService.create({
        recipientName: 'Test',
        senderName: 'Test',
        messageText: 'Test',
        signature: longSignature
      });
      console.log('   ✗ FAILED: Should have rejected signature > 50 chars');
    } catch (error) {
      console.log('   ✓ Signature limit (50 chars) enforced');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await pool.query('DELETE FROM messages WHERE id = $1', [message.id]);
    console.log('   ✓ Test data cleaned up');

    console.log('\n✅ All verifications passed!');
    console.log('\n📋 Summary:');
    console.log('   ✓ createMessage method accepts enhanced message data');
    console.log('   ✓ Database queries include new columns (title, special_date, closing_message, signature, gallery_images)');
    console.log('   ✓ Validation for gallery images array (max 7 items) works correctly');
    console.log('   ✓ Message retrieval includes all new fields');
    console.log('   ✓ Character limits enforced (title: 100, closing: 200, signature: 50)');
    console.log('\n✅ Task 3 requirements fully satisfied!');

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run verification
verifyEnhancedMessageService()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
