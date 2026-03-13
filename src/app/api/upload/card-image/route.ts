import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/services/ImageService';
import { validateURLAccessibility } from '@/lib/utils';
import { validateEnv } from '@/lib/env';

/**
 * POST /api/upload/card-image
 * Uploads a single card image to R2 storage
 */
export async function POST(request: NextRequest) {
  // Validate environment variables first
  validateEnv();
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No image file provided',
          },
        },
        { status: 400, headers }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed',
          },
        },
        { status: 400, headers }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File size exceeds 5MB limit',
          },
        },
        { status: 400, headers }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2 using ImageService
    const url = await imageService.upload({
      buffer,
      mimeType: file.type,
      size: file.size,
    });

    // Validate URL accessibility
    const validation = await validateURLAccessibility(url, {
      maxRetries: 3,
      retryDelay: 500,
      timeout: 5000,
    });

    if (!validation.accessible) {
      console.warn('Warning: Uploaded image URL may not be immediately accessible', {
        url,
        error: validation.error,
        attempts: validation.attempts,
      });
    }

    return NextResponse.json(
      {
        url,
        message: 'Image uploaded successfully',
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error in POST /api/upload/card-image:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while uploading the image',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/upload/card-image
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
