/**
 * Wizard Utility Functions
 * Helper functions for wizard operations
 */

/**
 * Generate URL slug from title
 * Converts title to lowercase, removes accents and special characters
 * @param title - The page title
 * @returns URL-safe slug
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .substring(0, 50); // Limit length
}

/**
 * Check slug availability
 * @param slug - The slug to check
 * @returns Promise with availability status and optional suggestion
 */
export async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean; suggestion?: string }> {
  try {
    const response = await fetch(`/api/messages/check-slug?slug=${encodeURIComponent(slug)}`);
    
    if (!response.ok) {
      throw new Error('Failed to check slug availability');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Slug availability check error:', error);
    return { available: false };
  }
}

/**
 * Format date in Portuguese
 * @param date - The date to format
 * @returns Formatted date string (DD de MMMM, YYYY)
 */
export function formatDateInPortuguese(date: Date): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month}, ${year}`;
}

/**
 * Validate image file
 * @param file - The file to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato inválido. Use JPEG, PNG ou WebP.',
    };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 5MB.',
    };
  }
  
  return { isValid: true };
}

/**
 * Extract YouTube video ID from URL
 * Supports various YouTube URL formats
 * @param url - YouTube URL
 * @returns Video ID or null if invalid
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Regular expression to match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @returns Contrast ratio
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const l1 = calculateLuminance(rgb1);
  const l2 = calculateLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Validate contrast between background and text
 * @param backgroundColor - Background color (hex)
 * @param theme - Theme type
 * @returns Validation result
 */
export function validateContrast(
  backgroundColor: string,
  theme: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage'
): { isValid: boolean; warning?: string } {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) {
    return { isValid: false, warning: 'Cor inválida' };
  }
  
  const luminance = calculateLuminance(rgb);
  
  // Determine if background is dark based on luminance
  const isDarkBackground = luminance < 0.5;
  const textColor = isDarkBackground ? { r: 255, g: 255, b: 255 } : { r: 31, g: 41, b: 55 };
  const textLuminance = calculateLuminance(textColor);
  
  const contrastRatio = (Math.max(luminance, textLuminance) + 0.05) / 
                        (Math.min(luminance, textLuminance) + 0.05);
  
  // WCAG AA requires 4.5:1 for normal text
  if (contrastRatio < 4.5) {
    return {
      isValid: false,
      warning: `Contraste insuficiente (${contrastRatio.toFixed(2)}:1). Recomendamos escolher ${
        isDarkBackground ? 'uma cor mais escura' : 'uma cor mais clara'
      }.`,
    };
  }
  
  return { isValid: true };
}

/**
 * Convert hex color to RGB
 * @param hex - Hex color string
 * @returns RGB object or null
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Calculate relative luminance
 * @param rgb - RGB color object
 * @returns Luminance value
 */
function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Format Brazilian phone number
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatBrazilianPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
}

/**
 * Validate Brazilian phone number format
 * @param phone - Phone number string
 * @returns True if valid
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const regex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
  return regex.test(phone);
}

/**
 * Validate email format
 * @param email - Email string
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
