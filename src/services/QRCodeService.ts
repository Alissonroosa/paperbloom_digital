import QRCode from 'qrcode';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * QRCodeService
 * Handles QR code generation for message URLs
 * Requirements: 3.2, 3.3, 9.1, 9.2, 9.4, 9.5
 */
export class QRCodeService {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'uploads', 'qrcodes');
  private readonly minResolution = 300; // Minimum 300x300 pixels (Requirement 9.1)

  constructor() {
    this.ensureUploadDirectory();
  }

  /**
   * Ensure the upload directory exists
   * Creates the directory if it doesn't exist
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating QR code upload directory:', error);
    }
  }

  /**
   * Generate a QR code for a message URL
   * Requirements: 3.2, 3.3, 9.1, 9.2, 9.4, 9.5
   * 
   * @param url - Complete URL to encode in the QR code
   * @param messageId - UUID of the message (used for unique filename)
   * @returns Public URL of the generated QR code image
   * @throws Error if QR code generation or saving fails
   * 
   * @example
   * generate("https://paperbloom.com/mensagem/maria/123", "123e4567-e89b-12d3-a456-426614174000")
   * // returns "/uploads/qrcodes/123e4567-e89b-12d3-a456-426614174000.png"
   */
  async generate(url: string, messageId: string): Promise<string> {
    try {
      // Ensure directory exists
      await this.ensureUploadDirectory();

      // Generate unique filename using messageId (Requirement 9.5)
      const filename = `${messageId}.png`;
      const filePath = path.join(this.uploadDir, filename);

      // Generate QR code with minimum resolution (Requirements 9.1, 9.2)
      await QRCode.toFile(filePath, url, {
        width: this.minResolution,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });

      // Generate and return public URL (Requirement 9.4)
      const publicUrl = `/uploads/qrcodes/${filename}`;
      
      return publicUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a QR code file
   * 
   * @param url - Public URL of the QR code
   * @returns true if deleted, false if file doesn't exist
   */
  async delete(url: string): Promise<boolean> {
    try {
      // Extract filename from URL
      const filename = path.basename(url);
      const filePath = path.join(this.uploadDir, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return false; // File doesn't exist
      }

      // Delete file
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw new Error(`Failed to delete QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a QR code URL is accessible
   * 
   * @param url - Public URL of the QR code
   * @returns true if accessible, false otherwise
   */
  async isAccessible(url: string): Promise<boolean> {
    try {
      const filename = path.basename(url);
      const filePath = path.join(this.uploadDir, filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const qrCodeService = new QRCodeService();
