/**
 * Integration test for slug availability check
 * This test verifies the route works with the actual database
 * 
 * To run: npm test -- src/app/api/messages/check-slug/__tests__/integration.test.ts --run
 */

import { describe, it, expect } from 'vitest';

describe('Slug Availability Check Integration', () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  it('should check slug availability via API', async () => {
    // Generate a unique slug for testing
    const uniqueSlug = `test-slug-${Date.now()}`;
    
    const response = await fetch(`${baseUrl}/api/messages/check-slug?slug=${uniqueSlug}`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.available).toBe(true);
    expect(data.slug).toBe(uniqueSlug);
  });

  it('should reject invalid slug format', async () => {
    const invalidSlug = 'Invalid_Slug!@#';
    
    const response = await fetch(`${baseUrl}/api/messages/check-slug?slug=${invalidSlug}`);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.available).toBe(false);
    expect(data.error).toContain('Invalid slug format');
  });

  it('should require slug parameter', async () => {
    const response = await fetch(`${baseUrl}/api/messages/check-slug`);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('Slug parameter is required');
  });
});
