/**
 * Error Handling Verification Script
 * Requirements: 5.2, 8.4
 * 
 * This script verifies that the error handling system works correctly
 * Run with: ts-node --project tsconfig.node.json src/lib/__tests__/verify-error-handling.ts
 */

import {
  AppError,
  ValidationError,
  InvalidJSONError,
  NotFoundError,
  PaymentRequiredError,
  DatabaseError,
  StripeError,
  FileSystemError,
  ImageProcessingError,
  formatErrorResponse,
  getStatusCode,
  isOperationalError,
  mapDatabaseError,
  mapStripeError,
  mapFileSystemError,
} from '../errors';

// Test counter
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ ${message}`);
    failed++;
  }
}

function assertEquals(actual: any, expected: any, message: string) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ ${message}`);
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual: ${JSON.stringify(actual)}`);
    failed++;
  }
}

console.log('='.repeat(60));
console.log('Error Handling System Verification');
console.log('='.repeat(60));
console.log();

// Test 1: AppError creation
console.log('Test 1: AppError Creation');
const appError = new AppError('Test error', 400, 'TEST_ERROR', true, { field: 'test' });
assert(appError.message === 'Test error', 'AppError message is correct');
assert(appError.statusCode === 400, 'AppError status code is correct');
assert(appError.code === 'TEST_ERROR', 'AppError code is correct');
assert(appError.isOperational === true, 'AppError isOperational is correct');
assert(appError.details?.field === 'test', 'AppError details are correct');
console.log();

// Test 2: ValidationError
console.log('Test 2: ValidationError');
const validationError = new ValidationError('Validation failed', { name: 'Required' });
assert(validationError.statusCode === 400, 'ValidationError has 400 status');
assert(validationError.code === 'VALIDATION_ERROR', 'ValidationError has correct code');
assert(validationError.details?.name === 'Required', 'ValidationError has correct details');
console.log();

// Test 3: NotFoundError
console.log('Test 3: NotFoundError');
const notFoundError = new NotFoundError('Resource not found', 'RESOURCE_NOT_FOUND');
assert(notFoundError.statusCode === 404, 'NotFoundError has 404 status');
assert(notFoundError.code === 'RESOURCE_NOT_FOUND', 'NotFoundError has correct code');
console.log();

// Test 4: PaymentRequiredError
console.log('Test 4: PaymentRequiredError');
const paymentError = new PaymentRequiredError();
assert(paymentError.statusCode === 402, 'PaymentRequiredError has 402 status');
assert(paymentError.code === 'PAYMENT_REQUIRED', 'PaymentRequiredError has correct code');
console.log();

// Test 5: DatabaseError
console.log('Test 5: DatabaseError');
const dbError = new DatabaseError('Database error', new Error('Connection failed'));
assert(dbError.statusCode === 500, 'DatabaseError has 500 status');
assert(dbError.code === 'DATABASE_ERROR', 'DatabaseError has correct code');
assert(dbError.details?.originalError === 'Connection failed', 'DatabaseError has original error');
console.log();

// Test 6: StripeError
console.log('Test 6: StripeError');
const stripeError = new StripeError('Stripe error', new Error('Payment failed'));
assert(stripeError.statusCode === 500, 'StripeError has 500 status');
assert(stripeError.code === 'STRIPE_ERROR', 'StripeError has correct code');
console.log();

// Test 7: FileSystemError
console.log('Test 7: FileSystemError');
const fsError = new FileSystemError('File system error', new Error('File not found'));
assert(fsError.statusCode === 500, 'FileSystemError has 500 status');
assert(fsError.code === 'FILE_SYSTEM_ERROR', 'FileSystemError has correct code');
console.log();

// Test 8: ImageProcessingError
console.log('Test 8: ImageProcessingError');
const imageError = new ImageProcessingError('Invalid image', 400);
assert(imageError.statusCode === 400, 'ImageProcessingError has custom status');
assert(imageError.code === 'IMAGE_PROCESSING_ERROR', 'ImageProcessingError has correct code');
console.log();

// Test 9: formatErrorResponse
console.log('Test 9: formatErrorResponse');
const formattedError = formatErrorResponse(validationError);
assertEquals(
  formattedError,
  {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: { name: 'Required' },
    },
  },
  'formatErrorResponse formats AppError correctly'
);
console.log();

// Test 10: formatErrorResponse with generic Error
console.log('Test 10: formatErrorResponse with generic Error');
const genericError = new Error('Something went wrong');
const formattedGeneric = formatErrorResponse(genericError);
assertEquals(
  formattedGeneric,
  {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  },
  'formatErrorResponse formats generic Error correctly'
);
console.log();

// Test 11: getStatusCode
console.log('Test 11: getStatusCode');
assert(getStatusCode(validationError) === 400, 'getStatusCode returns correct status for AppError');
assert(getStatusCode(genericError) === 500, 'getStatusCode returns 500 for generic Error');
console.log();

// Test 12: isOperationalError
console.log('Test 12: isOperationalError');
assert(isOperationalError(validationError) === true, 'isOperationalError returns true for operational error');
const nonOperationalError = new AppError('Test', 500, 'TEST', false);
assert(isOperationalError(nonOperationalError) === false, 'isOperationalError returns false for non-operational error');
assert(isOperationalError(genericError) === false, 'isOperationalError returns false for generic Error');
console.log();

// Test 13: mapDatabaseError - Duplicate key
console.log('Test 13: mapDatabaseError - Duplicate key (23505)');
const pgDuplicateError = { code: '23505', message: 'Duplicate key' };
const mappedDuplicateError = mapDatabaseError(pgDuplicateError);
assert(mappedDuplicateError.statusCode === 409, 'Duplicate key error maps to 409');
assert(mappedDuplicateError.code === 'DUPLICATE_ENTRY', 'Duplicate key error has correct code');
console.log();

// Test 14: mapDatabaseError - Foreign key violation
console.log('Test 14: mapDatabaseError - Foreign key violation (23503)');
const pgForeignKeyError = { code: '23503', message: 'Foreign key violation' };
const mappedForeignKeyError = mapDatabaseError(pgForeignKeyError);
assert(mappedForeignKeyError.statusCode === 400, 'Foreign key error maps to 400');
assert(mappedForeignKeyError.code === 'FOREIGN_KEY_VIOLATION', 'Foreign key error has correct code');
console.log();

// Test 15: mapDatabaseError - Connection failure
console.log('Test 15: mapDatabaseError - Connection failure (08006)');
const pgConnectionError = { code: '08006', message: 'Connection failed' };
const mappedConnectionError = mapDatabaseError(pgConnectionError);
assert(mappedConnectionError.statusCode === 503, 'Connection error maps to 503');
assert(mappedConnectionError.code === 'CONNECTION_FAILURE', 'Connection error has correct code');
console.log();

// Test 16: mapStripeError - Card error
console.log('Test 16: mapStripeError - Card error');
const stripeCardError = { type: 'card_error', message: 'Card declined', code: 'card_declined' };
const mappedCardError = mapStripeError(stripeCardError);
assert(mappedCardError.statusCode === 402, 'Card error maps to 402');
assert(mappedCardError.code === 'STRIPE_ERROR', 'Card error has correct code');
console.log();

// Test 17: mapStripeError - Invalid request
console.log('Test 17: mapStripeError - Invalid request');
const stripeInvalidError = { type: 'invalid_request_error', message: 'Invalid request' };
const mappedInvalidError = mapStripeError(stripeInvalidError);
assert(mappedInvalidError.statusCode === 400, 'Invalid request error maps to 400');
console.log();

// Test 18: mapStripeError - Rate limit
console.log('Test 18: mapStripeError - Rate limit');
const stripeRateLimitError = { type: 'rate_limit_error', message: 'Too many requests' };
const mappedRateLimitError = mapStripeError(stripeRateLimitError);
assert(mappedRateLimitError.statusCode === 429, 'Rate limit error maps to 429');
console.log();

// Test 19: mapFileSystemError - ENOENT
console.log('Test 19: mapFileSystemError - ENOENT');
const fsEnoentError = { code: 'ENOENT', message: 'File not found' };
const mappedEnoentError = mapFileSystemError(fsEnoentError);
assert(mappedEnoentError.statusCode === 404, 'ENOENT error maps to 404');
assert(mappedEnoentError.code === 'FILE_SYSTEM_ERROR', 'ENOENT error has correct code');
console.log();

// Test 20: mapFileSystemError - EACCES
console.log('Test 20: mapFileSystemError - EACCES');
const fsEaccesError = { code: 'EACCES', message: 'Permission denied' };
const mappedEaccesError = mapFileSystemError(fsEaccesError);
assert(mappedEaccesError.statusCode === 403, 'EACCES error maps to 403');
console.log();

// Test 21: mapFileSystemError - ENOSPC
console.log('Test 21: mapFileSystemError - ENOSPC');
const fsEnospcError = { code: 'ENOSPC', message: 'No space' };
const mappedEnospcError = mapFileSystemError(fsEnospcError);
assert(mappedEnospcError.statusCode === 507, 'ENOSPC error maps to 507');
console.log();

// Summary
console.log('='.repeat(60));
console.log('Test Summary');
console.log('='.repeat(60));
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);
console.log();

if (failed === 0) {
  console.log('✓ All tests passed!');
  process.exit(0);
} else {
  console.error('✗ Some tests failed!');
  process.exit(1);
}
