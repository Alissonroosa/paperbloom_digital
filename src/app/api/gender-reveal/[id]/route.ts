import { NextRequest, NextResponse } from 'next/server';
import { genderRevealService } from '@/services/GenderRevealService';

/**
 * GET /api/gender-reveal/[id]
 * Get a gender reveal by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reveal = await genderRevealService.findById(id);

    if (!reveal) {
      return NextResponse.json(
        { error: 'Gender reveal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ reveal });
  } catch (error) {
    console.error('[API] Error getting gender reveal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get gender reveal' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/gender-reveal/[id]
 * Update a gender reveal
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const reveal = await genderRevealService.update(id, body);

    return NextResponse.json({ reveal });
  } catch (error) {
    console.error('[API] Error updating gender reveal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update gender reveal' },
      { status: 500 }
    );
  }
}
