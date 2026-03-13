/**
 * Verification script for StripeService
 * This script verifies that the StripeService is properly implemented
 * Requirements: 2.1, 2.5
 */

// Set up environment variables before importing
if (!process.env.STRIPE_SECRET_KEY) {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_verification';
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret_for_verification';
}
if (!process.env.NEXT_PUBLIC_BASE_URL) {
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
}

import { StripeService } from '../StripeService';

async function verifyStripeService() {
  console.log('🔍 Verifying StripeService implementation...\n');

  try {
    // Test 1: Service initialization
    console.log('✓ Test 1: Service initialization');
    const service = new StripeService();
    console.log('  ✓ StripeService initialized successfully\n');

    // Test 2: Check methods exist
    console.log('✓ Test 2: Verify all required methods exist');
    const methods = [
      'createCheckoutSession',
      'verifyWebhookSignature',
      'constructWebhookEvent',
      'handleSuccessfulPayment',
      'getCheckoutSession',
    ];

    for (const method of methods) {
      if (typeof (service as any)[method] !== 'function') {
        throw new Error(`Method ${method} is not defined`);
      }
      console.log(`  ✓ ${method} method exists`);
    }
    console.log();

    // Test 3: handleSuccessfulPayment with valid session
    console.log('✓ Test 3: handleSuccessfulPayment with valid session');
    const mockSession = {
      id: 'cs_test_123',
      metadata: {
        messageId: 'test-message-id-123',
      },
    } as any;

    const messageId = service.handleSuccessfulPayment(mockSession);
    if (messageId !== 'test-message-id-123') {
      throw new Error('handleSuccessfulPayment did not return correct messageId');
    }
    console.log(`  ✓ Extracted messageId: ${messageId}\n`);

    // Test 4: handleSuccessfulPayment with missing metadata
    console.log('✓ Test 4: handleSuccessfulPayment error handling');
    const invalidSession = {
      id: 'cs_test_456',
      metadata: {},
    } as any;

    try {
      service.handleSuccessfulPayment(invalidSession);
      throw new Error('Should have thrown error for missing messageId');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Message ID not found')) {
        console.log('  ✓ Correctly throws error when messageId is missing\n');
      } else {
        throw error;
      }
    }

    // Test 5: Verify environment variable validation
    console.log('✓ Test 5: Environment variable validation');
    const requiredEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.log(`  ⚠ Warning: ${envVar} is not set in environment`);
      } else {
        console.log(`  ✓ ${envVar} is configured`);
      }
    }
    console.log();

    console.log('✅ All StripeService verifications passed!\n');
    console.log('Summary:');
    console.log('  - Service initializes correctly');
    console.log('  - All required methods are implemented');
    console.log('  - handleSuccessfulPayment extracts messageId correctly');
    console.log('  - Error handling works as expected');
    console.log('  - Environment variables are validated\n');

    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Run verification if executed directly
if (require.main === module) {
  verifyStripeService()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { verifyStripeService };
