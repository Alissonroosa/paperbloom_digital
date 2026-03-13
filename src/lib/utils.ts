import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * URL Accessibility Validation Utility
 * Requirement: 6.5
 * 
 * Validates that URLs are accessible by making HTTP requests
 * with retry logic for transient failures.
 */

export interface URLValidationOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface URLValidationResult {
  url: string;
  accessible: boolean;
  statusCode?: number;
  error?: string;
  attempts: number;
}

/**
 * Validate URL accessibility with retry logic
 * Requirement: 6.5
 * 
 * @param url - URL to validate
 * @param options - Validation options
 * @returns Validation result
 */
export async function validateURLAccessibility(
  url: string,
  options: URLValidationOptions = {}
): Promise<URLValidationResult> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 5000,
  } = options;

  let attempts = 0;
  let lastError: string | undefined;

  for (let i = 0; i < maxRetries; i++) {
    attempts++;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          url,
          accessible: true,
          statusCode: response.status,
          attempts,
        };
      } else {
        lastError = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = 'Request timeout';
        } else {
          lastError = error.message;
        }
      } else {
        lastError = 'Unknown error';
      }
    }

    // Wait before retrying (except on last attempt)
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // Log inaccessible URL
  console.error(`[URL Validation] URL is inaccessible after ${attempts} attempts:`, {
    url,
    error: lastError,
    timestamp: new Date().toISOString(),
  });

  return {
    url,
    accessible: false,
    error: lastError,
    attempts,
  };
}

/**
 * Validate multiple URLs concurrently
 * Requirement: 6.5
 * 
 * @param urls - Array of URLs to validate
 * @param options - Validation options
 * @returns Array of validation results
 */
export async function validateMultipleURLs(
  urls: string[],
  options: URLValidationOptions = {}
): Promise<URLValidationResult[]> {
  const validationPromises = urls.map(url => 
    validateURLAccessibility(url, options)
  );

  return Promise.all(validationPromises);
}

/**
 * Check if imageUrl and qrCodeUrl are accessible
 * Requirement: 6.5
 * 
 * @param imageUrl - Image URL to validate (optional)
 * @param qrCodeUrl - QR code URL to validate (optional)
 * @param options - Validation options
 * @returns Object with validation results for each URL
 */
export async function validateStoredURLs(
  imageUrl: string | null,
  qrCodeUrl: string | null,
  options: URLValidationOptions = {}
): Promise<{
  imageUrl?: URLValidationResult;
  qrCodeUrl?: URLValidationResult;
  allAccessible: boolean;
}> {
  const urlsToValidate: { key: 'imageUrl' | 'qrCodeUrl'; url: string }[] = [];

  if (imageUrl) {
    urlsToValidate.push({ key: 'imageUrl', url: imageUrl });
  }

  if (qrCodeUrl) {
    urlsToValidate.push({ key: 'qrCodeUrl', url: qrCodeUrl });
  }

  if (urlsToValidate.length === 0) {
    return { allAccessible: true };
  }

  const results = await Promise.all(
    urlsToValidate.map(({ url }) => validateURLAccessibility(url, options))
  );

  const resultMap: {
    imageUrl?: URLValidationResult;
    qrCodeUrl?: URLValidationResult;
    allAccessible: boolean;
  } = {
    allAccessible: results.every(r => r.accessible),
  };

  urlsToValidate.forEach(({ key }, index) => {
    resultMap[key] = results[index];
  });

  return resultMap;
}
