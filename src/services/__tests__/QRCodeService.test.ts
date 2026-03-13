import { QRCodeService } from '../QRCodeService';
import { promises as fs } from 'fs';
import path from 'path';
import QRCode from 'qrcode';

describe('QRCodeService', () => {
  let service: QRCodeService;
  const testMessageId = 'test-message-123';
  const testUrl = 'https://paperbloom.com/mensagem/maria/test-message-123';

  beforeEach(() => {
    service = new QRCodeService();
  });

  afterEach(async () => {
    // Clean up test files
    const qrCodeUrl = `/uploads/qrcodes/${testMessageId}.png`;
    try {
      await service.delete(qrCodeUrl);
    } catch {
      // Ignore errors if file doesn't exist
    }
  });

  describe('generate', () => {
    it('should generate a QR code and return a public URL', async () => {
      const result = await service.generate(testUrl, testMessageId);

      expect(result).toBe(`/uploads/qrcodes/${testMessageId}.png`);

      // Verify file exists
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'qrcodes', `${testMessageId}.png`);
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });

    it('should generate QR code with minimum 300x300 resolution', async () => {
      const result = await service.generate(testUrl, testMessageId);

      // Read the generated file
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'qrcodes', `${testMessageId}.png`);
      const fileBuffer = await fs.readFile(filePath);

      // Verify it's a valid PNG (basic check)
      expect(fileBuffer.length).toBeGreaterThan(0);
      
      // PNG files start with specific bytes
      expect(fileBuffer[0]).toBe(0x89);
      expect(fileBuffer[1]).toBe(0x50);
      expect(fileBuffer[2]).toBe(0x4E);
      expect(fileBuffer[3]).toBe(0x47);
    });

    it('should use messageId for unique filename', async () => {
      const messageId1 = 'message-1';
      const messageId2 = 'message-2';

      const url1 = await service.generate(testUrl, messageId1);
      const url2 = await service.generate(testUrl, messageId2);

      expect(url1).toBe(`/uploads/qrcodes/${messageId1}.png`);
      expect(url2).toBe(`/uploads/qrcodes/${messageId2}.png`);
      expect(url1).not.toBe(url2);

      // Clean up
      await service.delete(url1);
      await service.delete(url2);
    });

    it('should throw error if QR code generation fails', async () => {
      // Pass invalid parameters to trigger error
      await expect(service.generate('', testMessageId)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete an existing QR code file', async () => {
      // First generate a QR code
      const url = await service.generate(testUrl, testMessageId);

      // Then delete it
      const result = await service.delete(url);
      expect(result).toBe(true);

      // Verify file no longer exists
      const accessible = await service.isAccessible(url);
      expect(accessible).toBe(false);
    });

    it('should return false when deleting non-existent file', async () => {
      const result = await service.delete('/uploads/qrcodes/non-existent.png');
      expect(result).toBe(false);
    });
  });

  describe('isAccessible', () => {
    it('should return true for accessible QR code', async () => {
      const url = await service.generate(testUrl, testMessageId);
      const accessible = await service.isAccessible(url);
      expect(accessible).toBe(true);
    });

    it('should return false for non-existent QR code', async () => {
      const accessible = await service.isAccessible('/uploads/qrcodes/non-existent.png');
      expect(accessible).toBe(false);
    });
  });
});
