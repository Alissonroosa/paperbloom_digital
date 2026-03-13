import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/services/MessageService';
import { validateCreateMessage, formatValidationErrors } from '@/types/message';
import { z } from 'zod';

/**
 * POST /api/messages/create
 * Creates a new message in the database
 * 
 * Requirements: 1.1, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4
 * 
 * @param request - Next.js request object
 * @returns JSON response with message ID or error
 */
export async function POST(request: NextRequest) {
  // Set CORS headers (Requirement 5.4)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Parse and validate JSON request body (Requirement 5.1)
    let body;
    try {
      body = await request.json();
    } catch (error) {
      // Invalid JSON format (Requirement 5.1, 5.2)
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
    const validation = validateCreateMessage(body);
    
    if (!validation.success) {
      // Return validation errors with 400 status (Requirement 5.2)
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

    // Call MessageService.create() (Requirements 1.4, 1.5)
    const message = await messageService.create(validation.data);

    // Return success response with message ID (Requirement 5.3)
    return NextResponse.json(
      {
        id: message.id,
        message: 'Message created successfully',
      },
      { status: 201, headers }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in POST /api/messages/create:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while creating the message',
        },
      },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/messages/create
 * Handle preflight CORS requests
 * 
 * Requirement: 5.4
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
