import { NextRequest, NextResponse } from 'next/server';
import { genderRevealService } from '@/services/GenderRevealService';

/**
 * GET /api/gender-reveal/by-slug/[slug]
 * Get a gender reveal by public slug and increment view count
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const reveal = await genderRevealService.findBySlug(slug);

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

    // Increment view count
    await genderRevealService.incrementViewCount(reveal.id);

    // Get current vote stats
    const stats = await genderRevealService.getStats(reveal.id);

    return NextResponse.json({
      reveal: {
        id: reveal.id,
        boyName: reveal.boyName,
        girlName: reveal.girlName,
        actualGender: reveal.actualGender,
        dadName: reveal.dadName,
        momName: reveal.momName,
        storyMessage: reveal.storyMessage,
        photos: reveal.photos,
        boyColor: reveal.boyColor,
        girlColor: reveal.girlColor,
      },
      stats: {
        totalVotes: stats.totalVotes,
        boyVotes: stats.boyVotes,
        girlVotes: stats.girlVotes,
      },
    });
  } catch (error) {
    console.error('[API] Error getting gender reveal by slug:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get gender reveal' },
      { status: 500 }
    );
  }
}
