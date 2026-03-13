import { NextRequest, NextResponse } from 'next/server';
import { genderRevealService } from '@/services/GenderRevealService';
import { validateCreateVote } from '@/types/gender-reveal';

/**
 * POST /api/gender-reveal/[id]/vote
 * Add a vote to a gender reveal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = validateCreateVote({ ...body, revealId: id });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if reveal exists and is paid
    const reveal = await genderRevealService.findById(id);
    if (!reveal) {
      return NextResponse.json(
        { error: 'Gender reveal not found' },
        { status: 404 }
      );
    }

    if (reveal.status !== 'paid') {
      return NextResponse.json(
        { error: 'Gender reveal not available' },
        { status: 403 }
      );
    }

    // Add vote
    const vote = await genderRevealService.addVote(validation.data);

    return NextResponse.json({
      success: true,
      vote: {
        id: vote.id,
        voterName: vote.voterName,
        vote: vote.vote,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[API] Error adding vote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add vote' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gender-reveal/[id]/vote
 * Get votes for a gender reveal (for dashboard)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stats = await genderRevealService.getStats(id);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[API] Error getting votes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get votes' },
      { status: 500 }
    );
  }
}
