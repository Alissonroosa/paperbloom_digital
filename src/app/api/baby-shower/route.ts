import { NextRequest, NextResponse } from 'next/server';
import { babyShowerService } from '@/services/BabyShowerService';
import { validateCreateBabyShower } from '@/types/baby-shower';

/**
 * POST /api/baby-shower
 * Create a new baby shower ("Chá de Fralda") event with its gift list.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateCreateBabyShower(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const event = await babyShowerService.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        babyShower: {
          id: event.id,
          hostName: event.hostName,
          babyName: event.babyName,
          status: event.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error creating baby shower:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create baby shower' },
      { status: 500 }
    );
  }
}
