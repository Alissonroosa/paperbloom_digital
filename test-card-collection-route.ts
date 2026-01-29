/**
 * Test script for card collection creation API route
 * Simulates HTTP requests to test the route handler
 */

import { POST } from './src/app/api/card-collections/create/route';
import { NextRequest } from 'next/server';

async function testAPIRoute() {
  console.log('🧪 Testing Card Collection API Route Handler...\n');

  try {
    // Test 1: Valid request
    console.log('Test 1: Testing valid request...');
    const validBody = {
      recipientName: 'Ana Costa',
      senderName: 'Pedro Lima',
      contactEmail: 'pedro@example.com',
    };

    const validRequest = new NextRequest('http://localhost:3000/api/card-collections/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validBody),
    });

    const validResponse = await POST(validRequest);
    const validData = await validResponse.json();

    if (validResponse.status !== 201) {
      console.error('❌ Expected status 201, got', validResponse.status);
      console.error('Response:', validData);
      return;
    }

    if (!validData.collection || !validData.cards) {
      console.error('❌ Response missing collection or cards');
      console.error('Response:', validData);
      return;
    }

    if (validData.cards.length !== 12) {
      console.error(`❌ Expected 12 cards, got ${validData.cards.length}`);
      return;
    }

    console.log('✅ Valid request handled correctly');
    console.log('  - Status:', validResponse.status);
    console.log('  - Collection ID:', validData.collection.id);
    console.log('  - Cards created:', validData.cards.length);

    // Test 2: Invalid JSON
    console.log('\nTest 2: Testing invalid JSON...');
    const invalidJsonRequest = new NextRequest('http://localhost:3000/api/card-collections/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json{',
    });

    const invalidJsonResponse = await POST(invalidJsonRequest);
    const invalidJsonData = await invalidJsonResponse.json();

    if (invalidJsonResponse.status !== 400) {
      console.error('❌ Expected status 400 for invalid JSON, got', invalidJsonResponse.status);
      return;
    }

    if (invalidJsonData.error?.code !== 'INVALID_JSON') {
      console.error('❌ Expected error code INVALID_JSON');
      console.error('Response:', invalidJsonData);
      return;
    }

    console.log('✅ Invalid JSON handled correctly');
    console.log('  - Status:', invalidJsonResponse.status);
    console.log('  - Error code:', invalidJsonData.error.code);

    // Test 3: Missing required fields
    console.log('\nTest 3: Testing missing required fields...');
    const missingFieldsBody = {
      recipientName: 'Test User',
      // Missing senderName
    };

    const missingFieldsRequest = new NextRequest('http://localhost:3000/api/card-collections/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(missingFieldsBody),
    });

    const missingFieldsResponse = await POST(missingFieldsRequest);
    const missingFieldsData = await missingFieldsResponse.json();

    if (missingFieldsResponse.status !== 400) {
      console.error('❌ Expected status 400 for missing fields, got', missingFieldsResponse.status);
      return;
    }

    if (missingFieldsData.error?.code !== 'VALIDATION_ERROR') {
      console.error('❌ Expected error code VALIDATION_ERROR');
      console.error('Response:', missingFieldsData);
      return;
    }

    console.log('✅ Missing fields handled correctly');
    console.log('  - Status:', missingFieldsResponse.status);
    console.log('  - Error code:', missingFieldsData.error.code);
    console.log('  - Validation errors:', Object.keys(missingFieldsData.error.details || {}));

    // Test 4: Invalid email format
    console.log('\nTest 4: Testing invalid email format...');
    const invalidEmailBody = {
      recipientName: 'Test User',
      senderName: 'Test Sender',
      contactEmail: 'invalid-email',
    };

    const invalidEmailRequest = new NextRequest('http://localhost:3000/api/card-collections/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidEmailBody),
    });

    const invalidEmailResponse = await POST(invalidEmailRequest);
    const invalidEmailData = await invalidEmailResponse.json();

    if (invalidEmailResponse.status !== 400) {
      console.error('❌ Expected status 400 for invalid email, got', invalidEmailResponse.status);
      return;
    }

    if (invalidEmailData.error?.code !== 'VALIDATION_ERROR') {
      console.error('❌ Expected error code VALIDATION_ERROR');
      console.error('Response:', invalidEmailData);
      return;
    }

    console.log('✅ Invalid email handled correctly');
    console.log('  - Status:', invalidEmailResponse.status);
    console.log('  - Error code:', invalidEmailData.error.code);

    // Test 5: Optional email field
    console.log('\nTest 5: Testing optional email field...');
    const noEmailBody = {
      recipientName: 'Test User',
      senderName: 'Test Sender',
      // No email provided
    };

    const noEmailRequest = new NextRequest('http://localhost:3000/api/card-collections/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noEmailBody),
    });

    const noEmailResponse = await POST(noEmailRequest);
    const noEmailData = await noEmailResponse.json();

    if (noEmailResponse.status !== 201) {
      console.error('❌ Expected status 201 for request without email, got', noEmailResponse.status);
      console.error('Response:', noEmailData);
      return;
    }

    console.log('✅ Optional email field handled correctly');
    console.log('  - Status:', noEmailResponse.status);
    console.log('  - Collection created without email');

    // Test 6: Verify CORS headers
    console.log('\nTest 6: Verifying CORS headers...');
    const corsHeaders = validResponse.headers;
    const hasAccessControlOrigin = corsHeaders.get('Access-Control-Allow-Origin') === '*';
    const hasAccessControlMethods = corsHeaders.get('Access-Control-Allow-Methods')?.includes('POST');

    if (!hasAccessControlOrigin || !hasAccessControlMethods) {
      console.error('❌ CORS headers not set correctly');
      return;
    }

    console.log('✅ CORS headers set correctly');

    console.log('\n✅ All API route tests passed!');
    console.log('\n📋 Test Summary:');
    console.log('  ✅ Valid request creates collection with 12 cards');
    console.log('  ✅ Invalid JSON returns 400 error');
    console.log('  ✅ Missing fields returns validation error');
    console.log('  ✅ Invalid email returns validation error');
    console.log('  ✅ Optional email field works correctly');
    console.log('  ✅ CORS headers are set');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testAPIRoute()
  .then(() => {
    console.log('\n✅ All tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  });
