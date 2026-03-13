/**
 * Verify that messages are properly persisted in the database
 * Requirements: 1.4, 1.5
 */

import { messageService } from '@/services/MessageService';

async function verifyDatabase() {
  console.log('🧪 Verifying database persistence\n');

  try {
    // Create a test message
    console.log('Creating test message...');
    const testMessage = await messageService.create({
      recipientName: 'Test Recipient',
      senderName: 'Test Sender',
      messageText: 'This is a test message for database verification',
      imageUrl: 'https://example.com/test.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=test123',
    });

    console.log(`✅ Message created with ID: ${testMessage.id}`);
    console.log(`   Status: ${testMessage.status}`);
    console.log(`   View Count: ${testMessage.viewCount}`);
    console.log(`   Created At: ${testMessage.createdAt}`);

    // Retrieve the message by ID
    console.log('\nRetrieving message by ID...');
    const retrievedMessage = await messageService.findById(testMessage.id);

    if (retrievedMessage) {
      console.log('✅ Message retrieved successfully');
      
      // Verify all fields match
      const fieldsMatch = 
        retrievedMessage.recipientName === testMessage.recipientName &&
        retrievedMessage.senderName === testMessage.senderName &&
        retrievedMessage.messageText === testMessage.messageText &&
        retrievedMessage.imageUrl === testMessage.imageUrl &&
        retrievedMessage.youtubeUrl === testMessage.youtubeUrl &&
        retrievedMessage.status === testMessage.status &&
        retrievedMessage.viewCount === testMessage.viewCount;

      if (fieldsMatch) {
        console.log('✅ All fields match (round-trip successful)');
      } else {
        console.log('❌ Fields do not match');
        console.log('   Original:', testMessage);
        console.log('   Retrieved:', retrievedMessage);
      }
    } else {
      console.log('❌ Message not found in database');
    }

    console.log('\n✨ Database verification complete!');
  } catch (error) {
    console.error('❌ Error during database verification:', error);
    process.exit(1);
  }
}

verifyDatabase().catch(console.error);
