import { NextRequest, NextResponse } from 'next/server';
import { cardCollectionService } from '@/services/CardCollectionService';
import { cardService } from '@/services/CardService';
import { validateCreateCardCollection, formatValidationErrors } from '@/types/card';

/**
 * POST /api/card-collections/create
 * Creates a new card collection with 12 pre-filled cards
 * 
 * Requirements: 1.1, 1.2, 1.3
 * 
 * @param request - Next.js request object
 * @returns JSON response with collection and cards or error
 */
export async function POST(request: NextRequest) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Parse and validate JSON request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      // Invalid JSON format
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON format in request body',
          },
        },
        { status: 400, headers }
      );
    }

    // Validate request body using Zod schema (Requirement 1.1)
    const validation = validateCreateCardCollection(body);
    
    if (!validation.success) {
      // Return validation errors with 400 status
      const formattedErrors = formatValidationErrors(validation.error);
      
      // Log validation errors for debugging
      console.error('Validation failed:', {
        body,
        errors: formattedErrors
      });
      
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed for one or more fields',
            details: formattedErrors,
          },
        },
        { status: 400, headers }
      );
    }

    // Create card collection (Requirements 1.1, 1.2)
    const collection = await cardCollectionService.create(validation.data);

    // Create 12 cards with pre-filled templates (Requirement 1.3)
    const cards = await cardService.createBulk(collection.id);

    // Return success response with collection and cards
    return NextResponse.json(
      {
        collection,
        cards,
        message: 'Card collection created successfully with 12 cards',
      },
      { status: 201, headers }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in POST /api/card-collections/create:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while creating the card collection',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/card-collections/create
 * Handle preflight CORS requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
