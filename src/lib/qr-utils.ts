import { promises as fs } from 'fs';
import path from 'path';

/**
 * Load a QR code image as a base64 data URL.
 * Supports both R2 public URLs (https://...) and legacy local paths (/uploads/...).
 *
 * @param qrCodeUrl - R2 public URL or local path (e.g. /uploads/qrcodes/uuid.png)
 * @returns base64 data URL string (data:image/png;base64,...)
 */
export async function loadQRCodeAsDataUrl(qrCodeUrl: string): Promise<string> {
  if (qrCodeUrl.startsWith('http://') || qrCodeUrl.startsWith('https://')) {
    // Fetch from R2 or any remote URL
    const response = await fetch(qrCodeUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch QR code from ${qrCodeUrl}: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }

  // Legacy: read from local filesystem
  const filePath = path.join(process.cwd(), 'public', qrCodeUrl);
  const buffer = await fs.readFile(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}
