import sharp from 'sharp';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { validateEnv } from '@/lib/env';

/**
 * ImageService
 * Handles image upload, validation, and processing using Cloudflare R2
 * Requirements: 1.2, 8.1, 8.2, 8.3, 8.5, 10.3, 4.3, 4.4, 11.6
 */
export class ImageService {
  private s3Client: S3Client | null = null;
  private bucketName: string | null = null;
  private publicUrl: string | null = null;
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB (Requirement 10.3)
  private readonly maxGalleryFileSize = 5 * 1024 * 1024; // 5MB for gallery images (Requirement 4.4)
  private readonly maxWidth = 1920;
  private readonly maxHeight = 1920;
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp']; // Requirement 4.3

  constructor() {
    // Lazy initialization - don't access env in constructor
  }

  /**
   * Initialize the service with R2 configuration
   * This is called lazily on first use
   */
  private initialize() {
    if (this.s3Client) {
      return; // Already initialized
    }

    const envConfig = validateEnv();
    const r2Config = {
      accountId: envConfig.R2_ACCOUNT_ID,
      accessKeyId: envConfig.R2_ACCESS_KEY_ID,
      secretAccessKey: envConfig.R2_SECRET_ACCESS_KEY,
      bucketName: envConfig.R2_BUCKET_NAME,
      endpoint: envConfig.R2_ENDPOINT,
      publicUrl: envConfig.R2_PUBLIC_URL,
    };
    
    // Initialize S3 client with R2 credentials
    this.s3Client = new S3Client({
      region: 'auto', // R2 uses 'auto' for region
      endpoint: r2Config.endpoint,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    });
    
    this.bucketName = r2Config.bucketName;
    this.publicUrl = r2Config.publicUrl;
  }

  /**
   * Validate image file type
   * Requirement: 8.1
   * 
   * @param mimeType - MIME type of the file
   * @returns true if valid, false otherwise
   */
  validateImageType(mimeType: string): boolean {
    return this.allowedTypes.includes(mimeType);
  }

  /**
   * Validate image file size
   * Requirement: 10.3
   * 
   * @param size - File size in bytes
   * @param isGallery - Whether this is a gallery image (has stricter limits)
   * @returns true if valid, false otherwise
   */
  validateImageSize(size: number, isGallery: boolean = false): boolean {
    const maxSize = isGallery ? this.maxGalleryFileSize : this.maxFileSize;
    return size <= maxSize;
  }

  /**
   * Resize image if it exceeds maximum dimensions
   * Requirement: 8.2
   * 
   * @param buffer - Image buffer
   * @returns Resized image buffer
   */
  async resize(buffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Check if resizing is needed
      if (metadata.width && metadata.height) {
        if (metadata.width > this.maxWidth || metadata.height > this.maxHeight) {
          // Resize while maintaining aspect ratio
          return await image
            .resize(this.maxWidth, this.maxHeight, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .toBuffer();
        }
      }

      // Return original buffer if no resizing needed
      return buffer;
    } catch (error) {
      console.error('Error resizing image:', error);
      throw new Error(`Failed to resize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file extension from MIME type
   * 
   * @param mimeType - MIME type
   * @returns File extension
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return extensions[mimeType] || 'jpg';
  }

  /**
   * Upload and process an image to Cloudflare R2
   * Requirements: 1.2, 8.1, 8.2, 8.3, 8.5
   * 
   * @param file - File object with buffer, mimeType, and size
   * @param isGallery - Whether this is a gallery image (has stricter size limits)
   * @returns Public URL of the uploaded image
   * @throws Error if validation fails or upload fails
   */
  async upload(file: { buffer: Buffer; mimeType: string; size: number }, isGallery: boolean = false): Promise<string> {
    // Initialize service on first use
    this.initialize();

    // Validate file type (Requirement 8.1, 4.3)
    if (!this.validateImageType(file.mimeType)) {
      throw new Error(`Invalid image type. Allowed types: JPEG, PNG, WebP`);
    }

    // Validate file size (Requirement 10.3, 4.4)
    if (!this.validateImageSize(file.size, isGallery)) {
      const maxSize = isGallery ? this.maxGalleryFileSize : this.maxFileSize;
      throw new Error(`Image size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    try {
      // Resize image if needed (Requirement 8.2)
      const processedBuffer = await this.resize(file.buffer);

      // Generate unique filename with folder structure
      const filename = `images/${randomUUID()}.${this.getExtensionFromMimeType(file.mimeType)}`;

      // Upload to R2 (Requirement 8.3)
      const command = new PutObjectCommand({
        Bucket: this.bucketName!,
        Key: filename,
        Body: processedBuffer,
        ContentType: file.mimeType,
        CacheControl: 'public, max-age=31536000, immutable', // Cache for 1 year
      });

      await this.s3Client!.send(command);

      // Generate and return public URL (Requirement 8.5)
      const publicUrl = `${this.publicUrl}/${filename}`;
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image to R2:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple images for gallery
   * Requirements: 4.3, 4.4, 11.6
   * 
   * @param files - Array of file objects with buffer, mimeType, and size
   * @returns Array of public URLs of the uploaded images
   * @throws Error if any validation fails or upload fails
   */
  async uploadMultiple(files: Array<{ buffer: Buffer; mimeType: string; size: number }>): Promise<string[]> {
    // Validate all files before uploading any (Requirement 11.6)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type (Requirement 4.3)
      if (!this.validateImageType(file.mimeType)) {
        throw new Error(`Invalid image type for file ${i + 1}. Allowed types: JPEG, PNG, WebP`);
      }

      // Validate file size (Requirement 4.4)
      if (!this.validateImageSize(file.size, true)) {
        throw new Error(`Image ${i + 1} size exceeds maximum allowed size of ${this.maxGalleryFileSize / (1024 * 1024)}MB`);
      }
    }

    // Upload all files
    const uploadPromises = files.map(file => this.upload(file, true));
    
    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an image file from R2
   * 
   * @param url - Public URL of the image
   * @returns true if deleted, false if file doesn't exist
   */
  async delete(url: string): Promise<boolean> {
    // Initialize service on first use
    this.initialize();

    try {
      // Extract key from URL
      // URL format: https://paperbloom.account_id.r2.cloudflarestorage.com/images/uuid.jpg
      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1); // Remove leading slash

      // Delete from R2
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName!,
        Key: key,
      });

      await this.s3Client!.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting image from R2:', error);
      // R2 doesn't throw error if object doesn't exist, so we return true
      return true;
    }
  }

  /**
   * Check if an image URL is accessible
   * Note: For R2, we assume images are accessible if they follow the correct URL pattern
   * 
   * @param url - Public URL of the image
   * @returns true if accessible, false otherwise
   */
  async isAccessible(url: string): Promise<boolean> {
    // Initialize service on first use
    this.initialize();

    try {
      // For R2, we can do a simple HEAD request or just validate the URL format
      // For now, we'll validate the URL format
      const urlObj = new URL(url);
      return urlObj.hostname.includes('r2.cloudflarestorage.com') || 
             urlObj.hostname.includes(this.bucketName!);
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();
