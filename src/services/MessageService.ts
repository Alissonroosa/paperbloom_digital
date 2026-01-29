import pool from '../lib/db';
import { 
  Message, 
  MessageRow, 
  CreateMessageInput, 
  rowToMessage,
  validateCreateMessage 
} from '../types/message';
import { randomUUID } from 'crypto';

/**
 * MessageService
 * Handles all database operations for messages
 * Requirements: 1.4, 1.5, 4.1, 4.5
 */
export class MessageService {
  /**
   * Create a new message in the database
   * Generates a unique UUID for the message
   * Requirements: 1.4, 1.5
   * 
   * @param data - Message creation data
   * @returns Created message with generated ID
   * @throws Error if validation fails or database operation fails
   */
  async create(data: CreateMessageInput): Promise<Message> {
    // Validate input data
    const validation = validateCreateMessage(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const validatedData = validation.data;
    
    // Generate unique UUID for the message (Requirement 1.4)
    const id = randomUUID();

    const query = `
      INSERT INTO messages (
        id,
        recipient_name,
        sender_name,
        message_text,
        image_url,
        youtube_url,
        title,
        special_date,
        closing_message,
        signature,
        gallery_images,
        contact_name,
        contact_email,
        contact_phone,
        background_color,
        theme,
        custom_emoji,
        music_start_time,
        show_time_counter,
        time_counter_label,
        status,
        view_count,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id,
      validatedData.recipientName,
      validatedData.senderName,
      validatedData.messageText,
      validatedData.imageUrl || null,
      validatedData.youtubeUrl || null,
      validatedData.title || null,
      validatedData.specialDate || null,
      validatedData.closingMessage || null,
      validatedData.signature || null,
      validatedData.galleryImages || [],
      validatedData.contactName || null,
      validatedData.contactEmail || null,
      validatedData.contactPhone || null,
      validatedData.backgroundColor || null,
      validatedData.theme || null,
      validatedData.customEmoji || null,
      validatedData.musicStartTime || 0,
      validatedData.showTimeCounter || false,
      validatedData.timeCounterLabel || null,
      'pending', // Default status
      0, // Default view count
    ];

    try {
      const result = await pool.query<MessageRow>(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create message');
      }

      // Convert database row to Message entity (Requirement 1.5)
      return rowToMessage(result.rows[0]);
    } catch (error) {
      console.error('Error creating message:', error);
      throw new Error(`Failed to create message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a message by its ID
   * Requirement: 1.5
   * 
   * @param id - Message UUID
   * @returns Message if found, null otherwise
   */
  async findById(id: string): Promise<Message | null> {
    const query = `
      SELECT * FROM messages
      WHERE id = $1
    `;

    try {
      const result = await pool.query<MessageRow>(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToMessage(result.rows[0]);
    } catch (error) {
      console.error('Error finding message by ID:', error);
      throw new Error(`Failed to find message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a message by its slug
   * Requirement: 4.1
   * 
   * @param slug - Message slug
   * @returns Message if found, null otherwise
   */
  async findBySlug(slug: string): Promise<Message | null> {
    const query = `
      SELECT * FROM messages
      WHERE slug = $1
    `;

    try {
      const result = await pool.query<MessageRow>(query, [slug]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToMessage(result.rows[0]);
    } catch (error) {
      console.error('Error finding message by slug:', error);
      throw new Error(`Failed to find message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update the status of a message
   * Used when payment is confirmed
   * Requirement: 2.2, 2.3
   * 
   * @param id - Message UUID
   * @param status - New status ('paid' or 'pending')
   * @returns Updated message
   * @throws Error if message not found or update fails
   */
  async updateStatus(id: string, status: 'paid' | 'pending'): Promise<Message> {
    const query = `
      UPDATE messages
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query<MessageRow>(query, [status, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Message with ID ${id} not found`);
      }

      return rowToMessage(result.rows[0]);
    } catch (error) {
      console.error('Error updating message status:', error);
      throw new Error(`Failed to update message status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update message with QR code URL and slug
   * Called after successful payment and QR code generation
   * Requirements: 3.1, 3.2, 3.3
   * 
   * @param id - Message UUID
   * @param qrCodeUrl - URL of the generated QR code
   * @param slug - Generated slug for the message
   * @returns Updated message
   * @throws Error if message not found or update fails
   */
  async updateQRCode(id: string, qrCodeUrl: string, slug: string): Promise<Message> {
    const query = `
      UPDATE messages
      SET qr_code_url = $1, slug = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    try {
      const result = await pool.query<MessageRow>(query, [qrCodeUrl, slug, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Message with ID ${id} not found`);
      }

      return rowToMessage(result.rows[0]);
    } catch (error) {
      console.error('Error updating message QR code:', error);
      throw new Error(`Failed to update message QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Increment the view count of a message
   * Called each time a message is accessed
   * Requirement: 4.5
   * 
   * @param id - Message UUID
   * @throws Error if message not found or update fails
   */
  async incrementViewCount(id: string): Promise<void> {
    const query = `
      UPDATE messages
      SET view_count = view_count + 1, updated_at = NOW()
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      
      if (result.rowCount === 0) {
        throw new Error(`Message with ID ${id} not found`);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
      throw new Error(`Failed to increment view count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update message with Stripe session ID
   * Called when checkout session is created
   * 
   * @param id - Message UUID
   * @param stripeSessionId - Stripe checkout session ID
   * @returns Updated message
   * @throws Error if message not found or update fails
   */
  async updateStripeSession(id: string, stripeSessionId: string): Promise<Message> {
    const query = `
      UPDATE messages
      SET stripe_session_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query<MessageRow>(query, [stripeSessionId, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Message with ID ${id} not found`);
      }

      return rowToMessage(result.rows[0]);
    } catch (error) {
      console.error('Error updating Stripe session:', error);
      throw new Error(`Failed to update Stripe session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a message by Stripe session ID
   * Used in webhook processing
   * 
   * @param stripeSessionId - Stripe checkout session ID
   * @returns Message if found, null otherwise
   */
  async findByStripeSessionId(stripeSessionId: string): Promise<Message | null> {
    const query = `
      SELECT * FROM messages
      WHERE stripe_session_id = $1
    `;

    try {
      const result = await pool.query<MessageRow>(query, [stripeSessionId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToMessage(result.rows[0]);
    } catch (error) {
      console.error('Error finding message by Stripe session ID:', error);
      throw new Error(`Failed to find message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const messageService = new MessageService();
