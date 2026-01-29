/**
 * Enhanced Editor Form Validation
 * Requirements: 11.1, 11.2, 11.5, 11.6, 11.7
 * 
 * Provides comprehensive validation for the message editor form including:
 * - Character limit validation for title, closing, signature
 * - YouTube URL format validation
 * - Image file format and size validation
 * - Required field validation
 * - Field-specific error messages
 */

import { isValidYouTubeUrl } from '@/types/message';

/**
 * Editor form data structure
 */
export interface EditorFormData {
  title?: string;
  specialDate?: Date | null;
  image: File | null;
  galleryImages?: (File | null)[];
  message: string;
  signature?: string;
  closing?: string;
  from: string;
  to: string;
  youtubeLink: string;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Character limits for text fields
 */
export const CHARACTER_LIMITS = {
  title: 100,
  message: 500,
  closing: 200,
  signature: 50,
  from: 100,
  to: 100,
} as const;

/**
 * Image validation constraints
 */
export const IMAGE_CONSTRAINTS = {
  maxSize: 5 * 1024 * 1024, // 5MB in bytes
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp'] as const,
  maxGalleryImages: 7,
};

/**
 * Validate character limit for a text field
 * Requirement: 11.7
 * 
 * @param value - The text value to validate
 * @param limit - Maximum character limit
 * @param fieldName - Name of the field for error message
 * @returns Error message if invalid, null if valid
 */
export function validateCharacterLimit(
  value: string | undefined,
  limit: number,
  fieldName: string
): string | null {
  if (!value) return null;
  
  if (value.length > limit) {
    return `${fieldName} deve ter no máximo ${limit} caracteres`;
  }
  
  return null;
}

/**
 * Validate required field
 * Requirement: 11.1
 * 
 * @param value - The value to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message if invalid, null if valid
 */
export function validateRequired(
  value: string | undefined | null,
  fieldName: string
): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} é obrigatório`;
  }
  
  return null;
}

/**
 * Validate YouTube URL format
 * Requirement: 11.5
 * 
 * @param url - The YouTube URL to validate
 * @returns Error message if invalid, null if valid
 */
export function validateYouTubeUrl(url: string): string | null {
  // Empty URL is valid (optional field)
  if (!url || url.trim().length === 0) {
    return null;
  }
  
  if (!isValidYouTubeUrl(url)) {
    return 'Por favor, insira uma URL válida do YouTube';
  }
  
  return null;
}

/**
 * Validate image file format
 * Requirement: 11.6
 * 
 * @param file - The image file to validate
 * @returns Error message if invalid, null if valid
 */
export function validateImageFormat(file: File): string | null {
  const allowedFormats = IMAGE_CONSTRAINTS.allowedFormats as readonly string[];
  if (!allowedFormats.includes(file.type)) {
    return 'Formato não suportado. Use JPEG, PNG ou WebP';
  }
  
  return null;
}

/**
 * Validate image file size
 * Requirement: 11.6
 * 
 * @param file - The image file to validate
 * @returns Error message if invalid, null if valid
 */
export function validateImageSize(file: File): string | null {
  if (file.size > IMAGE_CONSTRAINTS.maxSize) {
    const maxSizeMB = IMAGE_CONSTRAINTS.maxSize / (1024 * 1024);
    return `A imagem deve ter no máximo ${maxSizeMB}MB`;
  }
  
  return null;
}

/**
 * Validate image file (format and size)
 * Requirement: 11.6
 * 
 * @param file - The image file to validate
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(file: File | null): string | null {
  if (!file) return null;
  
  // Validate format first
  const formatError = validateImageFormat(file);
  if (formatError) return formatError;
  
  // Then validate size
  const sizeError = validateImageSize(file);
  if (sizeError) return sizeError;
  
  return null;
}

/**
 * Validate gallery images
 * Requirement: 11.6
 * 
 * @param images - Array of gallery image files
 * @returns Error message if invalid, null if valid
 */
export function validateGalleryImages(
  images: (File | null)[] | undefined
): string | null {
  if (!images) return null;
  
  const validImages = images.filter((img): img is File => img !== null);
  
  if (validImages.length > IMAGE_CONSTRAINTS.maxGalleryImages) {
    return `Máximo de ${IMAGE_CONSTRAINTS.maxGalleryImages} fotos na galeria`;
  }
  
  // Validate each image
  for (let i = 0; i < validImages.length; i++) {
    const error = validateImageFile(validImages[i]);
    if (error) {
      return `Foto ${i + 1} da galeria: ${error}`;
    }
  }
  
  return null;
}

/**
 * Validate special date
 * Requirement: 11.1
 * 
 * @param date - The date to validate
 * @returns Error message if invalid, null if valid
 */
export function validateSpecialDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }
  
  return null;
}

/**
 * Comprehensive editor form validation
 * Requirements: 11.1, 11.2, 11.5, 11.6, 11.7
 * 
 * Validates all fields in the editor form and returns detailed error messages
 * for each invalid field.
 * 
 * @param data - The editor form data to validate
 * @returns Validation result with isValid flag and field-specific errors
 */
export function validateEditorForm(data: EditorFormData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Required field validation (Requirement 11.1)
  const toError = validateRequired(data.to, 'Nome do destinatário');
  if (toError) errors.to = toError;
  
  const fromError = validateRequired(data.from, 'Seu nome');
  if (fromError) errors.from = fromError;
  
  const messageError = validateRequired(data.message, 'Mensagem');
  if (messageError) errors.message = messageError;
  
  // Character limit validation (Requirement 11.7)
  const titleLimitError = validateCharacterLimit(
    data.title,
    CHARACTER_LIMITS.title,
    'Título'
  );
  if (titleLimitError) errors.title = titleLimitError;
  
  const messageLimitError = validateCharacterLimit(
    data.message,
    CHARACTER_LIMITS.message,
    'Mensagem'
  );
  if (messageLimitError) errors.message = messageLimitError;
  
  const closingLimitError = validateCharacterLimit(
    data.closing,
    CHARACTER_LIMITS.closing,
    'Mensagem de fechamento'
  );
  if (closingLimitError) errors.closing = closingLimitError;
  
  const signatureLimitError = validateCharacterLimit(
    data.signature,
    CHARACTER_LIMITS.signature,
    'Assinatura'
  );
  if (signatureLimitError) errors.signature = signatureLimitError;
  
  const fromLimitError = validateCharacterLimit(
    data.from,
    CHARACTER_LIMITS.from,
    'Seu nome'
  );
  if (fromLimitError) errors.from = fromLimitError;
  
  const toLimitError = validateCharacterLimit(
    data.to,
    CHARACTER_LIMITS.to,
    'Nome do destinatário'
  );
  if (toLimitError) errors.to = toLimitError;
  
  // YouTube URL validation (Requirement 11.5)
  const youtubeError = validateYouTubeUrl(data.youtubeLink);
  if (youtubeError) errors.youtubeLink = youtubeError;
  
  // Image file validation (Requirement 11.6)
  const imageError = validateImageFile(data.image);
  if (imageError) errors.image = imageError;
  
  // Gallery images validation (Requirement 11.6)
  const galleryError = validateGalleryImages(data.galleryImages);
  if (galleryError) errors.galleryImages = galleryError;
  
  // Special date validation (Requirement 11.1)
  const dateError = validateSpecialDate(data.specialDate);
  if (dateError) errors.specialDate = dateError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate a single field
 * Requirement: 11.2
 * 
 * Useful for real-time validation as the user types
 * 
 * @param fieldName - Name of the field to validate
 * @param value - Value of the field
 * @param data - Complete form data (needed for context)
 * @returns Error message if invalid, null if valid
 */
export function validateField(
  fieldName: keyof EditorFormData,
  value: any,
  data: EditorFormData
): string | null {
  switch (fieldName) {
    case 'title':
      return validateCharacterLimit(value, CHARACTER_LIMITS.title, 'Título');
    
    case 'message':
      const requiredError = validateRequired(value, 'Mensagem');
      if (requiredError) return requiredError;
      return validateCharacterLimit(value, CHARACTER_LIMITS.message, 'Mensagem');
    
    case 'closing':
      return validateCharacterLimit(value, CHARACTER_LIMITS.closing, 'Mensagem de fechamento');
    
    case 'signature':
      return validateCharacterLimit(value, CHARACTER_LIMITS.signature, 'Assinatura');
    
    case 'from':
      const fromRequiredError = validateRequired(value, 'Seu nome');
      if (fromRequiredError) return fromRequiredError;
      return validateCharacterLimit(value, CHARACTER_LIMITS.from, 'Seu nome');
    
    case 'to':
      const toRequiredError = validateRequired(value, 'Nome do destinatário');
      if (toRequiredError) return toRequiredError;
      return validateCharacterLimit(value, CHARACTER_LIMITS.to, 'Nome do destinatário');
    
    case 'youtubeLink':
      return validateYouTubeUrl(value);
    
    case 'image':
      return validateImageFile(value);
    
    case 'galleryImages':
      return validateGalleryImages(value);
    
    case 'specialDate':
      return validateSpecialDate(value);
    
    default:
      return null;
  }
}
