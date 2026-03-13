/**
 * Integration test for POST /api/messages/create
 * Tests the complete flow from API request to database persistence
 * 
 * Requirements: 1.1, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4
 */

import { POST } from '../route';
import { NextRequest } from 'next/server';
import { messageService } from '@/services/MessageService';

async function runIntegrationTest() {
  console.log('🧪 Running Integration Test for POST /api/messages/create\n');
  console.log('=' .repeat(60));

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Complete flow with all fields
  console.log('\n📝 Test 1: Complete message creation flow');
  console.log('-'.repeat(60));
  try {
    const requestBody = {
      recipientName: 'Ana Costa',
      senderName: 'Pedro Lima',
      messageText: 'Parabéns pelo seu dia especial! Você merece toda a felicidade do mundo.',
      imageUrl: 'https://example.com/celebration.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=abc123',
    };

    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    // Verify response
    if (response.status === 201 && data.id) {
      console.log('✅ API returned 201 with message ID');
      
      // Verify in database
      const dbMessage = await messageService.findById(data.id);
      if (dbMessage) {
        console.log('✅ Message found in database');
        
        // Verify all fields
        const allFieldsCorrect = 
          dbMessage.recipientName === requestBody.recipientName &&
          dbMessage.senderName === requestBody.senderName &&
          dbMessage.messageText === requestBody.messageText &&
          dbMessage.imageUrl === requestBody.imageUrl &&
          dbMessage.youtubeUrl === requestBody.youtubeUrl &&
          dbMessage.status === 'pending' &&
          dbMessage.viewCount === 0;

        if (allFieldsCorrect) {
          console.log('✅ All fields persisted correctly');
          console.log('✅ Test 1: PASSED');
          testsPassed++;
        } else {
          console.log('❌ Fields do not match');
          testsFailed++;
        }
      } else {
        console.log('❌ Message not found in database');
        testsFailed++;
      }
    } else {
      console.log('❌ Unexpected response');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 1: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 2: Minimal message (only required fields)
  console.log('\n📝 Test 2: Minimal message (required fields only)');
  console.log('-'.repeat(60));
  try {
    const requestBody = {
      recipientName: 'Carlos',
      senderName: 'Juliana',
      messageText: 'Feliz aniversário!',
    };

    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 201 && data.id) {
      const dbMessage = await messageService.findById(data.id);
      if (dbMessage && 
          dbMessage.imageUrl === null && 
          dbMessage.youtubeUrl === null) {
        console.log('✅ Minimal message created with null optional fields');
        console.log('✅ Test 2: PASSED');
        testsPassed++;
      } else {
        console.log('❌ Optional fields not handled correctly');
        testsFailed++;
      }
    } else {
      console.log('❌ Unexpected response');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 2: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 3: Validation error handling
  console.log('\n📝 Test 3: Validation error handling');
  console.log('-'.repeat(60));
  try {
    const requestBody = {
      recipientName: '', // Empty string should fail
      senderName: 'Test',
      messageText: 'Test',
    };

    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 400 && 
        data.error.code === 'VALIDATION_ERROR' &&
        data.error.details) {
      console.log('✅ Validation error returned with details');
      console.log('✅ Test 3: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Unexpected response');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 3: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 4: Enhanced message with all new fields
  console.log('\n📝 Test 4: Enhanced message with all new fields');
  console.log('-'.repeat(60));
  try {
    const requestBody = {
      recipientName: 'Maria Silva',
      senderName: 'João Santos',
      messageText: 'Feliz aniversário! Que seu dia seja repleto de alegrias.',
      imageUrl: 'https://example.com/main-photo.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=test123',
      title: 'Feliz Aniversário, Maria!',
      specialDate: '2024-12-25',
      closingMessage: 'Que este novo ano seja repleto de realizações',
      signature: 'Com carinho, João',
      galleryImages: [
        'https://example.com/gallery-1.jpg',
        'https://example.com/gallery-2.jpg',
        'https://example.com/gallery-3.jpg',
      ],
    };

    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 201 && data.id) {
      const dbMessage = await messageService.findById(data.id);
      if (dbMessage) {
        console.log('✅ Enhanced message found in database');
        
        // Verify enhanced fields
        const expectedDate = new Date(requestBody.specialDate);
        const receivedDate = dbMessage.specialDate;
        
        // Compare dates by checking if they represent the same calendar day
        // Account for timezone differences by comparing the date strings
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        const receivedDateStr = receivedDate ? receivedDate.toISOString().split('T')[0] : '';
        const datesMatch = expectedDateStr === receivedDateStr || 
          // Also accept if the dates are within 1 day (timezone offset)
          (receivedDate && Math.abs(expectedDate.getTime() - receivedDate.getTime()) < 86400000);
        
        const enhancedFieldsCorrect = 
          dbMessage.title === requestBody.title &&
          datesMatch &&
          dbMessage.closingMessage === requestBody.closingMessage &&
          dbMessage.signature === requestBody.signature &&
          dbMessage.galleryImages.length === 3 && // Test uses 3 images
          dbMessage.galleryImages[0] === requestBody.galleryImages[0] &&
          dbMessage.galleryImages[1] === requestBody.galleryImages[1] &&
          dbMessage.galleryImages[2] === requestBody.galleryImages[2];

        if (enhancedFieldsCorrect) {
          console.log('✅ All enhanced fields persisted correctly');
          console.log('✅ Test 4: PASSED');
          testsPassed++;
        } else {
          console.log('❌ Enhanced fields do not match');
          console.log('Expected:', {
            title: requestBody.title,
            specialDate: requestBody.specialDate,
            closingMessage: requestBody.closingMessage,
            signature: requestBody.signature,
            galleryImages: requestBody.galleryImages,
          });
          console.log('Received:', {
            title: dbMessage.title,
            specialDate: dbMessage.specialDate?.toISOString(),
            closingMessage: dbMessage.closingMessage,
            signature: dbMessage.signature,
            galleryImages: dbMessage.galleryImages,
          });
          testsFailed++;
        }
      } else {
        console.log('❌ Message not found in database');
        testsFailed++;
      }
    } else {
      console.log('❌ Unexpected response');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 4: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 5: CORS headers verification
  console.log('\n📝 Test 5: CORS headers verification');
  console.log('-'.repeat(60));
  try {
    const requestBody = {
      recipientName: 'Test',
      senderName: 'Test',
      messageText: 'Test',
    };

    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    
    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    const corsMethods = response.headers.get('Access-Control-Allow-Methods');
    const corsHeaders = response.headers.get('Access-Control-Allow-Headers');

    console.log(`CORS Origin: ${corsOrigin}`);
    console.log(`CORS Methods: ${corsMethods}`);
    console.log(`CORS Headers: ${corsHeaders}`);

    if (corsOrigin && corsMethods && corsHeaders) {
      console.log('✅ All CORS headers present');
      console.log('✅ Test 5: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Missing CORS headers');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 5: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total: ${testsPassed + testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All integration tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

runIntegrationTest().catch(console.error);
