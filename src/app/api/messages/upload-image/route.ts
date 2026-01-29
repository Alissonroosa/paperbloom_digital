import { NextRequest, NextResponse } from 'next/server';
import { imageService } from '@/services/ImageService';
import { validateURLAccessibility } from '@/lib/utils';
import { validateEnv } from '@/lib/env';

/**
 * POST /api/messages/upload-image
 * Handles single or multiple image uploads for messages
 * Supports both main image upload and gallery uploads
 * 
 * Requirements: 1.2, 5.5, 8.1, 8.4, 8.5, 4.1, 4.3, 4.4
 * 
 * @param request - Next.js request object with multipart/form-data
 * @returns JSON response with image URL(s) or error
 */
export async function POST(request: NextRequest) {
  // Validate environment variables first
  validateEnv();
  
  // Set CORS headers (Requirement 5.4)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Parse multipart/form-data request (Requirement 5.5)
    const formData = await request.formData();
    
    // Check if this is a multiple upload request (gallery)
    const images = formData.getAll('images');
    const singleImage = formData.get('image');

    // Handle multiple image upload (gallery) - Requirement 4.1
    if (images.length > 0) {
      // Validate maximum 7 gallery images (Requirement 4.1)
      if (images.length > 7) {
        return NextResponse.json(
          {
            error: {
              code: 'TOO_MANY_FILES',
              message: 'Maximum 7 gallery images allowed',
            },
          },
          { status: 400, headers }
        );
      }

      // Validate all files are File objects
      const files: File[] = [];
      for (const image of images) {
        if (!(image instanceof File)) {
          return NextResponse.json(
            {
              error: {
                code: 'INVALID_FILE',
                message: 'Invalid file format in the request',
              },
            },
            { status: 400, headers }
          );
        }
        files.push(image);
      }

      // Convert Files to Buffer array
      const fileDataArray = await Promise.all(
        files.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          return {
            buffer: Buffer.from(arrayBuffer),
            mimeType: file.type,
            size: file.size,
          };
        })
      );

      // Call ImageService.uploadMultiple() (Requirements 4.3, 4.4)
      const imageUrls = await imageService.uploadMultiple(fileDataArray);

      // Validate URL accessibility for all images
      const validationPromises = imageUrls.map(url =>
        validateURLAccessibility(url, {
          maxRetries: 3,
          retryDelay: 500,
          timeout: 5000,
        })
      );

      const validations = await Promise.all(validationPromises);
      validations.forEach((validation, index) => {
        if (!validation.accessible) {
          console.warn('Warning: Uploaded image URL may not be immediately accessible', {
            url: imageUrls[index],
            error: validation.error,
            attempts: validation.attempts,
          });
        }
      });

      // Return array of image URLs
      return NextResponse.json(
        {
          urls: imageUrls,
          message: `${imageUrls.length} images uploaded successfully`,
        },
        { status: 200, headers }
      );
    }

    // Handle single image upload (backward compatibility)
    if (!singleImage) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_FILE',
            message: 'No image file provided in the request',
          },
        },
        { status: 400, headers }
      );
    }

    // Validate that the file is a File object
    if (!(singleImage instanceof File)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_FILE',
            message: 'Invalid file format in the request',
          },
        },
        { status: 400, headers }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await singleImage.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare file object for ImageService
    const fileData = {
      buffer,
      mimeType: singleImage.type,
      size: singleImage.size,
    };

    // Call ImageService.upload() (Requirements 1.2, 8.1, 8.2, 8.3, 8.5)
    const imageUrl = await imageService.upload(fileData);

    // Validate URL accessibility (Requirement 6.5)
    const urlValidation = await validateURLAccessibility(imageUrl, {
      maxRetries: 3,
      retryDelay: 500,
      timeout: 5000,
    });

    if (!urlValidation.accessible) {
      console.warn('Warning: Uploaded image URL may not be immediately accessible', {
        url: imageUrl,
        error: urlValidation.error,
        attempts: urlValidation.attempts,
      });
    }

    // Return image URL (Requirement 8.5)
    return NextResponse.json(
      {
        url: imageUrl,
        message: 'Image uploaded successfully',
      },
      { status: 200, headers }
    );
  } catch (error) {
    // Handle upload errors with descriptive messages (Requirement 8.4)
    console.error('Error in POST /api/messages/upload-image:', error);

    // Check if it's a validation error from ImageService
    if (error instanceof Error) {
      // ImageService throws specific error messages for validation failures
      if (error.message.includes('Invalid image type')) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_IMAGE_TYPE',
              message: error.message,
            },
          },
          { status: 400, headers }
        );
      }

      if (error.message.includes('exceeds maximum')) {
        return NextResponse.json(
          {
            error: {
              code: 'FILE_TOO_LARGE',
              message: error.message,
            },
          },
          { status: 400, headers }
        );
      }

      if (error.message.includes('Failed to resize') || error.message.includes('Failed to upload')) {
        return NextResponse.json(
          {
            error: {
              code: 'UPLOAD_FAILED',
              message: error.message,
            },
          },
          { status: 500, headers }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: {
          code: 'UPLOAD_ERROR',
          message: 'An unexpected error occurred while uploading the image',
        },
      },
      { status: 500, headers }
    );
  }
}

/**
 * OPTIONS /api/messages/upload-image
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
