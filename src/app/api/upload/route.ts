import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/services/ImageService';
import { validateURLAccessibility } from '@/lib/utils';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * POST /api/upload
 * Generic image upload endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400, headers }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400, headers }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const url = await imageService.upload({
      buffer,
      mimeType: file.type,
      size: buffer.length,
    });

    // Validate URL accessibility
    const validation = await validateURLAccessibility(url, {
      maxRetries: 2,
      retryDelay: 500,
      timeout: 3000,
    });

    if (!validation.accessible) {
      console.warn('Warning: Uploaded image URL may not be immediately accessible', {
        url,
        error: validation.error,
      });
    }

    return NextResponse.json(
      { url, message: 'Image uploaded successfully' },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error in POST /api/upload:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/upload
 * Handle preflight CORS requests
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}
