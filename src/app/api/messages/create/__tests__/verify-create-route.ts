/**
 * Verification script for POST /api/messages/create
 * Tests the API route implementation
 * 
 * Requirements: 1.1, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4
 */

import { POST, OPTIONS } from '../route';
import { NextRequest } from 'next/server';

async function verifyCreateRoute() {
  console.log('🧪 Testing POST /api/messages/create\n');

  // Test 1: Valid message creation
  console.log('Test 1: Valid message creation');
  try {
    const validBody = {
      recipientName: 'João Silva',
      senderName: 'Maria Santos',
      messageText: 'Feliz aniversário! Que seu dia seja especial.',
      imageUrl: 'https://example.com/image.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    };

    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    if (response.status === 201 && data.id) {
      console.log('✅ Valid message creation: PASSED');
      console.log(`   Message ID: ${data.id}`);
    } else {
      console.log('❌ Valid message creation: FAILED');
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('❌ Valid message creation: ERROR');
    console.error('   Error:', error);
  }

  console.log('');

  // Test 2: Missing required fields
  console.log('Test 2: Missing required fields (validation error)');
  try {
    const invalidBody = {
      recipientName: 'João Silva',
      // Missing senderName and messageText
    };

    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidBody),
    });

    const response = await POST(request);
    const data = await response.json();

    if (response.status === 400 && data.error && data.error.code === 'VALIDATION_ERROR') {
      console.log('✅ Missing required fields: PASSED');
      console.log('   Error details:', data.error.details);
    } else {
      console.log('❌ Missing required fields: FAILED');
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('❌ Missing required fields: ERROR');
    console.error('   Error:', error);
  }

  console.log('');

  // Test 3: Invalid JSON
  console.log('Test 3: Invalid JSON format');
  try {
    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json {',
    });

    const response = await POST(request);
    const data = await response.json();

    if (response.status === 400 && data.error && data.error.code === 'INVALID_JSON') {
      console.log('✅ Invalid JSON format: PASSED');
    } else {
      console.log('❌ Invalid JSON format: FAILED');
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('❌ Invalid JSON format: ERROR');
    console.error('   Error:', error);
  }

  console.log('');

  // Test 4: Invalid YouTube URL
  console.log('Test 4: Invalid YouTube URL');
  try {
    const invalidBody = {
      recipientName: 'João Silva',
      senderName: 'Maria Santos',
      messageText: 'Feliz aniversário!',
      youtubeUrl: 'https://example.com/not-youtube',
    };

    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidBody),
    });

    const response = await POST(request);
    const data = await response.json();

    if (response.status === 400 && data.error && data.error.code === 'VALIDATION_ERROR') {
      console.log('✅ Invalid YouTube URL: PASSED');
      console.log('   Error details:', data.error.details);
    } else {
      console.log('❌ Invalid YouTube URL: FAILED');
      console.log('   Response:', data);
    }
  } catch (error) {
    console.log('❌ Invalid YouTube URL: ERROR');
    console.error('   Error:', error);
  }

  console.log('');

  // Test 5: CORS headers
  console.log('Test 5: CORS headers present');
  try {
    const validBody = {
      recipientName: 'João Silva',
      senderName: 'Maria Santos',
      messageText: 'Feliz aniversário!',
    };

    const request = new NextRequest('http://localhost:3000/api/messages/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    
    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    const corsMethods = response.headers.get('Access-Control-Allow-Methods');

    if (corsOrigin && corsMethods) {
      console.log('✅ CORS headers present: PASSED');
      console.log(`   Access-Control-Allow-Origin: ${corsOrigin}`);
      console.log(`   Access-Control-Allow-Methods: ${corsMethods}`);
    } else {
      console.log('❌ CORS headers present: FAILED');
    }
  } catch (error) {
    console.log('❌ CORS headers present: ERROR');
    console.error('   Error:', error);
  }

  console.log('');

  // Test 6: OPTIONS request (preflight)
  console.log('Test 6: OPTIONS request (CORS preflight)');
  try {
    const response = await OPTIONS();
    
    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    const corsMethods = response.headers.get('Access-Control-Allow-Methods');

    if (response.status === 200 && corsOrigin && corsMethods) {
      console.log('✅ OPTIONS request: PASSED');
      console.log(`   Status: ${response.status}`);
    } else {
      console.log('❌ OPTIONS request: FAILED');
    }
  } catch (error) {
    console.log('❌ OPTIONS request: ERROR');
    console.error('   Error:', error);
  }

  console.log('\n✨ Verification complete!');
}

// Run verification
verifyCreateRoute().catch(console.error);
