import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateSlugFromTitle } from '@/lib/wizard-utils';

/**
 * GET /api/messages/check-slug
 * Check if a URL slug is available
 * 
 * Query params:
 * - slug: The slug to check
 * 
 * Returns:
 * - available: boolean indicating if slug is available
 * - suggestion: optional alternative slug if unavailable
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    // Validate slug parameter
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { 
          available: false,
          error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.'
        },
        { status: 400 }
      );
    }

    // Check if slug exists in database
    const existingMessage = await db.query(
      'SELECT id FROM messages WHERE slug = $1 LIMIT 1',
      [slug]
    );

    const isAvailable = existingMessage.rows.length === 0;

    // If slug is taken, generate a suggestion
    let suggestion: string | undefined;
    if (!isAvailable) {
      // Try adding numbers to the slug
      for (let i = 1; i <= 5; i++) {
        const suggestedSlug = `${slug}-${i}`;
        const checkSuggestion = await db.query(
          'SELECT id FROM messages WHERE slug = $1 LIMIT 1',
          [suggestedSlug]
        );
        
        if (checkSuggestion.rows.length === 0) {
          suggestion = suggestedSlug;
          break;
        }
      }

      // If still no suggestion, add timestamp
      if (!suggestion) {
        const timestamp = Date.now().toString().slice(-6);
        suggestion = `${slug}-${timestamp}`;
      }
    }

    return NextResponse.json({
      available: isAvailable,
      slug,
      ...(suggestion && { suggestion }),
    });

  } catch (error) {
    console.error('Error checking slug availability:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check slug availability',
        available: false 
      },
      { status: 500 }
    );
  }
}
