/**
 * Integration test for GET /api/messages/[slug]
 * Tests the complete flow from API request to message retrieval
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { GET } from '../route';
import { NextRequest } from 'next/server';
import { messageService } from '@/services/MessageService';

async function runIntegrationTest() {
  console.log('🧪 Running Integration Test for GET /api/messages/[slug]\n');
  console.log('=' .repeat(60));

  let testsPassed = 0;
  let testsFailed = 0;

  // Setup: Create test messages
  let testMessageId: string;
  let testSlug: string;
  let paidMessageId: string;
  let paidSlug: string;

  console.log('\n🔧 Setting up test data...');
  console.log('-'.repeat(60));
  
  try {
    // Create a test message with pending status
    const pendingMessage = await messageService.create({
      recipientName: 'Test Recipient',
      senderName: 'Test Sender',
      messageText: 'This is a test message for slug route',
      imageUrl: null,
      youtubeUrl: null,
    });
    testMessageId = pendingMessage.id;

    // Update with slug but keep status as pending
    testSlug = 'test-recipient-' + testMessageId.substring(0, 8);
    await messageService.updateQRCode(
      testMessageId,
      'https://example.com/qr.png',
      testSlug
    );

    // Create a paid message
    const paidMessage = await messageService.create({
      recipientName: 'Paid Recipient',
      senderName: 'Paid Sender',
      messageText: 'This is a paid test message',
      imageUrl: 'https://example.com/image.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    paidMessageId = paidMessage.id;
    paidSlug = 'paid-recipient-' + paidMessageId.substring(0, 8);

    // Update to paid status with slug and QR code
    await messageService.updateStatus(paidMessageId, 'paid');
    await messageService.updateQRCode(
      paidMessageId,
      'https://example.com/qr-paid.png',
      paidSlug
    );

    console.log('✅ Test data created successfully');
  } catch (error) {
    console.log('❌ Failed to create test data');
    console.error('Error:', error);
    process.exit(1);
  }

  // Test 1: Non-existent slug returns 404
  console.log('\n📝 Test 1: Non-existent slug returns 404 (Requirement 4.3)');
  console.log('-'.repeat(60));
  try {
    const request = new NextRequest('http://localhost:3000/api/messages/non-existent-slug');
    const response = await GET(request, { params: { slug: 'non-existent-slug' } });
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 404 && data.error.code === 'MESSAGE_NOT_FOUND') {
      console.log('✅ Test 1: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Test 1: FAILED - Expected 404 with MESSAGE_NOT_FOUND');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 1: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 2: Unpaid message returns 402
  console.log('\n📝 Test 2: Unpaid message returns 402 (Requirement 4.4)');
  console.log('-'.repeat(60));
  try {
    const request = new NextRequest(`http://localhost:3000/api/messages/${testSlug}`);
    const response = await GET(request, { params: { slug: testSlug } });
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 402 && data.error.code === 'PAYMENT_REQUIRED') {
      console.log('✅ Test 2: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Test 2: FAILED - Expected 402 with PAYMENT_REQUIRED');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 2: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 3: Paid message returns complete data
  console.log('\n📝 Test 3: Paid message returns complete data (Requirement 4.2)');
  console.log('-'.repeat(60));
  try {
    const request = new NextRequest(`http://localhost:3000/api/messages/${paidSlug}`);
    const response = await GET(request, { params: { slug: paidSlug } });
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    const allFieldsCorrect = 
      response.status === 200 &&
      data.id === paidMessageId &&
      data.recipientName === 'Paid Recipient' &&
      data.senderName === 'Paid Sender' &&
      data.messageText === 'This is a paid test message' &&
      data.imageUrl === 'https://example.com/image.jpg' &&
      data.youtubeUrl === 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' &&
      data.qrCodeUrl === 'https://example.com/qr-paid.png' &&
      data.createdAt;

    if (allFieldsCorrect) {
      console.log('✅ All fields returned correctly');
      console.log('✅ Test 3: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Test 3: FAILED - Fields do not match expected values');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 3: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 4: View count increments on access
  console.log('\n📝 Test 4: View count increments on access (Requirement 4.5)');
  console.log('-'.repeat(60));
  try {
    // Get initial view count
    const messageBefore = await messageService.findBySlug(paidSlug);
    const initialViewCount = messageBefore?.viewCount || 0;
    console.log(`Initial view count: ${initialViewCount}`);

    // Access the message
    const request = new NextRequest(`http://localhost:3000/api/messages/${paidSlug}`);
    const response = await GET(request, { params: { slug: paidSlug } });
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Returned view count: ${data.viewCount}`);

    // Verify in database
    const messageAfter = await messageService.findBySlug(paidSlug);
    console.log(`Database view count: ${messageAfter?.viewCount}`);

    if (response.status === 200 &&
        data.viewCount === initialViewCount + 1 &&
        messageAfter?.viewCount === initialViewCount + 1) {
      console.log('✅ View count incremented correctly');
      console.log('✅ Test 4: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Test 4: FAILED - View count not incremented correctly');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 4: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 5: Empty slug returns 400
  console.log('\n📝 Test 5: Empty slug returns 400');
  console.log('-'.repeat(60));
  try {
    const request = new NextRequest('http://localhost:3000/api/messages/');
    const response = await GET(request, { params: { slug: '' } });
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 400 && data.error.code === 'INVALID_SLUG') {
      console.log('✅ Test 5: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Test 5: FAILED - Expected 400 with INVALID_SLUG');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 5: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 6: CORS headers verification
  console.log('\n📝 Test 6: CORS headers verification');
  console.log('-'.repeat(60));
  try {
    const request = new NextRequest(`http://localhost:3000/api/messages/${paidSlug}`);
    const response = await GET(request, { params: { slug: paidSlug } });
    
    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    const corsMethods = response.headers.get('Access-Control-Allow-Methods');
    const corsHeaders = response.headers.get('Access-Control-Allow-Headers');
    const contentType = response.headers.get('Content-Type');

    console.log(`CORS Origin: ${corsOrigin}`);
    console.log(`CORS Methods: ${corsMethods}`);
    console.log(`CORS Headers: ${corsHeaders}`);
    console.log(`Content-Type: ${contentType}`);

    if (corsOrigin && corsMethods && corsHeaders && contentType) {
      console.log('✅ All CORS headers present');
      console.log('✅ Test 6: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Missing CORS headers');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 6: FAILED');
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
