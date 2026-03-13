# Error Handling Migration Example

This document shows a before/after comparison of migrating an API route to use the new centralized error handling system.

## Before: Manual Error Handling

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/MessageService';
import { validateCreateMessage, formatValidationErrors } from '@/types/message';

export async function POST(request: NextRequest) {
  // Manual CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Manual JSON parsing with try-catch
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON format in request body',
          },
        },
        { status: 400, headers }
      );
    }

    // Manual validation
    const validation = validateCreateMessage(body);
    
    if (!validation.success) {
      const formattedErrors = formatValidationErrors(validation.error);
      
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed for one or more fields',
            details: formattedErrors,
          },
        },
        { status: 400, headers }
      );
    }

    // Business logic
    const message = await messageService.create(validation.data);

    // Manual success response
    return NextResponse.json(
      {
        id: message.id,
        message: 'Message created successfully',
      },
      { status: 201, headers }
    );
  } catch (error) {
    // Generic error handling
    console.error('Error in POST /api/messages/create:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while creating the message',
        },
      },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
```

**Issues with this approach:**
- ❌ Repetitive CORS header code
- ❌ Manual JSON parsing with nested try-catch
- ❌ Manual error response formatting
- ❌ No automatic error mapping for database errors
- ❌ Generic error logging without context
- ❌ Duplicate OPTIONS handler code
- ❌ Hard to maintain and test

**Lines of code:** ~80 lines

---

## After: Centralized Error Handling

```typescript
import { NextRequest } from 'next/server';
import { 
  withErrorHandler, 
  parseJSON, 
  createSuccessResponse,
  createOptionsHandler 
} from '@/lib/errorHandler';
import { ValidationError } from '@/lib/errors';
import { messageService } from '@/services/MessageService';
import { validateCreateMessage, formatValidationErrors } from '@/types/message';

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Automatic JSON parsing with error handling
  const body = await parseJSON(request);

  // Validation
  const validation = validateCreateMessage(body);
  
  if (!validation.success) {
    const formattedErrors = formatValidationErrors(validation.error);
    throw new ValidationError('Validation failed for one or more fields', formattedErrors);
  }

  // Business logic
  const message = await messageService.create(validation.data);

  // Automatic success response with CORS headers
  return createSuccessResponse(
    {
      id: message.id,
      message: 'Message created successfully',
    },
    201
  );
});

// Automatic OPTIONS handler
export const OPTIONS = createOptionsHandler;
```

**Benefits of this approach:**
- ✅ Automatic CORS headers
- ✅ Automatic JSON parsing with error handling
- ✅ Automatic error response formatting
- ✅ Automatic error mapping for database errors
- ✅ Structured error logging with context
- ✅ Reusable OPTIONS handler
- ✅ Easy to maintain and test
- ✅ Type-safe error handling

**Lines of code:** ~30 lines (62% reduction!)

---

## Comparison Summary

| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lines of Code | ~80 | ~30 | 62% reduction |
| CORS Headers | Manual | Automatic | ✅ |
| JSON Parsing | Manual try-catch | Automatic | ✅ |
| Error Formatting | Manual | Automatic | ✅ |
| Error Mapping | None | Automatic | ✅ |
| Logging | Basic | Structured with context | ✅ |
| Type Safety | Partial | Full | ✅ |
| Maintainability | Low | High | ✅ |
| Testability | Difficult | Easy | ✅ |

---

## Migration Steps

### Step 1: Import Error Handling Utilities
```typescript
import { 
  withErrorHandler, 
  parseJSON, 
  createSuccessResponse,
  createOptionsHandler 
} from '@/lib/errorHandler';
import { ValidationError, NotFoundError } from '@/lib/errors';
```

### Step 2: Replace Function Declaration
```typescript
// Before
export async function POST(request: NextRequest) {
  // ...
}

// After
export const POST = withErrorHandler(async (request: NextRequest) => {
  // ...
});
```

### Step 3: Remove Manual CORS Headers
```typescript
// Before
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// After
// Not needed - automatic!
```

### Step 4: Replace JSON Parsing
```typescript
// Before
let body;
try {
  body = await request.json();
} catch (error) {
  return NextResponse.json(
    { error: { code: 'INVALID_JSON', message: '...' } },
    { status: 400, headers }
  );
}

// After
const body = await parseJSON(request);
```

### Step 5: Replace Error Responses with Throws
```typescript
// Before
if (!validation.success) {
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: '...', details: {...} } },
    { status: 400, headers }
  );
}

// After
if (!validation.success) {
  throw new ValidationError('Validation failed', formattedErrors);
}
```

### Step 6: Replace Success Responses
```typescript
// Before
return NextResponse.json(
  { id: message.id, message: 'Success' },
  { status: 201, headers }
);

// After
return createSuccessResponse(
  { id: message.id, message: 'Success' },
  201
);
```

### Step 7: Remove Try-Catch Block
```typescript
// Before
try {
  // ... all your code
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: '...' } },
    { status: 500, headers }
  );
}

// After
// Not needed - withErrorHandler handles it!
```

### Step 8: Replace OPTIONS Handler
```typescript
// Before
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// After
export const OPTIONS = createOptionsHandler;
```

---

## Testing After Migration

1. Test successful requests still work
2. Test validation errors return 400 with proper format
3. Test invalid JSON returns 400
4. Test database errors are properly mapped
5. Test CORS headers are present
6. Verify error logging includes context

---

## Additional Examples

### Example: Not Found Error

```typescript
// Before
if (!message) {
  return NextResponse.json(
    { error: { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' } },
    { status: 404, headers }
  );
}

// After
if (!message) {
  throw new NotFoundError('Message not found', 'MESSAGE_NOT_FOUND');
}
```

### Example: Payment Required Error

```typescript
// Before
if (message.status !== 'paid') {
  return NextResponse.json(
    { error: { code: 'PAYMENT_REQUIRED', message: 'Payment required' } },
    { status: 402, headers }
  );
}

// After
if (message.status !== 'paid') {
  throw new PaymentRequiredError('Payment required to access this message');
}
```

### Example: Database Error Handling

```typescript
// Before
try {
  const result = await pool.query('...');
} catch (error) {
  console.error('Database error:', error);
  return NextResponse.json(
    { error: { code: 'DATABASE_ERROR', message: 'Database error' } },
    { status: 500, headers }
  );
}

// After
// Just let the error propagate - it will be automatically mapped!
const result = await pool.query('...');
```

---

## Conclusion

The new centralized error handling system provides:
- **62% less code** to write and maintain
- **Automatic error mapping** for common error types
- **Consistent error responses** across all API routes
- **Better logging** with context
- **Type safety** with TypeScript
- **Easier testing** with reusable utilities

Start migrating your API routes today! 🚀
