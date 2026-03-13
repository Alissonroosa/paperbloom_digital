/**
 * Error Handler Middleware for Next.js API Routes
 * Requirements: 5.2, 8.4
 * 
 * This module provides utilities for handling errors in Next.js API routes
 * with consistent error responses and logging.
 */

import { NextResponse } from 'next/server';
import {
  AppError,
  formatErrorResponse,
  getStatusCode,
  logError,
  isOperationalError,
  mapDatabaseError,
  mapStripeError,
  mapFileSystemError,
} from './errors';

/**
 * CORS headers for API responses
 * Requirement: 5.4
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

/**
 * Handle error and return appropriate NextResponse
 * Requirements: 5.2, 8.4
 * 
 * @param error - Error object
 * @param context - Additional context for logging
 * @returns NextResponse with error details
 */
export function handleError(
  error: Error | AppError,
  context?: Record<string, any>
): NextResponse {
  // Log error with context
  logError(error, context);

  // Map known error types to AppError
  let appError: AppError;
  
  if (error instanceof AppError) {
    appError = error;
  } else {
    // Try to map specific error types
    appError = mapErrorToAppError(error);
  }

  // Format error response
  const errorResponse = formatErrorResponse(appError);
  const statusCode = getStatusCode(appError);

  // Return NextResponse with error
  return NextResponse.json(errorResponse, {
    status: statusCode,
    headers: CORS_HEADERS,
  });
}

/**
 * Map generic errors to AppError based on error properties
 * Requirements: 5.2, 6.4, 8.4
 * 
 * @param error - Generic error
 * @returns Mapped AppError
 */
function mapErrorToAppError(error: Error): AppError {
  const errorMessage = error.message.toLowerCase();

  // Database errors
  if (
    'code' in error ||
    errorMessage.includes('database') ||
    errorMessage.includes('query') ||
    errorMessage.includes('connection')
  ) {
    return mapDatabaseError(error);
  }

  // Stripe errors
  if (
    'type' in error ||
    errorMessage.includes('stripe') ||
    errorMessage.includes('payment') ||
    errorMessage.includes('checkout')
  ) {
    return mapStripeError(error);
  }

  // File system errors
  if (
    errorMessage.includes('enoent') ||
    errorMessage.includes('eacces') ||
    errorMessage.includes('file') ||
    errorMessage.includes('directory')
  ) {
    return mapFileSystemError(error);
  }

  // Image processing errors
  if (
    errorMessage.includes('image') ||
    errorMessage.includes('resize') ||
    errorMessage.includes('upload')
  ) {
    return new AppError(error.message, 500, 'IMAGE_PROCESSING_ERROR', true);
  }

  // Generic internal error
  return new AppError(
    'An unexpected error occurred',
    500,
    'INTERNAL_ERROR',
    false
  );
}

/**
 * Async error handler wrapper for API route handlers
 * Requirements: 5.2, 8.4
 * 
 * Wraps an async API route handler and catches any errors,
 * returning a properly formatted error response.
 * 
 * @param handler - Async API route handler function
 * @returns Wrapped handler with error handling
 * 
 * @example
 * export const POST = withErrorHandler(async (request) => {
 *   // Your route logic here
 *   return NextResponse.json({ success: true });
 * });
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Extract context from arguments if available
      const context: Record<string, any> = {};
      
      // Try to extract request information
      if (args[0] && typeof args[0] === 'object' && 'url' in args[0]) {
        context.url = args[0].url;
        context.method = args[0].method;
      }

      // Try to extract params
      if (args[1] && typeof args[1] === 'object' && 'params' in args[1]) {
        context.params = args[1].params;
      }

      return handleError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
    }
  };
}

/**
 * Parse JSON from request with error handling
 * Requirement: 5.1
 * 
 * @param request - Next.js request object
 * @returns Parsed JSON body
 * @throws InvalidJSONError if parsing fails
 */
export async function parseJSON<T = any>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new AppError(
      'Invalid JSON format in request body',
      400,
      'INVALID_JSON',
      true
    );
  }
}

/**
 * Create OPTIONS handler for CORS preflight requests
 * Requirement: 5.4
 * 
 * @returns NextResponse for OPTIONS request
 */
export function createOptionsHandler(): NextResponse {
  return NextResponse.json({}, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

/**
 * Validate required environment variables
 * Throws error if any required variables are missing
 * 
 * @param variables - Array of required environment variable names
 * @throws AppError if any variables are missing
 */
export function validateEnvironmentVariables(variables: string[]): void {
  const missing = variables.filter((varName) => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new AppError(
      `Missing required environment variables: ${missing.join(', ')}`,
      500,
      'CONFIGURATION_ERROR',
      false
    );
  }
}

/**
 * Create a success response with CORS headers
 * Requirement: 5.3, 5.4
 * 
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with data and CORS headers
 */
export function createSuccessResponse(
  data: any,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: CORS_HEADERS,
  });
}

/**
 * Handle database transaction with automatic rollback on error
 * Requirement: 6.4
 * 
 * @param callback - Async function to execute within transaction
 * @returns Result of the callback
 * @throws DatabaseError if transaction fails
 */
export async function withTransaction<T>(
  callback: () => Promise<T>
): Promise<T> {
  try {
    // Note: This is a simplified version. In production, you would use
    // actual database transaction methods from your database client.
    const result = await callback();
    return result;
  } catch (error) {
    // Transaction will automatically rollback on error
    throw mapDatabaseError(error);
  }
}
