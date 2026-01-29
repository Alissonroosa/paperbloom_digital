# URL Accessibility Validation

**Requirement: 6.5**

This module provides utilities for validating that stored URLs (images, QR codes) are accessible via HTTP requests with retry logic for transient failures.

## Overview

The URL validation utilities help ensure that files uploaded to the system are actually accessible via their public URLs. This is important for:

- Verifying image uploads are accessible after storage
- Confirming QR codes are accessible after generation
- Detecting broken or inaccessible URLs early
- Implementing retry logic for transient network failures

## Functions

### `validateURLAccessibility(url, options?)`

Validates a single URL by making a HEAD request with retry logic.

**Parameters:**
- `url` (string): The URL to validate
- `options` (optional):
  - `maxRetries` (number, default: 3): Maximum number of retry attempts
  - `retryDelay` (number, default: 1000): Delay in milliseconds between retries
  - `timeout` (number, default: 5000): Request timeout in milliseconds

**Returns:** `URLValidationResult`
```typescript
{
  url: string;
  accessible: boolean;
  statusCode?: number;
  error?: string;
  attempts: number;
}
```

**Example:**
```typescript
import { validateURLAccessibility } from '@/lib/utils';

const result = await validateURLAccessibility('https://example.com/image.jpg');

if (result.accessible) {
  console.log(`✓ URL is accessible (HTTP ${result.statusCode})`);
} else {
  console.error(`✗ URL failed after ${result.attempts} attempts: ${result.error}`);
}
```

### `validateMultipleURLs(urls, options?)`

Validates multiple URLs concurrently.

**Parameters:**
- `urls` (string[]): Array of URLs to validate
- `options` (optional): Same as `validateURLAccessibility`

**Returns:** `Promise<URLValidationResult[]>`

**Example:**
```typescript
import { validateMultipleURLs } from '@/lib/utils';

const urls = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/qrcode.png',
];

const results = await validateMultipleURLs(urls);
const allAccessible = results.every(r => r.accessible);
```

### `validateStoredURLs(imageUrl, qrCodeUrl, options?)`

Validates both image and QR code URLs for a message. This is the most common use case.

**Parameters:**
- `imageUrl` (string | null): Image URL to validate (optional)
- `qrCodeUrl` (string | null): QR code URL to validate (optional)
- `options` (optional): Same as `validateURLAccessibility`

**Returns:**
```typescript
{
  imageUrl?: URLValidationResult;
  qrCodeUrl?: URLValidationResult;
  allAccessible: boolean;
}
```

**Example:**
```typescript
import { validateStoredURLs } from '@/lib/utils';

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
  console.warn('Some URLs are not accessible:', {
    imageUrl: validation.imageUrl,
    qrCodeUrl: validation.qrCodeUrl,
  });
}
```

## Implementation Details

### Retry Logic

The validation functions implement exponential backoff retry logic:
1. Make initial request
2. If request fails, wait `retryDelay` milliseconds
3. Retry up to `maxRetries` times
4. Return failure if all attempts fail

### Timeout Handling

Each request has a configurable timeout using `AbortController`:
- If a request takes longer than `timeout` milliseconds, it's aborted
- The error is logged as "Request timeout"
- The retry logic continues with the next attempt

### Error Logging

When a URL is inaccessible after all retry attempts, the function logs:
```javascript
console.error('[URL Validation] URL is inaccessible after N attempts:', {
  url: 'https://example.com/image.jpg',
  error: 'Network error',
  timestamp: '2025-11-24T04:33:23.274Z'
});
```

## Usage in the Application

### 1. After Image Upload

In `src/app/api/messages/upload-image/route.ts`:

```typescript
const imageUrl = await imageService.upload(fileData);

// Validate URL accessibility
const urlValidation = await validateURLAccessibility(imageUrl, {
  maxRetries: 3,
  retryDelay: 500,
  timeout: 5000,
});

if (!urlValidation.accessible) {
  console.warn('Warning: Uploaded image URL may not be immediately accessible', {
    url: imageUrl,
    error: urlValidation.error,
  });
}
```

### 2. After QR Code Generation

In `src/app/api/checkout/webhook/route.ts`:

```typescript
const qrCodeUrl = await qrCodeService.generate(fullUrl, messageId);
await messageService.updateQRCode(messageId, qrCodeUrl, slug);

// Validate URL accessibility
const urlValidation = await validateStoredURLs(
  message.imageUrl,
  qrCodeUrl,
  {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 5000,
  }
);

if (!urlValidation.allAccessible) {
  console.warn('Warning: Some URLs may not be immediately accessible', {
    messageId,
    imageUrl: urlValidation.imageUrl,
    qrCodeUrl: urlValidation.qrCodeUrl,
  });
}
```

## Testing

The URL validation utilities are fully tested in `src/lib/__tests__/url-validation.test.ts`:

- ✓ Successful HEAD requests
- ✓ Retry logic on transient failures
- ✓ Timeout handling
- ✓ HTTP error responses (404, 500, etc.)
- ✓ Multiple URL validation
- ✓ Stored URL validation (image + QR code)
- ✓ Error logging

Run tests:
```bash
npm test -- src/lib/__tests__/url-validation.test.ts --run
```

## Best Practices

1. **Non-blocking validation**: URL validation should not block the main operation. Log warnings but don't fail the request.

2. **Appropriate timeouts**: Use shorter timeouts (1-5 seconds) for quick validation checks.

3. **Retry configuration**: Adjust retry settings based on the context:
   - Critical operations: More retries (5+)
   - Background checks: Fewer retries (2-3)

4. **Error handling**: Always handle validation failures gracefully:
   ```typescript
   if (!validation.allAccessible) {
     // Log warning but continue
     console.warn('URL validation failed', validation);
   }
   ```

5. **Testing**: Mock `fetch` in tests to avoid making real HTTP requests.

## Future Enhancements

Potential improvements for the URL validation system:

1. **Exponential backoff**: Increase delay between retries exponentially
2. **Circuit breaker**: Stop validating if too many failures occur
3. **Batch validation**: Validate URLs in batches to avoid overwhelming the server
4. **Caching**: Cache validation results to avoid redundant checks
5. **Metrics**: Track validation success/failure rates for monitoring
