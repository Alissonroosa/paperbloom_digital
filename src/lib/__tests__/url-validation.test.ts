/**
 * URL Accessibility Validation Tests
 * Requirement: 6.5
 * 
 * Tests for URL accessibility validation with retry logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateURLAccessibility,
  validateMultipleURLs,
  validateStoredURLs,
  type URLValidationResult,
} from '../utils';

// Mock fetch globally
const originalFetch = global.fetch;

describe('URL Accessibility Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('validateURLAccessibility', () => {
    it('should return accessible true for successful HEAD request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await validateURLAccessibility('https://example.com/image.jpg');

      expect(result.accessible).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.attempts).toBe(1);
      expect(result.error).toBeUndefined();
    });

    it('should retry on failure and succeed on second attempt', async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
        });
      });

      const result = await validateURLAccessibility('https://example.com/image.jpg', {
        maxRetries: 3,
        retryDelay: 10,
      });

      expect(result.accessible).toBe(true);
      expect(result.attempts).toBe(2);
      expect(callCount).toBe(2);
    });

    it('should return accessible false after max retries', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await validateURLAccessibility('https://example.com/image.jpg', {
        maxRetries: 2,
        retryDelay: 10,
      });

      expect(result.accessible).toBe(false);
      expect(result.attempts).toBe(2);
      expect(result.error).toBe('Network error');
    });

    it('should handle HTTP error responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await validateURLAccessibility('https://example.com/missing.jpg', {
        maxRetries: 2,
        retryDelay: 10,
      });

      expect(result.accessible).toBe(false);
      expect(result.attempts).toBe(2);
      expect(result.error).toContain('404');
    });

    it('should handle timeout', async () => {
      global.fetch = vi.fn().mockImplementation((url, options) => {
        return new Promise((resolve, reject) => {
          // Simulate abort signal
          if (options?.signal) {
            const abortHandler = () => {
              const error = new Error('The operation was aborted');
              error.name = 'AbortError';
              reject(error);
            };
            options.signal.addEventListener('abort', abortHandler);
          }
          
          // Never resolve to simulate slow response
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              statusText: 'OK',
            });
          }, 10000); // 10 seconds
        });
      });

      const result = await validateURLAccessibility('https://example.com/slow.jpg', {
        maxRetries: 1,
        timeout: 100, // 100ms timeout
        retryDelay: 10,
      });

      expect(result.accessible).toBe(false);
      expect(result.error).toBe('Request timeout');
    });

    it('should use default options when not provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await validateURLAccessibility('https://example.com/image.jpg');

      expect(result.accessible).toBe(true);
      expect(result.attempts).toBe(1);
    });
  });

  describe('validateMultipleURLs', () => {
    it('should validate multiple URLs concurrently', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];

      const results = await validateMultipleURLs(urls);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.accessible)).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and failure', async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation((url) => {
        callCount++;
        if (url.includes('image2')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found',
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
        });
      });

      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];

      const results = await validateMultipleURLs(urls, {
        maxRetries: 1,
        retryDelay: 10,
      });

      expect(results).toHaveLength(3);
      expect(results[0].accessible).toBe(true);
      expect(results[1].accessible).toBe(false);
      expect(results[2].accessible).toBe(true);
    });

    it('should handle empty array', async () => {
      const results = await validateMultipleURLs([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('validateStoredURLs', () => {
    it('should validate both imageUrl and qrCodeUrl', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await validateStoredURLs(
        'https://example.com/image.jpg',
        'https://example.com/qrcode.png'
      );

      expect(result.imageUrl?.accessible).toBe(true);
      expect(result.qrCodeUrl?.accessible).toBe(true);
      expect(result.allAccessible).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should validate only imageUrl when qrCodeUrl is null', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await validateStoredURLs(
        'https://example.com/image.jpg',
        null
      );

      expect(result.imageUrl?.accessible).toBe(true);
      expect(result.qrCodeUrl).toBeUndefined();
      expect(result.allAccessible).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should validate only qrCodeUrl when imageUrl is null', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await validateStoredURLs(
        null,
        'https://example.com/qrcode.png'
      );

      expect(result.imageUrl).toBeUndefined();
      expect(result.qrCodeUrl?.accessible).toBe(true);
      expect(result.allAccessible).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return allAccessible true when both URLs are null', async () => {
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const result = await validateStoredURLs(null, null);

      expect(result.imageUrl).toBeUndefined();
      expect(result.qrCodeUrl).toBeUndefined();
      expect(result.allAccessible).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return allAccessible false when any URL is inaccessible', async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation((url) => {
        callCount++;
        if (url.includes('qrcode')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found',
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
        });
      });

      const result = await validateStoredURLs(
        'https://example.com/image.jpg',
        'https://example.com/qrcode.png',
        { maxRetries: 1, retryDelay: 10 }
      );

      expect(result.imageUrl?.accessible).toBe(true);
      expect(result.qrCodeUrl?.accessible).toBe(false);
      expect(result.allAccessible).toBe(false);
    });
  });

  describe('Error Logging', () => {
    it('should log inaccessible URLs to console.error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await validateURLAccessibility('https://example.com/image.jpg', {
        maxRetries: 1,
        retryDelay: 10,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[URL Validation]'),
        expect.objectContaining({
          url: 'https://example.com/image.jpg',
          error: 'Network error',
        })
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
