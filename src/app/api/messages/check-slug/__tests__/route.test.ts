/**
 * Tests for slug availability check API route
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';
import db from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('GET /api/messages/check-slug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if slug parameter is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/messages/check-slug');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('Slug parameter is required');
  });

  it('should return 400 if slug format is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/messages/check-slug?slug=Invalid_Slug!');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.available).toBe(false);
    expect(data.error).toContain('Invalid slug format');
  });

  it('should return available true if slug does not exist', async () => {
    // Mock database to return no results
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);
    
    const request = new NextRequest('http://localhost:3000/api/messages/check-slug?slug=my-unique-slug');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.available).toBe(true);
    expect(data.slug).toBe('my-unique-slug');
    expect(data.suggestion).toBeUndefined();
  });

  it('should return available false with suggestion if slug exists', async () => {
    // Mock database to return existing slug
    vi.mocked(db.query)
      .mockResolvedValueOnce({ rows: [{ id: '123' }] } as any) // First check - slug exists
      .mockResolvedValueOnce({ rows: [] } as any); // Second check - suggestion available
    
    const request = new NextRequest('http://localhost:3000/api/messages/check-slug?slug=taken-slug');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.slug).toBe('taken-slug');
    expect(data.suggestion).toBe('taken-slug-1');
  });

  it('should try multiple suggestions if first ones are taken', async () => {
    // Mock database to return existing slug and first two suggestions taken
    vi.mocked(db.query)
      .mockResolvedValueOnce({ rows: [{ id: '123' }] } as any) // Original slug exists
      .mockResolvedValueOnce({ rows: [{ id: '456' }] } as any) // -1 exists
      .mockResolvedValueOnce({ rows: [{ id: '789' }] } as any) // -2 exists
      .mockResolvedValueOnce({ rows: [] } as any); // -3 available
    
    const request = new NextRequest('http://localhost:3000/api/messages/check-slug?slug=popular-slug');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.available).toBe(false);
    expect(data.suggestion).toBe('popular-slug-3');
  });

  it('should handle database errors gracefully', async () => {
    // Mock database to throw error
    vi.mocked(db.query).mockRejectedValueOnce(new Error('Database connection failed'));
    
    const request = new NextRequest('http://localhost:3000/api/messages/check-slug?slug=test-slug');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to check slug availability');
    expect(data.available).toBe(false);
  });

  it('should accept valid slug formats with hyphens and numbers', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [] } as any);
    
    const request = new NextRequest('http://localhost:3000/api/messages/check-slug?slug=my-slug-123');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.available).toBe(true);
  });
});
