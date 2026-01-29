import { z } from 'zod';

/**
 * YouTube URL validation regex
 * Supports formats: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
 * Also accepts additional query parameters like &list=, &start_radio=, etc.
 */
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+(\?[\w&=%-]*)?(&[\w&=%-]*)*$/;

/**
 * Zod schema for YouTube URL validation
 */
export const youtubeUrlSchema = z.string().regex(YOUTUBE_URL_REGEX, {
  message: 'Invalid YouTube URL format',
});

/**
 * Zod schema for creating a new message
 * Validates all required fields according to Requirements 1.1
 */
export const createMessageSchema = z.object({
  recipientName: z.string()
    .min(1, 'Recipient name is required')
    .max(100, 'Recipient name must be 100 characters or less')
    .trim(),
  senderName: z.string()
    .min(1, 'Sender name is required')
    .max(100, 'Sender name must be 100 characters or less')
    .trim(),
  messageText: z.string()
    .min(1, 'Message text is required')
    .max(500, 'Message text must be 500 characters or less')
    .trim(),
  imageUrl: z.string().min(1, 'Image URL cannot be empty').nullable().or(z.literal(null)).optional(),
  youtubeUrl: youtubeUrlSchema.nullable().or(z.literal(null)).optional(),
  title: z.string()
    .max(100, 'Title must be 100 characters or less')
    .nullable().or(z.literal(null))
    .optional(),
  specialDate: z.coerce.date().nullable().or(z.literal(null)).optional(),
  closingMessage: z.string()
    .max(200, 'Closing message must be 200 characters or less')
    .nullable().or(z.literal(null))
    .optional(),
  signature: z.string()
    .max(50, 'Signature must be 50 characters or less')
    .nullable().or(z.literal(null))
    .optional(),
  galleryImages: z.array(z.string().min(1, 'Gallery image URL cannot be empty'))
    .max(7, 'Maximum 7 gallery images allowed')
    .optional()
    .default([]),
  // Contact information fields
  contactName: z.string()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name must be 100 characters or less')
    .trim()
    .optional(),
  contactEmail: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be 255 characters or less')
    .trim()
    .optional(),
  contactPhone: z.string()
    .max(20, 'Phone must be 20 characters or less')
    .trim()
    .optional(),
  // Theme customization fields
  backgroundColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
    .optional()
    .nullable(),
  theme: z.enum(['gradient', 'bright', 'matte', 'pastel', 'neon', 'vintage'])
    .optional()
    .nullable(),
  customEmoji: z.string()
    .max(10, 'Emoji must be 10 characters or less')
    .optional()
    .nullable(),
  musicStartTime: z.number()
    .int()
    .min(0, 'Music start time must be positive')
    .optional()
    .nullable(),
  showTimeCounter: z.boolean()
    .optional()
    .nullable(),
  timeCounterLabel: z.string()
    .max(100, 'Time counter label must be 100 characters or less')
    .optional()
    .nullable(),
});

/**
 * Zod schema for the complete Message entity
 */
export const messageSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format' }),
  recipientName: z.string().min(1).max(100),
  senderName: z.string().min(1).max(100),
  messageText: z.string().min(1).max(500),
  imageUrl: z.string().min(1).nullable(),
  youtubeUrl: youtubeUrlSchema.nullable(),
  slug: z.string().nullable(),
  qrCodeUrl: z.string().min(1).nullable(),
  status: z.enum(['pending', 'paid']),
  stripeSessionId: z.string().nullable(),
  viewCount: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string().max(100).nullable(),
  specialDate: z.date().nullable(),
  closingMessage: z.string().max(200).nullable(),
  signature: z.string().max(50).nullable(),
  galleryImages: z.array(z.string().min(1)).default([]),
  contactName: z.string().max(100).nullable(),
  contactEmail: z.string().email().max(255).nullable(),
  contactPhone: z.string().max(20).nullable(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
  theme: z.enum(['gradient', 'bright', 'matte', 'pastel', 'neon', 'vintage']).nullable(),
  customEmoji: z.string().max(10).nullable(),
  musicStartTime: z.number().int().min(0).nullable(),
  showTimeCounter: z.boolean().nullable(),
  timeCounterLabel: z.string().max(100).nullable(),
});

/**
 * Zod schema for updating message status
 */
export const updateMessageStatusSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format' }),
  status: z.enum(['pending', 'paid']),
});

/**
 * Zod schema for updating message with QR code and slug
 */
export const updateMessageQRCodeSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format' }),
  qrCodeUrl: z.string().url({ message: 'Invalid QR code URL' }),
  slug: z.string().min(1),
});

/**
 * Type inference from Zod schemas
 */
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageStatusInput = z.infer<typeof updateMessageStatusSchema>;
export type UpdateMessageQRCodeInput = z.infer<typeof updateMessageQRCodeSchema>;

/**
 * Message Entity
 * Represents a personalized message in the Paper Bloom Digital system
 */
export interface Message {
  id: string;                      // UUID
  recipientName: string;           // Name of the recipient (1-100 characters)
  senderName: string;              // Name of the sender (1-100 characters)
  messageText: string;             // The message text (1-500 characters)
  imageUrl: string | null;         // URL of the uploaded image (optional)
  youtubeUrl: string | null;       // YouTube video URL (optional)
  slug: string | null;             // Unique URL slug (generated after payment)
  qrCodeUrl: string | null;        // URL of the QR code (generated after payment)
  status: 'pending' | 'paid';      // Payment status
  stripeSessionId: string | null;  // Stripe checkout session ID
  viewCount: number;               // Number of times viewed
  createdAt: Date;                 // Creation timestamp
  updatedAt: Date;                 // Last update timestamp
  title: string | null;            // Message title (optional, max 100 characters)
  specialDate: Date | null;        // Special occasion date (optional)
  closingMessage: string | null;   // Closing message text (optional, max 200 characters)
  signature: string | null;        // Custom signature (optional, max 50 characters)
  galleryImages: string[];         // Array of gallery image URLs (max 7)
  contactName: string | null;      // Contact name for email delivery (optional, max 100 characters)
  contactEmail: string | null;     // Contact email for notifications (optional, max 255 characters)
  contactPhone: string | null;     // Contact phone number (optional, max 20 characters)
  backgroundColor: string | null;  // Background color in hex format (optional)
  theme: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage' | null; // Visual theme style (optional)
  customEmoji: string | null;      // Custom emoji for falling animation (optional, max 10 characters)
  musicStartTime: number | null;   // YouTube music start time in seconds (optional)
  showTimeCounter: boolean | null; // Whether to show time counter (optional)
  timeCounterLabel: string | null; // Label for time counter (optional, max 100 characters)
}

/**
 * Database row representation (snake_case from PostgreSQL)
 */
export interface MessageRow {
  id: string;
  recipient_name: string;
  sender_name: string;
  message_text: string;
  image_url: string | null;
  youtube_url: string | null;
  slug: string | null;
  qr_code_url: string | null;
  status: 'pending' | 'paid';
  stripe_session_id: string | null;
  view_count: number;
  created_at: Date;
  updated_at: Date;
  title: string | null;
  special_date: Date | null;
  closing_message: string | null;
  signature: string | null;
  gallery_images: string[];
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  background_color: string | null;
  theme: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage' | null;
  custom_emoji: string | null;
  music_start_time: number | null;
  show_time_counter: boolean | null;
  time_counter_label: string | null;
}

/**
 * Convert database row to Message entity
 */
export function rowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    recipientName: row.recipient_name,
    senderName: row.sender_name,
    messageText: row.message_text,
    imageUrl: row.image_url,
    youtubeUrl: row.youtube_url,
    slug: row.slug,
    qrCodeUrl: row.qr_code_url,
    status: row.status,
    stripeSessionId: row.stripe_session_id,
    viewCount: row.view_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title,
    specialDate: row.special_date,
    closingMessage: row.closing_message,
    signature: row.signature,
    galleryImages: row.gallery_images || [],
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    backgroundColor: row.background_color,
    theme: row.theme,
    customEmoji: row.custom_emoji,
    musicStartTime: row.music_start_time,
    showTimeCounter: row.show_time_counter,
    timeCounterLabel: row.time_counter_label,
  };
}

/**
 * Validation Functions
 */

/**
 * Validates message creation data
 * @param data - The data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateCreateMessage(data: unknown) {
  return createMessageSchema.safeParse(data);
}

/**
 * Validates a complete message entity
 * @param data - The message data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateMessage(data: unknown) {
  return messageSchema.safeParse(data);
}

/**
 * Validates YouTube URL format
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidYouTubeUrl(url: string): boolean {
  return youtubeUrlSchema.safeParse(url).success;
}

/**
 * Validates required fields for message creation
 * @param data - The data to check
 * @returns Object with validation results for each required field
 */
export function validateRequiredFields(data: Partial<CreateMessageInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.recipientName || data.recipientName.trim().length === 0) {
    errors.recipientName = 'Recipient name is required';
  }

  if (!data.senderName || data.senderName.trim().length === 0) {
    errors.senderName = 'Sender name is required';
  }

  if (!data.messageText || data.messageText.trim().length === 0) {
    errors.messageText = 'Message text is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format Zod validation errors into a user-friendly format
 * @param error - Zod validation error
 * @returns Formatted error object
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  });

  return formatted;
}
