import { NextRequest, NextResponse } from 'next/server';
import { genderRevealService } from '@/services/GenderRevealService';
import { validateCreateGenderReveal } from '@/types/gender-reveal';

/**
 * POST /api/gender-reveal
 * Create a new gender reveal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateCreateGenderReveal(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Create gender reveal
    const reveal = await genderRevealService.create(validation.data);

    return NextResponse.json({
      success: true,
      reveal: {
        id: reveal.id,
        boyName: reveal.boyName,
        girlName: reveal.girlName,
        status: reveal.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating gender reveal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create gender reveal' },
      { status: 500 }
    );
  }
}
