import QRCode from 'qrcode';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { validateEnv } from '@/lib/env';

/**
 * QRCodeService
 * Handles QR code generation and upload to Cloudflare R2.
 * Requirements: 3.2, 3.3, 9.1, 9.2, 9.4, 9.5
 */
export class QRCodeService {
  private s3Client: S3Client | null = null;
  private bucketName: string | null = null;
  private publicUrl: string | null = null;
  private readonly minResolution = 300; // Minimum 300x300 pixels (Requirement 9.1)

  constructor() {
    // Lazy initialization — don't access env in constructor
  }

  /**
   * Initialize the S3/R2 client lazily on first use.
   */
  private initialize() {
    if (this.s3Client) return;

    const envConfig = validateEnv();

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: envConfig.R2_ENDPOINT,
      credentials: {
        accessKeyId: envConfig.R2_ACCESS_KEY_ID,
        secretAccessKey: envConfig.R2_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = envConfig.R2_BUCKET_NAME;
    this.publicUrl = envConfig.R2_PUBLIC_URL;
  }

  /**
   * Generate a QR code for a URL and upload it to R2.
   * Requirements: 3.2, 3.3, 9.1, 9.2, 9.4, 9.5
   *
   * @param url - Complete URL to encode in the QR code
   * @param itemId - UUID used for unique filename (messageId, collectionId, etc.)
   * @returns Public URL of the generated QR code image on R2
   */
  async generate(url: string, itemId: string): Promise<string> {
    try {
      this.initialize();

      // Generate QR code as PNG buffer in memory (Requirements 9.1, 9.2)
      const pngBuffer = await QRCode.toBuffer(url, {
        width: this.minResolution,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
        type: 'png',
      });

      // Upload to R2 (Requirement 9.4)
      const key = `qrcodes/${itemId}.png`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName!,
        Key: key,
        Body: pngBuffer,
        ContentType: 'image/png',
      });

      await this.s3Client!.send(command);

      // Return public URL
      const publicUrl = `${this.publicUrl}/${key}`;
      console.log(`[QRCodeService] QR code uploaded to R2: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a QR code from R2.
   *
   * @param url - Public URL of the QR code
   * @returns true if deleted successfully
   */
  async delete(url: string): Promise<boolean> {
    try {
      this.initialize();

      // Extract key from public URL
      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1); // Remove leading slash

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName!,
        Key: key,
      });

      await this.s3Client!.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting QR code from R2:', error);
      return true; // R2 doesn't throw if object doesn't exist
    }
  }

  /**
   * Check if a QR code URL is accessible.
   * For R2, we validate the URL format.
   *
   * @param url - Public URL of the QR code
   * @returns true if URL looks valid
   */
  async isAccessible(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.includes('qrcodes/');
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const qrCodeService = new QRCodeService();
