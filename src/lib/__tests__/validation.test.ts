/**
 * Tests for Enhanced Editor Form Validation
 * Requirements: 11.1, 11.2, 11.5, 11.6, 11.7
 */

import { describe, it, expect } from 'vitest';
import {
  validateEditorForm,
  validateCharacterLimit,
  validateRequired,
  validateYouTubeUrl,
  validateImageFormat,
  validateImageSize,
  validateImageFile,
  validateGalleryImages,
  validateSpecialDate,
  validateField,
  CHARACTER_LIMITS,
  IMAGE_CONSTRAINTS,
  type EditorFormData,
} from '../validation';

describe('validateCharacterLimit', () => {
  it('should return null for values within limit', () => {
    expect(validateCharacterLimit('Hello', 10, 'Field')).toBeNull();
    expect(validateCharacterLimit('', 10, 'Field')).toBeNull();
    expect(validateCharacterLimit(undefined, 10, 'Field')).toBeNull();
  });

  it('should return error for values exceeding limit', () => {
    const error = validateCharacterLimit('This is too long', 5, 'Field');
    expect(error).toBe('Field deve ter no máximo 5 caracteres');
  });

  it('should handle exact limit', () => {
    expect(validateCharacterLimit('12345', 5, 'Field')).toBeNull();
  });
});

describe('validateRequired', () => {
  it('should return null for non-empty values', () => {
    expect(validateRequired('value', 'Field')).toBeNull();
    expect(validateRequired('  value  ', 'Field')).toBeNull();
  });

  it('should return error for empty values', () => {
    expect(validateRequired('', 'Field')).toBe('Field é obrigatório');
    expect(validateRequired('   ', 'Field')).toBe('Field é obrigatório');
    expect(validateRequired(null, 'Field')).toBe('Field é obrigatório');
    expect(validateRequired(undefined, 'Field')).toBe('Field é obrigatório');
  });
});

describe('validateYouTubeUrl', () => {
  it('should return null for valid YouTube URLs', () => {
    expect(validateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(validateYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(validateYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBeNull();
    expect(validateYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBeNull();
    expect(validateYouTubeUrl('http://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  });

  it('should return null for empty URLs (optional field)', () => {
    expect(validateYouTubeUrl('')).toBeNull();
    expect(validateYouTubeUrl('   ')).toBeNull();
  });

  it('should return error for invalid YouTube URLs', () => {
    const error = validateYouTubeUrl('https://vimeo.com/123456');
    expect(error).toBe('Por favor, insira uma URL válida do YouTube');
    
    expect(validateYouTubeUrl('not a url')).toBe('Por favor, insira uma URL válida do YouTube');
    expect(validateYouTubeUrl('https://google.com')).toBe('Por favor, insira uma URL válida do YouTube');
  });
});

describe('validateImageFormat', () => {
  it('should return null for allowed image formats', () => {
    const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const pngFile = new File([''], 'test.png', { type: 'image/png' });
    const webpFile = new File([''], 'test.webp', { type: 'image/webp' });
    
    expect(validateImageFormat(jpegFile)).toBeNull();
    expect(validateImageFormat(pngFile)).toBeNull();
    expect(validateImageFormat(webpFile)).toBeNull();
  });

  it('should return error for disallowed formats', () => {
    const gifFile = new File([''], 'test.gif', { type: 'image/gif' });
    const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    
    expect(validateImageFormat(gifFile)).toBe('Formato não suportado. Use JPEG, PNG ou WebP');
    expect(validateImageFormat(pdfFile)).toBe('Formato não suportado. Use JPEG, PNG ou WebP');
  });
});

describe('validateImageSize', () => {
  it('should return null for files within size limit', () => {
    const smallFile = new File(['x'.repeat(1024)], 'small.jpg', { type: 'image/jpeg' });
    expect(validateImageSize(smallFile)).toBeNull();
  });

  it('should return error for files exceeding size limit', () => {
    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    expect(validateImageSize(largeFile)).toBe('A imagem deve ter no máximo 5MB');
  });

  it('should handle exact size limit', () => {
    const exactFile = new File(['x'.repeat(5 * 1024 * 1024)], 'exact.jpg', { type: 'image/jpeg' });
    expect(validateImageSize(exactFile)).toBeNull();
  });
});

describe('validateImageFile', () => {
  it('should return null for valid image files', () => {
    const validFile = new File(['x'.repeat(1024)], 'valid.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(validFile)).toBeNull();
  });

  it('should return null for null files', () => {
    expect(validateImageFile(null)).toBeNull();
  });

  it('should return format error for invalid format', () => {
    const invalidFile = new File(['x'.repeat(1024)], 'invalid.gif', { type: 'image/gif' });
    expect(validateImageFile(invalidFile)).toBe('Formato não suportado. Use JPEG, PNG ou WebP');
  });

  it('should return size error for oversized file', () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(largeFile)).toBe('A imagem deve ter no máximo 5MB');
  });
});

describe('validateGalleryImages', () => {
  it('should return null for valid gallery', () => {
    const file1 = new File(['x'.repeat(1024)], 'img1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['x'.repeat(1024)], 'img2.png', { type: 'image/png' });
    
    expect(validateGalleryImages([file1, file2, null])).toBeNull();
    expect(validateGalleryImages([file1, null, null])).toBeNull();
    expect(validateGalleryImages([null, null, null])).toBeNull();
    expect(validateGalleryImages(undefined)).toBeNull();
  });

  it('should return error for too many images', () => {
    const file1 = new File(['x'.repeat(1024)], 'img1.jpg', { type: 'image/jpeg' });
    const file2 = new File(['x'.repeat(1024)], 'img2.jpg', { type: 'image/jpeg' });
    const file3 = new File(['x'.repeat(1024)], 'img3.jpg', { type: 'image/jpeg' });
    const file4 = new File(['x'.repeat(1024)], 'img4.jpg', { type: 'image/jpeg' });
    
    expect(validateGalleryImages([file1, file2, file3, file4])).toBe('Máximo de 3 fotos na galeria');
  });

  it('should return error for invalid image in gallery', () => {
    const validFile = new File(['x'.repeat(1024)], 'valid.jpg', { type: 'image/jpeg' });
    const invalidFile = new File(['x'.repeat(1024)], 'invalid.gif', { type: 'image/gif' });
    
    const error = validateGalleryImages([validFile, invalidFile, null]);
    expect(error).toContain('Foto 2 da galeria');
    expect(error).toContain('Formato não suportado');
  });
});

describe('validateSpecialDate', () => {
  it('should return null for valid dates', () => {
    expect(validateSpecialDate(new Date('2024-01-01'))).toBeNull();
    expect(validateSpecialDate(new Date())).toBeNull();
  });

  it('should return null for null/undefined dates', () => {
    expect(validateSpecialDate(null)).toBeNull();
    expect(validateSpecialDate(undefined)).toBeNull();
  });

  it('should return error for invalid dates', () => {
    expect(validateSpecialDate(new Date('invalid'))).toBe('Data inválida');
  });
});

describe('validateEditorForm', () => {
  const validFormData: EditorFormData = {
    title: 'Test Title',
    specialDate: new Date('2024-01-01'),
    image: new File(['x'.repeat(1024)], 'test.jpg', { type: 'image/jpeg' }),
    galleryImages: [null, null, null, null, null, null, null],
    message: 'Test message',
    signature: 'Test signature',
    closing: 'Test closing',
    from: 'John',
    to: 'Jane',
    youtubeLink: '',
  };

  it('should validate a complete valid form', () => {
    const result = validateEditorForm(validFormData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should detect missing required fields', () => {
    const invalidData: EditorFormData = {
      ...validFormData,
      from: '',
      to: '',
      message: '',
    };
    
    const result = validateEditorForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.from).toBe('Seu nome é obrigatório');
    expect(result.errors.to).toBe('Nome do destinatário é obrigatório');
    expect(result.errors.message).toBe('Mensagem é obrigatório');
  });

  it('should detect character limit violations', () => {
    const invalidData: EditorFormData = {
      ...validFormData,
      title: 'x'.repeat(101),
      message: 'x'.repeat(501),
      closing: 'x'.repeat(201),
      signature: 'x'.repeat(51),
    };
    
    const result = validateEditorForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toContain('100 caracteres');
    expect(result.errors.message).toContain('500 caracteres');
    expect(result.errors.closing).toContain('200 caracteres');
    expect(result.errors.signature).toContain('50 caracteres');
  });

  it('should detect invalid YouTube URL', () => {
    const invalidData: EditorFormData = {
      ...validFormData,
      youtubeLink: 'https://vimeo.com/123456',
    };
    
    const result = validateEditorForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.youtubeLink).toBe('Por favor, insira uma URL válida do YouTube');
  });

  it('should detect invalid image format', () => {
    const invalidData: EditorFormData = {
      ...validFormData,
      image: new File(['x'.repeat(1024)], 'test.gif', { type: 'image/gif' }),
    };
    
    const result = validateEditorForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.image).toContain('Formato não suportado');
  });

  it('should detect oversized image', () => {
    const invalidData: EditorFormData = {
      ...validFormData,
      image: new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' }),
    };
    
    const result = validateEditorForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.image).toContain('5MB');
  });

  it('should detect too many gallery images', () => {
    const file = new File(['x'.repeat(1024)], 'test.jpg', { type: 'image/jpeg' });
    const invalidData: EditorFormData = {
      ...validFormData,
      galleryImages: [file, file, file, file],
    };
    
    const result = validateEditorForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.galleryImages).toContain('Máximo de 3 fotos');
  });

  it('should detect invalid special date', () => {
    const invalidData: EditorFormData = {
      ...validFormData,
      specialDate: new Date('invalid'),
    };
    
    const result = validateEditorForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.specialDate).toBe('Data inválida');
  });

  it('should allow optional fields to be empty', () => {
    const minimalData: EditorFormData = {
      image: null,
      galleryImages: [null, null, null, null, null, null, null],
      message: 'Test message',
      from: 'John',
      to: 'Jane',
      youtubeLink: '',
    };
    
    const result = validateEditorForm(minimalData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });
});

describe('validateField', () => {
  const sampleData: EditorFormData = {
    image: null,
    galleryImages: [null, null, null, null, null, null, null],
    message: 'Test',
    from: 'John',
    to: 'Jane',
    youtubeLink: '',
  };

  it('should validate individual fields correctly', () => {
    expect(validateField('title', 'Valid title', sampleData)).toBeNull();
    expect(validateField('title', 'x'.repeat(101), sampleData)).toContain('100 caracteres');
    
    expect(validateField('message', 'Valid message', sampleData)).toBeNull();
    expect(validateField('message', '', sampleData)).toBe('Mensagem é obrigatório');
    
    expect(validateField('youtubeLink', 'https://youtube.com/watch?v=test', sampleData)).toBeNull();
    expect(validateField('youtubeLink', 'https://vimeo.com/test', sampleData)).toContain('YouTube');
  });
});

describe('Constants', () => {
  it('should have correct character limits', () => {
    expect(CHARACTER_LIMITS.title).toBe(100);
    expect(CHARACTER_LIMITS.message).toBe(500);
    expect(CHARACTER_LIMITS.closing).toBe(200);
    expect(CHARACTER_LIMITS.signature).toBe(50);
    expect(CHARACTER_LIMITS.from).toBe(100);
    expect(CHARACTER_LIMITS.to).toBe(100);
  });

  it('should have correct image constraints', () => {
    expect(IMAGE_CONSTRAINTS.maxSize).toBe(5 * 1024 * 1024);
    expect(IMAGE_CONSTRAINTS.allowedFormats).toEqual(['image/jpeg', 'image/png', 'image/webp']);
    expect(IMAGE_CONSTRAINTS.maxGalleryImages).toBe(3);
  });
});
