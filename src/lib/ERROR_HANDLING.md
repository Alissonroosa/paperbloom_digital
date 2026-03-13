# Error Handling Middleware Documentation

## Overview

This document describes the centralized error handling system for the Paper Bloom backend. The error handling middleware provides consistent error responses, proper HTTP status codes, and comprehensive logging across all API routes.

**Requirements**: 5.2, 8.4

## Architecture

The error handling system consists of three main components:

1. **Custom Error Classes** (`src/lib/errors.ts`) - Typed error classes for different error scenarios
2. **Error Handler Utilities** (`src/lib/errorHandler.ts`) - Middleware and helper functions for API routes
3. **Error Mapping** - Automatic mapping of database, Stripe, and file system errors to appropriate HTTP responses

## Custom Error Classes

### Base Error: `AppError`

All custom errors extend from `AppError`, which includes:
- `statusCode`: HTTP status code
- `code`: Machine-readable error code
- `isOperational`: Whether the error is expected (operational) or a programming error
- `details`: Optional additional error details

### Error Types

#### 1. ValidationError (400)
Used when request validation fails.

```typescript
throw new ValidationError('Validation failed', {
  recipientName: 'Required field is missing',
  email: 'Invalid email format'
});
```

#### 2. InvalidJSONError (400)
Used when JSON parsing fails.

```typescript
throw new InvalidJSONError();
```

#### 3. NotFoundError (404)
Used when a resource is not found.

```typescript
throw new NotFoundError('Message not found', 'MESSAGE_NOT_FOUND');
```

#### 4. PaymentRequiredError (402)
Used when a message is not paid.

```typescript
throw new PaymentRequiredError('Payment is required to access this message');
```

#### 5. DatabaseError (500)
Used when database operations fail.

```typescript
throw new DatabaseError('Failed to create message', originalError);
```

#### 6. StripeError (500)
Used when Stripe operations fail.

```typescript
throw new StripeError('Failed to create checkout session', originalError);
```

#### 7. FileSystemError (500)
Used when file operations fail.

```typescript
throw new FileSystemError('Failed to save file', originalError);
```

#### 8. ImageProcessingError (400/500)
Used when image upload or processing fails.

```typescript
throw new ImageProcessingError('Invalid image type', 400);
```

## Error Handler Utilities

### `handleError(error, context)`

Main error handling function that:
1. Logs the error with context
2. Maps errors to appropriate AppError types
3. Formats error response
4. Returns NextResponse with proper status code and CORS headers

```typescript
import { handleError } from '@/lib/errorHandler';

try {
  // Your code here
} catch (error) {
  return handleError(error, { route: '/api/messages/create' });
}
```

### `withErrorHandler(handler)`

Wrapper function for API route handlers that automatically catches and handles errors.

```typescript
import { withErrorHandler } from '@/lib/errorHandler';

export const POST = withErrorHandler(async (request) => {
  // Your route logic here
  // Any thrown errors will be automatically caught and handled
  return NextResponse.json({ success: true });
});
```

### `parseJSON(request)`

Safe JSON parsing with automatic error handling.

```typescript
import { parseJSON } from '@/lib/errorHandler';

const body = await parseJSON(request); // Throws InvalidJSONError if parsing fails
```

### `createSuccessResponse(data, status)`

Create a success response with CORS headers.

```typescript
import { createSuccessResponse } from '@/lib/errorHandler';

return createSuccessResponse({ id: '123', message: 'Success' }, 201);
```

### `createOptionsHandler()`

Create an OPTIONS handler for CORS preflight requests.

```typescript
import { createOptionsHandler } from '@/lib/errorHandler';

export const OPTIONS = createOptionsHandler;
```

## Error Mapping

The system automatically maps common error types to appropriate AppError instances:

### Database Errors

PostgreSQL error codes are automatically mapped:

| PG Code | HTTP Status | Error Code | Description |
|---------|-------------|------------|-------------|
| 23505 | 409 | DUPLICATE_ENTRY | Unique constraint violation |
| 23503 | 400 | FOREIGN_KEY_VIOLATION | Foreign key constraint violation |
| 23502 | 400 | NOT_NULL_VIOLATION | Not null constraint violation |
| 23514 | 400 | CHECK_VIOLATION | Check constraint violation |
| 42P01 | 500 | UNDEFINED_TABLE | Table does not exist |
| 42703 | 500 | UNDEFINED_COLUMN | Column does not exist |
| 08006 | 503 | CONNECTION_FAILURE | Connection failed |
| 08003 | 503 | CONNECTION_DOES_NOT_EXIST | Connection does not exist |

### Stripe Errors

Stripe error types are automatically mapped:

| Stripe Type | HTTP Status | Description |
|-------------|-------------|-------------|
| card_error | 402 | Card was declined |
| invalid_request_error | 400 | Invalid payment request |
| api_error | 500 | Payment processing error |
| authentication_error | 401 | Authentication failed |
| rate_limit_error | 429 | Too many requests |

### File System Errors

Node.js file system error codes are automatically mapped:

| FS Code | HTTP Status | Description |
|---------|-------------|-------------|
| ENOENT | 404 | File or directory not found |
| EACCES | 403 | Permission denied |
| EEXIST | 409 | File already exists |
| ENOSPC | 507 | No space left on device |
| EMFILE | 500 | Too many open files |

## Error Response Format

All errors return a consistent JSON format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for one or more fields",
    "details": {
      "recipientName": "Required field is missing",
      "email": "Invalid email format"
    }
  }
}
```

## Usage Examples

### Example 1: Basic Error Handling

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleError, parseJSON, createSuccessResponse } from '@/lib/errorHandler';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await parseJSON(request);
    
    if (!body.name) {
      throw new ValidationError('Name is required', { name: 'Required field' });
    }
    
    // Your logic here
    
    return createSuccessResponse({ id: '123' }, 201);
  } catch (error) {
    return handleError(error, { route: '/api/example' });
  }
}
```

### Example 2: Using withErrorHandler Wrapper

```typescript
import { NextRequest } from 'next/server';
import { withErrorHandler, parseJSON, createSuccessResponse } from '@/lib/errorHandler';
import { ValidationError } from '@/lib/errors';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await parseJSON(request);
  
  if (!body.name) {
    throw new ValidationError('Name is required', { name: 'Required field' });
  }
  
  // Your logic here
  
  return createSuccessResponse({ id: '123' }, 201);
});
```

### Example 3: Database Error Handling

```typescript
import { withErrorHandler, createSuccessResponse } from '@/lib/errorHandler';
import { DatabaseError } from '@/lib/errors';
import pool from '@/lib/db';

export const POST = withErrorHandler(async (request) => {
  try {
    const result = await pool.query('INSERT INTO messages ...');
    return createSuccessResponse(result.rows[0]);
  } catch (error) {
    // Database errors are automatically mapped to appropriate HTTP status codes
    throw error; // Will be caught by withErrorHandler and mapped
  }
});
```

### Example 4: Stripe Error Handling

```typescript
import { withErrorHandler, createSuccessResponse } from '@/lib/errorHandler';
import { stripeService } from '@/services/StripeService';

export const POST = withErrorHandler(async (request) => {
  try {
    const session = await stripeService.createCheckoutSession('msg-123', 2999);
    return createSuccessResponse(session);
  } catch (error) {
    // Stripe errors are automatically mapped to appropriate HTTP status codes
    throw error; // Will be caught by withErrorHandler and mapped
  }
});
```

## Logging

All errors are logged with the following information:
- Timestamp
- Error message
- Stack trace
- Error code (for AppError)
- HTTP status code (for AppError)
- Additional context (route, params, etc.)
- Original error details (for wrapped errors)

Example log output:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Validation failed for one or more fields",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "isOperational": true,
  "details": {
    "recipientName": "Required field is missing"
  },
  "context": {
    "route": "/api/messages/create",
    "method": "POST"
  },
  "stack": "..."
}
```

## Best Practices

1. **Use Specific Error Classes**: Always use the most specific error class for your use case
2. **Include Context**: Provide context when logging errors to aid debugging
3. **Use withErrorHandler**: Prefer `withErrorHandler` wrapper for cleaner code
4. **Don't Expose Sensitive Data**: Never include sensitive information in error messages
5. **Log Before Throwing**: Log errors with context before throwing them
6. **Operational vs Programming Errors**: Mark operational errors as `isOperational: true`

## Migration Guide

To migrate existing API routes to use the new error handling system:

### Before:

```typescript
export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON' } },
        { status: 400, headers }
      );
    }
    
    // Logic here
    
    return NextResponse.json({ success: true }, { status: 200, headers });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Error occurred' } },
      { status: 500, headers }
    );
  }
}
```

### After:

```typescript
import { withErrorHandler, parseJSON, createSuccessResponse } from '@/lib/errorHandler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await parseJSON(request);
  
  // Logic here
  
  return createSuccessResponse({ success: true });
});
```

## Testing

When testing API routes with error handling:

```typescript
import { handleError } from '@/lib/errorHandler';
import { ValidationError } from '@/lib/errors';

describe('Error Handling', () => {
  it('should return 400 for validation errors', () => {
    const error = new ValidationError('Invalid input');
    const response = handleError(error);
    
    expect(response.status).toBe(400);
  });
});
```

## Requirements Coverage

- **Requirement 5.2**: Validation errors return appropriate HTTP codes with descriptive messages
- **Requirement 8.4**: Upload failures return clear error messages
- **Requirement 6.4**: Database transaction failures are handled with rollback
- **Requirement 2.5**: Stripe webhook signature validation errors are handled
- **Requirement 5.4**: All responses include CORS headers

## Future Enhancements

- Add request ID tracking for distributed tracing
- Implement error rate monitoring and alerting
- Add structured logging with log levels
- Implement error recovery strategies
- Add error reporting to external services (e.g., Sentry)
