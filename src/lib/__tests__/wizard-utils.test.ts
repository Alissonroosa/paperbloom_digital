import { describe, it, expect } from 'vitest';
import {
  generateSlugFromTitle,
  formatDateInPortuguese,
  validateImageFile,
  extractYouTubeVideoId,
  validateContrast,
  formatBrazilianPhone,
  isValidBrazilianPhone,
  isValidEmail,
} from '../wizard-utils';

describe('Wizard Utils', () => {
  describe('generateSlugFromTitle', () => {
    it('should convert title to lowercase slug', () => {
      expect(generateSlugFromTitle('Hello World')).toBe('hello-world');
    });

    it('should remove accents', () => {
      expect(generateSlugFromTitle('Olá Mundo')).toBe('ola-mundo');
      expect(generateSlugFromTitle('Café com Açúcar')).toBe('cafe-com-acucar');
    });

    it('should remove special characters', () => {
      expect(generateSlugFromTitle('Hello! World?')).toBe('hello-world');
      expect(generateSlugFromTitle('Test@#$%Title')).toBe('testtitle');
    });

    it('should replace spaces with hyphens', () => {
      expect(generateSlugFromTitle('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('should remove duplicate hyphens', () => {
      expect(generateSlugFromTitle('Test---Title')).toBe('test-title');
    });

    it('should limit length to 50 characters', () => {
      const longTitle = 'a'.repeat(100);
      const slug = generateSlugFromTitle(longTitle);
      expect(slug.length).toBeLessThanOrEqual(50);
    });

    it('should handle empty string', () => {
      expect(generateSlugFromTitle('')).toBe('');
    });
  });

  describe('formatDateInPortuguese', () => {
    it('should format date correctly', () => {
      const date = new Date(2024, 11, 25); // Month is 0-indexed
      const formatted = formatDateInPortuguese(date);
      expect(formatted).toMatch(/25 de Dezembro, 2024/);
    });

    it('should handle different months', () => {
      const date = new Date(2024, 0, 15); // Month is 0-indexed
      const formatted = formatDateInPortuguese(date);
      expect(formatted).toMatch(/15 de Janeiro, 2024/);
    });
  });

  describe('validateImageFile', () => {
    it('should accept valid JPEG file', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      const result = validateImageFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid PNG file', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      const result = validateImageFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid WebP file', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      const result = validateImageFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid file type', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      const result = validateImageFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Formato inválido');
    });

    it('should reject file larger than 5MB', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      const result = validateImageFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('muito grande');
    });
  });

  describe('extractYouTubeVideoId', () => {
    it('should extract ID from watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should handle URL with additional parameters', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLxxx';
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      expect(extractYouTubeVideoId('https://example.com')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(extractYouTubeVideoId('')).toBeNull();
    });
  });

  describe('validateContrast', () => {
    it('should validate good contrast for light theme', () => {
      const result = validateContrast('#FFFFFF', 'light');
      expect(result.isValid).toBe(true);
    });

    it('should validate good contrast for dark theme', () => {
      const result = validateContrast('#000000', 'dark');
      expect(result.isValid).toBe(true);
    });

    it('should reject poor contrast', () => {
      // Use a color that definitely has poor contrast with black text
      // #666666 has a contrast ratio of about 3.95:1 which is below 4.5:1
      const result = validateContrast('#666666', 'light');
      expect(result.isValid).toBe(false);
      expect(result.warning).toBeDefined();
    });

    it('should handle invalid color', () => {
      const result = validateContrast('invalid', 'light');
      expect(result.isValid).toBe(false);
      expect(result.warning).toContain('inválida');
    });
  });

  describe('formatBrazilianPhone', () => {
    it('should format 11-digit phone number', () => {
      expect(formatBrazilianPhone('11987654321')).toBe('(11) 98765-4321');
    });

    it('should format 10-digit phone number', () => {
      expect(formatBrazilianPhone('1187654321')).toBe('(11) 8765-4321');
    });

    it('should handle already formatted number', () => {
      expect(formatBrazilianPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
    });

    it('should return original for invalid length', () => {
      expect(formatBrazilianPhone('123')).toBe('123');
    });
  });

  describe('isValidBrazilianPhone', () => {
    it('should validate correct format with 11 digits', () => {
      expect(isValidBrazilianPhone('(11) 98765-4321')).toBe(true);
    });

    it('should validate correct format with 10 digits', () => {
      expect(isValidBrazilianPhone('(11) 8765-4321')).toBe(true);
    });

    it('should validate format without spaces', () => {
      expect(isValidBrazilianPhone('(11)98765-4321')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(isValidBrazilianPhone('11987654321')).toBe(false);
      expect(isValidBrazilianPhone('123456')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });
});
