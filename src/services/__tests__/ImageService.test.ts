import { ImageService } from '../ImageService';
import { promises as fs } from 'fs';
import path from 'path';

describe('ImageService', () => {
  let imageService: ImageService;

  beforeEach(() => {
    imageService = new ImageService();
  });

  describe('validateImageType', () => {
    it('should accept JPEG images', () => {
      expect(imageService.validateImageType('image/jpeg')).toBe(true);
    });

    it('should accept PNG images', () => {
      expect(imageService.validateImageType('image/png')).toBe(true);
    });

    it('should accept WebP images', () => {
      expect(imageService.validateImageType('image/webp')).toBe(true);
    });

    it('should reject invalid image types', () => {
      expect(imageService.validateImageType('image/gif')).toBe(false);
      expect(imageService.validateImageType('image/bmp')).toBe(false);
      expect(imageService.validateImageType('application/pdf')).toBe(false);
    });
  });

  describe('validateImageSize', () => {
    it('should accept images under 10MB for main images', () => {
      expect(imageService.validateImageSize(5 * 1024 * 1024, false)).toBe(true);
      expect(imageService.validateImageSize(10 * 1024 * 1024, false)).toBe(true);
    });

    it('should reject images over 10MB for main images', () => {
      expect(imageService.validateImageSize(11 * 1024 * 1024, false)).toBe(false);
      expect(imageService.validateImageSize(20 * 1024 * 1024, false)).toBe(false);
    });

    it('should accept images under 5MB for gallery images', () => {
      expect(imageService.validateImageSize(3 * 1024 * 1024, true)).toBe(true);
      expect(imageService.validateImageSize(5 * 1024 * 1024, true)).toBe(true);
    });

    it('should reject images over 5MB for gallery images', () => {
      expect(imageService.validateImageSize(6 * 1024 * 1024, true)).toBe(false);
      expect(imageService.validateImageSize(10 * 1024 * 1024, true)).toBe(false);
    });
  });

  describe('upload', () => {
    it('should reject invalid image types', async () => {
      const file = {
        buffer: Buffer.from('fake image data'),
        mimeType: 'image/gif',
        size: 1024,
      };

      await expect(imageService.upload(file)).rejects.toThrow('Invalid image type');
    });

    it('should reject images over size limit for main images', async () => {
      const file = {
        buffer: Buffer.from('fake image data'),
        mimeType: 'image/jpeg',
        size: 11 * 1024 * 1024,
      };

      await expect(imageService.upload(file, false)).rejects.toThrow('Image size exceeds maximum');
    });

    it('should reject images over 5MB for gallery images', async () => {
      const file = {
        buffer: Buffer.from('fake image data'),
        mimeType: 'image/jpeg',
        size: 6 * 1024 * 1024,
      };

      await expect(imageService.upload(file, true)).rejects.toThrow('Image size exceeds maximum allowed size of 5MB');
    });
  });

  describe('uploadMultiple', () => {
    it('should reject if any file has invalid type', async () => {
      const files = [
        {
          buffer: Buffer.from('fake image data 1'),
          mimeType: 'image/jpeg',
          size: 1024,
        },
        {
          buffer: Buffer.from('fake image data 2'),
          mimeType: 'image/gif',
          size: 1024,
        },
      ];

      await expect(imageService.uploadMultiple(files)).rejects.toThrow('Invalid image type for file 2');
    });

    it('should reject if any file exceeds 5MB', async () => {
      const files = [
        {
          buffer: Buffer.from('fake image data 1'),
          mimeType: 'image/jpeg',
          size: 3 * 1024 * 1024,
        },
        {
          buffer: Buffer.from('fake image data 2'),
          mimeType: 'image/png',
          size: 6 * 1024 * 1024,
        },
      ];

      await expect(imageService.uploadMultiple(files)).rejects.toThrow('Image 2 size exceeds maximum allowed size of 5MB');
    });

    it('should validate all files before uploading any', async () => {
      const files = [
        {
          buffer: Buffer.from('fake image data 1'),
          mimeType: 'image/jpeg',
          size: 1024,
        },
        {
          buffer: Buffer.from('fake image data 2'),
          mimeType: 'image/gif',
          size: 1024,
        },
        {
          buffer: Buffer.from('fake image data 3'),
          mimeType: 'image/png',
          size: 1024,
        },
      ];

      // Should fail on validation before any upload happens
      await expect(imageService.uploadMultiple(files)).rejects.toThrow('Invalid image type for file 2');
    });
  });
});
