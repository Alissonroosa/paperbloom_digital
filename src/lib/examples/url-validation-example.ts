/**
 * URL Accessibility Validation Examples
 * Requirement: 6.5
 * 
 * This file demonstrates how to use the URL validation utilities
 * to check if stored URLs (images, QR codes) are accessible.
 */

import {
  validateURLAccessibility,
  validateMultipleURLs,
  validateStoredURLs,
} from '../utils';

/**
 * Example 1: Validate a single URL
 */
async function validateSingleURL() {
  const imageUrl = 'https://example.com/uploads/images/photo.jpg';
  
  const result = await validateURLAccessibility(imageUrl);
  
  if (result.accessible) {
    console.log(`✓ URL is accessible (HTTP ${result.statusCode})`);
  } else {
    console.error(`✗ URL is not accessible: ${result.error}`);
    console.error(`  Attempted ${result.attempts} times`);
  }
}

/**
 * Example 2: Validate with custom retry options
 */
async function validateWithCustomOptions() {
  const qrCodeUrl = 'https://example.com/uploads/qrcodes/qr123.png';
  
  const result = await validateURLAccessibility(qrCodeUrl, {
    maxRetries: 5,      // Try up to 5 times
    retryDelay: 2000,   // Wait 2 seconds between retries
    timeout: 10000,     // 10 second timeout per request
  });
  
  return result;
}

/**
 * Example 3: Validate multiple URLs concurrently
 */
async function validateMultipleURLsExample() {
  const urls = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/qrcode1.png',
  ];
  
  const results = await validateMultipleURLs(urls);
  
  results.forEach((result) => {
    console.log(`${result.url}: ${result.accessible ? '✓' : '✗'}`);
  });
  
  const allAccessible = results.every(r => r.accessible);
  console.log(`All URLs accessible: ${allAccessible}`);
}

/**
 * Example 4: Validate stored message URLs
 * This is the most common use case - validating URLs after storage
 */
async function validateMessageURLs(
  imageUrl: string | null,
  qrCodeUrl: string | null
) {
  const result = await validateStoredURLs(imageUrl, qrCodeUrl);
  
  if (result.allAccessible) {
    console.log('✓ All stored URLs are accessible');
  } else {
    console.error('✗ Some URLs are not accessible:');
    
    if (result.imageUrl && !result.imageUrl.accessible) {
      console.error(`  Image URL: ${result.imageUrl.error}`);
    }
    
    if (result.qrCodeUrl && !result.qrCodeUrl.accessible) {
      console.error(`  QR Code URL: ${result.qrCodeUrl.error}`);
    }
  }
  
  return result;
}

/**
 * Example 5: Use in MessageService after creating a message
 */
async function validateAfterMessageCreation(message: {
  imageUrl: string | null;
  qrCodeUrl: string | null;
}) {
  // Validate URLs after message is created and files are stored
  const validation = await validateStoredURLs(
    message.imageUrl,
    message.qrCodeUrl,
    {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 5000,
    }
  );
  
  if (!validation.allAccessible) {
    // Log warning but don't fail the operation
    console.warn('Warning: Some URLs may not be immediately accessible', {
      imageUrl: validation.imageUrl,
      qrCodeUrl: validation.qrCodeUrl,
    });
  }
  
  return validation;
}

/**
 * Example 6: Use in webhook handler after QR code generation
 */
async function validateAfterQRCodeGeneration(
  qrCodeUrl: string
): Promise<boolean> {
  const result = await validateURLAccessibility(qrCodeUrl, {
    maxRetries: 3,
    retryDelay: 500,
  });
  
  if (!result.accessible) {
    console.error('QR code URL is not accessible:', {
      url: qrCodeUrl,
      error: result.error,
      attempts: result.attempts,
    });
  }
  
  return result.accessible;
}

// Export examples for testing or documentation
export {
  validateSingleURL,
  validateWithCustomOptions,
  validateMultipleURLsExample,
  validateMessageURLs,
  validateAfterMessageCreation,
  validateAfterQRCodeGeneration,
};
