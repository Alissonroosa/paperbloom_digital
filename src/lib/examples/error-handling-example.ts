/**
 * Error Handling Examples
 * 
 * This file demonstrates how to use the centralized error handling system
 * in various scenarios.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withErrorHandler,
  parseJSON,
  createSuccessResponse,
  createOptionsHandler,
  handleError,
} from '@/lib/errorHandler';
import {
  ValidationError,
  NotFoundError,
  PaymentRequiredError,
  DatabaseError,
} from '@/lib/errors';

// ============================================================================
// Example 1: Simple API Route with Error Handling
// ============================================================================

/**
 * Basic example using withErrorHandler wrapper
 * This is the recommended approach for most API routes
 */
export const POST_Example1 = withErrorHandler(async (request: NextRequest) => {
  // Parse JSON - automatically throws InvalidJSONError if parsing fails
  const body = await parseJSON<{ name: string; email: string }>(request);

  // Validate input
  if (!body.name || body.name.trim().length === 0) {
    throw new ValidationError('Name is required', {
      name: 'Name must not be empty',
    });
  }

  if (!body.email || !body.email.includes('@')) {
    throw new ValidationError('Invalid email', {
      email: 'Email must be a valid email address',
    });
  }

  // Your business logic here
  const result = {
    id: '123',
    name: body.name,
    email: body.email,
  };

  // Return success response with CORS headers
  return createSuccessResponse(result, 201);
});

// OPTIONS handler for CORS
export const OPTIONS_Example1 = createOptionsHandler;

// ============================================================================
// Example 2: Manual Error Handling (when you need more control)
// ============================================================================

/**
 * Example with manual error handling
 * Use this when you need custom error handling logic
 */
export async function POST_Example2(request: NextRequest) {
  try {
    const body = await parseJSON(request);

    // Custom validation logic
    if (!body.id) {
      throw new ValidationError('ID is required');
    }

    // Simulate database operation
    const record = await findRecordById(body.id);

    if (!record) {
      throw new NotFoundError('Record not found', 'RECORD_NOT_FOUND');
    }

    return createSuccessResponse(record);
  } catch (error) {
    // Manual error handling with context
    return handleError(error as Error, {
      route: '/api/example2',
      method: 'POST',
      requestId: request.headers.get('x-request-id'),
    });
  }
}

// ============================================================================
// Example 3: Database Error Handling
// ============================================================================

/**
 * Example showing database error handling
 * Database errors are automatically mapped to appropriate HTTP status codes
 */
export const POST_Example3 = withErrorHandler(async (request: NextRequest) => {
  const body = await parseJSON(request);

  try {
    // Simulate database operation that might fail
    const result = await insertRecord(body);
    return createSuccessResponse(result, 201);
  } catch (error) {
    // Database errors are automatically mapped by the error handler
    // For example:
    // - Duplicate key (23505) -> 409 Conflict
    // - Foreign key violation (23503) -> 400 Bad Request
    // - Connection error (08006) -> 503 Service Unavailable
    throw error;
  }
});

// ============================================================================
// Example 4: Payment/Stripe Error Handling
// ============================================================================

/**
 * Example showing payment-related error handling
 */
export const POST_Example4 = withErrorHandler(async (request: NextRequest) => {
  const body = await parseJSON<{ messageId: string }>(request);

  // Find the message
  const message = await findMessageById(body.messageId);

  if (!message) {
    throw new NotFoundError('Message not found', 'MESSAGE_NOT_FOUND');
  }

  // Check if payment is required
  if (message.status !== 'paid') {
    throw new PaymentRequiredError(
      'This message requires payment to access'
    );
  }

  // Return message data
  return createSuccessResponse(message);
});

// ============================================================================
// Example 5: File Upload Error Handling
// ============================================================================

/**
 * Example showing file upload error handling
 */
export const POST_Example5 = withErrorHandler(async (request: NextRequest) => {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    throw new ValidationError('File is required', {
      file: 'A valid file must be provided',
    });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError('Invalid file type', {
      file: `File type must be one of: ${allowedTypes.join(', ')}`,
    });
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new ValidationError('File too large', {
      file: `File size must not exceed ${maxSize / (1024 * 1024)}MB`,
    });
  }

  try {
    // Process file upload
    const url = await uploadFile(file);
    return createSuccessResponse({ url });
  } catch (error) {
    // File system errors are automatically mapped
    throw error;
  }
});

// ============================================================================
// Example 6: Complex Validation with Multiple Errors
// ============================================================================

/**
 * Example showing complex validation with multiple error details
 */
export const POST_Example6 = withErrorHandler(async (request: NextRequest) => {
  const body = await parseJSON<{
    recipientName: string;
    senderName: string;
    messageText: string;
    email?: string;
  }>(request);

  // Collect all validation errors
  const errors: Record<string, string> = {};

  if (!body.recipientName || body.recipientName.trim().length === 0) {
    errors.recipientName = 'Recipient name is required';
  } else if (body.recipientName.length > 100) {
    errors.recipientName = 'Recipient name must not exceed 100 characters';
  }

  if (!body.senderName || body.senderName.trim().length === 0) {
    errors.senderName = 'Sender name is required';
  } else if (body.senderName.length > 100) {
    errors.senderName = 'Sender name must not exceed 100 characters';
  }

  if (!body.messageText || body.messageText.trim().length === 0) {
    errors.messageText = 'Message text is required';
  } else if (body.messageText.length > 500) {
    errors.messageText = 'Message text must not exceed 500 characters';
  }

  if (body.email && !isValidEmail(body.email)) {
    errors.email = 'Email must be a valid email address';
  }

  // If there are any validation errors, throw them all at once
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed for one or more fields', errors);
  }

  // Process the valid data
  const result = await createMessage(body);
  return createSuccessResponse(result, 201);
});

// ============================================================================
// Helper Functions (for demonstration purposes)
// ============================================================================

async function findRecordById(id: string): Promise<any | null> {
  // Simulate database lookup
  return { id, name: 'Example Record' };
}

async function insertRecord(data: any): Promise<any> {
  // Simulate database insert
  return { id: '123', ...data };
}

async function findMessageById(id: string): Promise<any | null> {
  // Simulate database lookup
  return { id, status: 'paid', content: 'Example message' };
}

async function uploadFile(file: File): Promise<string> {
  // Simulate file upload
  return '/uploads/example.jpg';
}

async function createMessage(data: any): Promise<any> {
  // Simulate message creation
  return { id: '123', ...data };
}

function isValidEmail(email: string): boolean {
  // Simple email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================================
// Example 7: Nested Error Handling
// ============================================================================

/**
 * Example showing nested operations with proper error propagation
 */
export const POST_Example7 = withErrorHandler(async (request: NextRequest) => {
  const body = await parseJSON<{ userId: string; action: string }>(request);

  // Validate user exists
  const user = await validateUser(body.userId);

  // Perform action based on user permissions
  const result = await performAction(user, body.action);

  return createSuccessResponse(result);
});

async function validateUser(userId: string): Promise<any> {
  const user = await findRecordById(userId);

  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  if (!user.isActive) {
    throw new ValidationError('User account is not active', {
      userId: 'User account must be active',
    });
  }

  return user;
}

async function performAction(user: any, action: string): Promise<any> {
  if (!user.permissions.includes(action)) {
    throw new ValidationError('User does not have permission for this action', {
      action: `User lacks permission: ${action}`,
    });
  }

  // Perform the action
  return { success: true, action };
}
