/**
 * SlugService
 * Handles slug generation for message URLs
 * Requirements: 3.1, 3.5
 */
export class SlugService {
  /**
   * Normalize a string to be URL-safe
   * Converts special characters, accents, and spaces to URL-safe equivalents
   * Requirement: 3.5
   * 
   * @param input - String to normalize
   * @returns URL-safe string containing only a-z, 0-9, and hyphens
   * 
   * @example
   * normalizeString("José María") // returns "jose-maria"
   * normalizeString("Hello World!") // returns "hello-world"
   * normalizeString("Café & Bar") // returns "cafe-bar"
   */
  normalizeString(input: string): string {
    return input
      // Convert to lowercase
      .toLowerCase()
      // Normalize unicode characters (decompose accented characters)
      .normalize('NFD')
      // Remove diacritical marks (accents)
      .replace(/[\u0300-\u036f]/g, '')
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove all non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Replace multiple consecutive hyphens with a single hyphen
      .replace(/-+/g, '-')
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate a slug for a message URL
   * Format: /mensagem/{normalized_recipient_name}/{message_id}
   * Requirement: 3.1
   * 
   * @param recipientName - Name of the message recipient
   * @param messageId - UUID of the message
   * @param prefix - URL prefix (default: 'mensagem', can be 'c' for card collections)
   * @returns Slug in the format /{prefix}/{name}/{id}
   * 
   * @example
   * generateSlug("Maria Silva", "123e4567-e89b-12d3-a456-426614174000")
   * // returns "/mensagem/maria-silva/123e4567-e89b-12d3-a456-426614174000"
   * 
   * generateSlug("Maria Silva", "123e4567-e89b-12d3-a456-426614174000", "c")
   * // returns "/c/maria-silva/123e4567-e89b-12d3-a456-426614174000"
   */
  generateSlug(recipientName: string, messageId: string, prefix: string = 'mensagem'): string {
    const normalizedName = this.normalizeString(recipientName);
    return `/${prefix}/${normalizedName}/${messageId}`;
  }
}

// Export singleton instance
export const slugService = new SlugService();
