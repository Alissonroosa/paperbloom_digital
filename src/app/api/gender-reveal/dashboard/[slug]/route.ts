import { NextRequest, NextResponse } from 'next/server';
import { genderRevealService } from '@/services/GenderRevealService';

/**
 * GET /api/gender-reveal/dashboard/[slug]
 * Get dashboard data for a gender reveal (buyer view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const reveal = await genderRevealService.findByDashboardSlug(slug);

    if (!reveal) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    if (reveal.status !== 'paid') {
      return NextResponse.json(
        { error: 'Dashboard not available' },
        { status: 403 }
      );
    }

    // Get full stats including messages
    const stats = await genderRevealService.getStats(reveal.id);

    return NextResponse.json({
      reveal: {
        id: reveal.id,
        boyName: reveal.boyName,
        girlName: reveal.girlName,
        actualGender: reveal.actualGender,
        dadName: reveal.dadName,
        momName: reveal.momName,
        slug: reveal.slug,
        qrCodeUrl: reveal.qrCodeUrl,
        createdAt: reveal.createdAt,
      },
      stats: {
        totalVotes: stats.totalVotes,
        boyVotes: stats.boyVotes,
        girlVotes: stats.girlVotes,
        viewCount: stats.viewCount,
        votes: stats.votes.map(v => ({
          id: v.id,
          voterName: v.voterName,
          vote: v.vote,
          message: v.message,
          createdAt: v.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('[API] Error getting dashboard:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get dashboard' },
      { status: 500 }
    );
  }
}
