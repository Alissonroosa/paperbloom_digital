/**
 * Error Handling Tests
 * Requirements: 5.2, 8.4
 * 
 * Tests for the centralized error handling system
 */

import { describe, it, expect } from 'vitest';
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

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with all properties', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR', true, {
        field: 'test',
      });

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual({ field: 'test' });
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with 400 status', () => {
      const error = new ValidationError('Validation failed', {
        name: 'Required',
      });

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual({ name: 'Required' });
    });
  });

  describe('InvalidJSONError', () => {
    it('should create an InvalidJSONError with default message', () => {
      const error = new InvalidJSONError();

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_JSON');
      expect(error.message).toBe('Invalid JSON format in request body');
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource not found', 'RESOURCE_NOT_FOUND');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('RESOURCE_NOT_FOUND');
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('PaymentRequiredError', () => {
    it('should create a PaymentRequiredError with 402 status', () => {
      const error = new PaymentRequiredError();

      expect(error.statusCode).toBe(402);
      expect(error.code).toBe('PAYMENT_REQUIRED');
    });
  });

  describe('DatabaseError', () => {
    it('should create a DatabaseError with 500 status', () => {
      const originalError = new Error('Connection failed');
      const error = new DatabaseError('Database error', originalError);

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.details?.originalError).toBe('Connection failed');
    });
  });

  describe('StripeError', () => {
    it('should create a StripeError with 500 status', () => {
      const originalError = new Error('Payment failed');
      const error = new StripeError('Stripe error', originalError);

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('STRIPE_ERROR');
      expect(error.details?.originalError).toBe('Payment failed');
    });
  });

  describe('FileSystemError', () => {
    it('should create a FileSystemError with 500 status', () => {
      const originalError = new Error('File not found');
      const error = new FileSystemError('File system error', originalError);

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('FILE_SYSTEM_ERROR');
      expect(error.details?.originalError).toBe('File not found');
    });
  });

  describe('ImageProcessingError', () => {
    it('should create an ImageProcessingError with custom status', () => {
      const error = new ImageProcessingError('Invalid image', 400);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('IMAGE_PROCESSING_ERROR');
      expect(error.message).toBe('Invalid image');
    });
  });
});

describe('Error Utilities', () => {
  describe('formatErrorResponse', () => {
    it('should format AppError correctly', () => {
      const error = new ValidationError('Validation failed', {
        name: 'Required',
      });

      const response = formatErrorResponse(error);

      expect(response).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { name: 'Required' },
        },
      });
    });

    it('should format generic Error as INTERNAL_ERROR', () => {
      const error = new Error('Something went wrong');

      const response = formatErrorResponse(error);

      expect(response).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    });
  });

  describe('getStatusCode', () => {
    it('should return status code from AppError', () => {
      const error = new ValidationError('Test');
      expect(getStatusCode(error)).toBe(400);
    });

    it('should return 500 for generic Error', () => {
      const error = new Error('Test');
      expect(getStatusCode(error)).toBe(500);
    });
  });

  describe('isOperationalError', () => {
    it('should return true for operational AppError', () => {
      const error = new ValidationError('Test');
      expect(isOperationalError(error)).toBe(true);
    });

    it('should return false for non-operational AppError', () => {
      const error = new AppError('Test', 500, 'TEST', false);
      expect(isOperationalError(error)).toBe(false);
    });

    it('should return false for generic Error', () => {
      const error = new Error('Test');
      expect(isOperationalError(error)).toBe(false);
    });
  });
});

describe('Error Mapping', () => {
  describe('mapDatabaseError', () => {
    it('should map duplicate key error (23505)', () => {
      const pgError = { code: '23505', message: 'Duplicate key' };
      const error = mapDatabaseError(pgError);

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('DUPLICATE_ENTRY');
      expect(error.message).toBe('A record with this value already exists');
    });

    it('should map foreign key violation (23503)', () => {
      const pgError = { code: '23503', message: 'Foreign key violation' };
      const error = mapDatabaseError(pgError);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('FOREIGN_KEY_VIOLATION');
    });

    it('should map not null violation (23502)', () => {
      const pgError = { code: '23502', message: 'Not null violation' };
      const error = mapDatabaseError(pgError);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('NOT_NULL_VIOLATION');
    });

    it('should map connection failure (08006)', () => {
      const pgError = { code: '08006', message: 'Connection failed' };
      const error = mapDatabaseError(pgError);

      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('CONNECTION_FAILURE');
    });

    it('should map unknown database error to generic DatabaseError', () => {
      const pgError = { code: 'UNKNOWN', message: 'Unknown error' };
      const error = mapDatabaseError(pgError);

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('mapStripeError', () => {
    it('should map card error', () => {
      const stripeError = {
        type: 'card_error',
        message: 'Card declined',
        code: 'card_declined',
      };
      const error = mapStripeError(stripeError);

      expect(error.statusCode).toBe(402);
      expect(error.code).toBe('STRIPE_ERROR');
      expect(error.message).toBe('Card declined');
    });

    it('should map invalid request error', () => {
      const stripeError = {
        type: 'invalid_request_error',
        message: 'Invalid request',
      };
      const error = mapStripeError(stripeError);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('STRIPE_ERROR');
    });

    it('should map rate limit error', () => {
      const stripeError = {
        type: 'rate_limit_error',
        message: 'Too many requests',
      };
      const error = mapStripeError(stripeError);

      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('STRIPE_ERROR');
    });

    it('should map unknown Stripe error to generic StripeError', () => {
      const stripeError = { type: 'unknown', message: 'Unknown error' };
      const error = mapStripeError(stripeError);

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('STRIPE_ERROR');
    });
  });

  describe('mapFileSystemError', () => {
    it('should map ENOENT error', () => {
      const fsError = { code: 'ENOENT', message: 'File not found' };
      const error = mapFileSystemError(fsError);

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('FILE_SYSTEM_ERROR');
      expect(error.message).toBe('File or directory not found');
    });

    it('should map EACCES error', () => {
      const fsError = { code: 'EACCES', message: 'Permission denied' };
      const error = mapFileSystemError(fsError);

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FILE_SYSTEM_ERROR');
    });

    it('should map EEXIST error', () => {
      const fsError = { code: 'EEXIST', message: 'File exists' };
      const error = mapFileSystemError(fsError);

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('FILE_SYSTEM_ERROR');
    });

    it('should map ENOSPC error', () => {
      const fsError = { code: 'ENOSPC', message: 'No space' };
      const error = mapFileSystemError(fsError);

      expect(error.statusCode).toBe(507);
      expect(error.code).toBe('FILE_SYSTEM_ERROR');
    });

    it('should map unknown file system error to generic FileSystemError', () => {
      const fsError = { code: 'UNKNOWN', message: 'Unknown error' };
      const error = mapFileSystemError(fsError);

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('FILE_SYSTEM_ERROR');
    });
  });
});

describe('Error Response Format', () => {
  it('should format error response with all fields', () => {
    const error = new ValidationError('Validation failed', {
      name: 'Required field',
      email: 'Invalid format',
    });

    const response = formatErrorResponse(error);

    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code');
    expect(response.error).toHaveProperty('message');
    expect(response.error).toHaveProperty('details');
    expect(response.error.code).toBe('VALIDATION_ERROR');
    expect(response.error.message).toBe('Validation failed');
    expect(response.error.details).toEqual({
      name: 'Required field',
      email: 'Invalid format',
    });
  });

  it('should format error response without details', () => {
    const error = new NotFoundError('Not found');

    const response = formatErrorResponse(error);

    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code');
    expect(response.error).toHaveProperty('message');
    expect(response.error).not.toHaveProperty('details');
  });
});
