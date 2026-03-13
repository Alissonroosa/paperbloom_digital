/**
 * Custom Error Classes and Error Handling Middleware
 * Requirements: 5.2, 8.4
 * 
 * This module provides centralized error handling for the Paper Bloom backend.
 * It defines custom error classes for different error types and utilities for
 * consistent error response formatting.
 */

/**
 * Base application error class
 * All custom errors extend from this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
    details?: Record<string, any>
  ) {
    super(message);
    
    // Set the prototype explicitly to maintain proper instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation Error (400)
 * Used when request validation fails
 * Requirement: 5.2
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

/**
 * Invalid JSON Error (400)
 * Used when JSON parsing fails
 * Requirement: 5.1
 */
export class InvalidJSONError extends AppError {
  constructor(message = 'Invalid JSON format in request body') {
    super(message, 400, 'INVALID_JSON', true);
  }
}

/**
 * Not Found Error (404)
 * Used when a resource is not found
 * Requirement: 4.3
 */
export class NotFoundError extends AppError {
  constructor(message: string, code = 'NOT_FOUND') {
    super(message, 404, code, true);
  }
}

/**
 * Payment Required Error (402)
 * Used when a message is not paid
 * Requirement: 4.4
 */
export class PaymentRequiredError extends AppError {
  constructor(message = 'Payment is required to access this resource') {
    super(message, 402, 'PAYMENT_REQUIRED', true);
  }
}

/**
 * Database Error (500)
 * Used when database operations fail
 * Requirement: 6.4
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      500,
      'DATABASE_ERROR',
      true,
      originalError ? { originalError: originalError.message } : undefined
    );
  }
}

/**
 * Stripe API Error (500)
 * Used when Stripe operations fail
 * Requirement: 2.5
 */
export class StripeError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      500,
      'STRIPE_ERROR',
      true,
      originalError ? { originalError: originalError.message } : undefined
    );
  }
}

/**
 * File System Error (500)
 * Used when file operations fail
 * Requirement: 8.4
 */
export class FileSystemError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      500,
      'FILE_SYSTEM_ERROR',
      true,
      originalError ? { originalError: originalError.message } : undefined
    );
  }
}

/**
 * Image Processing Error (400/500)
 * Used when image upload or processing fails
 * Requirement: 8.4
 */
export class ImageProcessingError extends AppError {
  constructor(message: string, statusCode = 500) {
    super(message, statusCode, 'IMAGE_PROCESSING_ERROR', true);
  }
}

/**
 * Error response format interface
 * Requirement: 5.2
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Format error for API response
 * Requirement: 5.2
 * 
 * @param error - Error object
 * @returns Formatted error response
 */
export function formatErrorResponse(error: Error | AppError): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    };
  }

  // For unknown errors, return generic error
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
}

/**
 * Get HTTP status code from error
 * Requirement: 5.2
 * 
 * @param error - Error object
 * @returns HTTP status code
 */
export function getStatusCode(error: Error | AppError): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  // Default to 500 for unknown errors
  return 500;
}

/**
 * Log error with context
 * Requirement: 5.2, 8.4
 * 
 * @param error - Error object
 * @param context - Additional context information
 */
export function logError(error: Error | AppError, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message,
    stack: error.stack,
    ...(error instanceof AppError && {
      code: error.code,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      details: error.details,
    }),
    ...(context && { context }),
  };

  console.error('Error occurred:', JSON.stringify(errorInfo, null, 2));
}

/**
 * Check if error is operational (expected) or programming error
 * Requirement: 5.2
 * 
 * @param error - Error object
 * @returns true if operational, false if programming error
 */
export function isOperationalError(error: Error | AppError): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Map database error to AppError
 * Requirement: 6.4
 * 
 * @param error - Database error
 * @returns Mapped AppError
 */
export function mapDatabaseError(error: any): AppError {
  // PostgreSQL error codes
  const pgErrorCodes: Record<string, { message: string; code: string; status: number }> = {
    '23505': {
      message: 'A record with this value already exists',
      code: 'DUPLICATE_ENTRY',
      status: 409,
    },
    '23503': {
      message: 'Referenced record does not exist',
      code: 'FOREIGN_KEY_VIOLATION',
      status: 400,
    },
    '23502': {
      message: 'Required field is missing',
      code: 'NOT_NULL_VIOLATION',
      status: 400,
    },
    '23514': {
      message: 'Value does not meet constraint requirements',
      code: 'CHECK_VIOLATION',
      status: 400,
    },
    '42P01': {
      message: 'Database table does not exist',
      code: 'UNDEFINED_TABLE',
      status: 500,
    },
    '42703': {
      message: 'Database column does not exist',
      code: 'UNDEFINED_COLUMN',
      status: 500,
    },
    '08006': {
      message: 'Database connection failed',
      code: 'CONNECTION_FAILURE',
      status: 503,
    },
    '08003': {
      message: 'Database connection does not exist',
      code: 'CONNECTION_DOES_NOT_EXIST',
      status: 503,
    },
  };

  // Check if it's a PostgreSQL error with a code
  if (error.code && pgErrorCodes[error.code]) {
    const mapped = pgErrorCodes[error.code];
    return new AppError(mapped.message, mapped.status, mapped.code, true, {
      originalError: error.message,
      pgCode: error.code,
    });
  }

  // Generic database error
  return new DatabaseError(
    'A database error occurred',
    error instanceof Error ? error : undefined
  );
}

/**
 * Map Stripe error to AppError
 * Requirement: 2.5
 * 
 * @param error - Stripe error
 * @returns Mapped AppError
 */
export function mapStripeError(error: any): AppError {
  // Stripe error types
  const stripeErrorTypes: Record<string, { message: string; status: number }> = {
    card_error: {
      message: 'Your card was declined',
      status: 402,
    },
    invalid_request_error: {
      message: 'Invalid payment request',
      status: 400,
    },
    api_error: {
      message: 'Payment processing error',
      status: 500,
    },
    authentication_error: {
      message: 'Payment authentication failed',
      status: 401,
    },
    rate_limit_error: {
      message: 'Too many payment requests',
      status: 429,
    },
  };

  // Check if it's a Stripe error with a type
  if (error.type && stripeErrorTypes[error.type]) {
    const mapped = stripeErrorTypes[error.type];
    return new AppError(
      error.message || mapped.message,
      mapped.status,
      'STRIPE_ERROR',
      true,
      {
        stripeType: error.type,
        stripeCode: error.code,
      }
    );
  }

  // Generic Stripe error
  return new StripeError(
    'A payment processing error occurred',
    error instanceof Error ? error : undefined
  );
}

/**
 * Map file system error to AppError
 * Requirement: 8.4
 * 
 * @param error - File system error
 * @returns Mapped AppError
 */
export function mapFileSystemError(error: any): AppError {
  // Node.js file system error codes
  const fsErrorCodes: Record<string, { message: string; status: number }> = {
    ENOENT: {
      message: 'File or directory not found',
      status: 404,
    },
    EACCES: {
      message: 'Permission denied',
      status: 403,
    },
    EEXIST: {
      message: 'File already exists',
      status: 409,
    },
    ENOSPC: {
      message: 'No space left on device',
      status: 507,
    },
    EMFILE: {
      message: 'Too many open files',
      status: 500,
    },
  };

  // Check if it's a Node.js error with a code
  if (error.code && fsErrorCodes[error.code]) {
    const mapped = fsErrorCodes[error.code];
    return new AppError(mapped.message, mapped.status, 'FILE_SYSTEM_ERROR', true, {
      originalError: error.message,
      fsCode: error.code,
    });
  }

  // Generic file system error
  return new FileSystemError(
    'A file system error occurred',
    error instanceof Error ? error : undefined
  );
}
