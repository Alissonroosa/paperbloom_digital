/**
 * Integration test for POST /api/messages/upload-image
 * Tests the complete flow from API request to file storage
 * 
 * Requirements: 1.2, 5.5, 8.1, 8.4, 8.5
 */

import { POST } from '../route';
import { NextRequest } from 'next/server';
import { imageService } from '@/services/ImageService';
import { promises as fs } from 'fs';
import path from 'path';

async function runIntegrationTest() {
  console.log('🧪 Running Integration Test for POST /api/messages/upload-image\n');
  console.log('=' .repeat(60));

  let testsPassed = 0;
  let testsFailed = 0;

  // Helper function to create a test image buffer
  function createTestImageBuffer(type: 'valid' | 'invalid' = 'valid'): Buffer {
    if (type === 'valid') {
      // Create a minimal valid PNG (1x1 pixel)
      return Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);
    } else {
      // Invalid image data
      return Buffer.from('not an image');
    }
  }

  // Test 1: Successful image upload
  console.log('\n📝 Test 1: Successful image upload');
  console.log('-'.repeat(60));
  try {
    const imageBuffer = createTestImageBuffer('valid');
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' });
    const file = new File([blob], 'test-image.png', { type: 'image/png' });
    formData.append('image', file);

    const request = new NextRequest('http://localhost:3000/api/messages/upload-image', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 200 && data.url) {
      console.log('✅ API returned 200 with image URL');
      
      // Verify file exists
      const isAccessible = await imageService.isAccessible(data.url);
      if (isAccessible) {
        console.log('✅ Image file is accessible');
        console.log('✅ Test 1: PASSED');
        testsPassed++;
      } else {
        console.log('❌ Image file not accessible');
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

  // Test 2: No file provided
  console.log('\n📝 Test 2: No file provided');
  console.log('-'.repeat(60));
  try {
    const formData = new FormData();
    // Don't add any file

    const request = new NextRequest('http://localhost:3000/api/messages/upload-image', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 400 && data.error.code === 'NO_FILE') {
      console.log('✅ Correct error for missing file');
      console.log('✅ Test 2: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Unexpected response');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 2: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 3: Invalid file type
  console.log('\n📝 Test 3: Invalid file type');
  console.log('-'.repeat(60));
  try {
    const textContent = 'This is not an image';
    const formData = new FormData();
    const blob = new Blob([textContent], { type: 'text/plain' });
    const file = new File([blob], 'test.txt', { type: 'text/plain' });
    formData.append('image', file);

    const request = new NextRequest('http://localhost:3000/api/messages/upload-image', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 400 && data.error.code === 'INVALID_IMAGE_TYPE') {
      console.log('✅ Correct error for invalid file type');
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

  // Test 4: CORS headers verification
  console.log('\n📝 Test 4: CORS headers verification');
  console.log('-'.repeat(60));
  try {
    const imageBuffer = createTestImageBuffer('valid');
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' });
    const file = new File([blob], 'test-cors.png', { type: 'image/png' });
    formData.append('image', file);

    const request = new NextRequest('http://localhost:3000/api/messages/upload-image', {
      method: 'POST',
      body: formData,
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
      console.log('✅ Test 4: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Missing CORS headers');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 4: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 5: Multiple image upload (gallery)
  console.log('\n📝 Test 5: Multiple image upload (gallery)');
  console.log('-'.repeat(60));
  try {
    const imageBuffer = createTestImageBuffer('valid');
    const formData = new FormData();
    
    // Add 3 images with the same field name 'images'
    for (let i = 0; i < 3; i++) {
      const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' });
      const file = new File([blob], `gallery-${i}.png`, { type: 'image/png' });
      formData.append('images', file);
    }

    const request = new NextRequest('http://localhost:3000/api/messages/upload-image', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 200 && data.urls && data.urls.length === 3) {
      console.log('✅ API returned 200 with 3 image URLs');
      
      // Verify all files exist
      const accessibilityChecks = await Promise.all(
        data.urls.map((url: string) => imageService.isAccessible(url))
      );
      
      if (accessibilityChecks.every(check => check)) {
        console.log('✅ All gallery images are accessible');
        console.log('✅ Test 5: PASSED');
        testsPassed++;
      } else {
        console.log('❌ Some gallery images not accessible');
        testsFailed++;
      }
    } else {
      console.log('❌ Unexpected response');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 5: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 6: Too many gallery images
  console.log('\n📝 Test 6: Too many gallery images');
  console.log('-'.repeat(60));
  try {
    const imageBuffer = createTestImageBuffer('valid');
    const formData = new FormData();
    
    // Add 4 images (exceeds limit of 3)
    for (let i = 0; i < 4; i++) {
      const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' });
      const file = new File([blob], `gallery-${i}.png`, { type: 'image/png' });
      formData.append('images', file);
    }

    const request = new NextRequest('http://localhost:3000/api/messages/upload-image', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 400 && data.error.code === 'TOO_MANY_FILES') {
      console.log('✅ Correct error for too many files');
      console.log('✅ Test 6: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Unexpected response');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 6: FAILED');
    console.error('Error:', error);
    testsFailed++;
  }

  // Test 7: Descriptive error messages
  console.log('\n📝 Test 7: Descriptive error messages');
  console.log('-'.repeat(60));
  try {
    // Create a file that's too large (> 10MB)
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const formData = new FormData();
    const blob = new Blob([largeBuffer], { type: 'image/png' });
    const file = new File([blob], 'large.png', { type: 'image/png' });
    formData.append('image', file);

    const request = new NextRequest('http://localhost:3000/api/messages/upload-image', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (response.status === 400 && 
        data.error.code === 'FILE_TOO_LARGE' &&
        data.error.message.includes('exceeds maximum')) {
      console.log('✅ Descriptive error message for file size');
      console.log('✅ Test 7: PASSED');
      testsPassed++;
    } else {
      console.log('❌ Unexpected response');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ Test 7: FAILED');
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
