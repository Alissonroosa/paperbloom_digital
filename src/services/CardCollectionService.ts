import pool from '../lib/db';
import { 
  CardCollection, 
  CardCollectionRow, 
  CreateCardCollectionInput, 
  rowToCardCollection,
  validateCreateCardCollection 
} from '../types/card';
import { randomUUID } from 'crypto';

/**
 * CardCollectionService
 * Handles all database operations for card collections
 * Requirements: 1.1, 1.2, 6.3, 6.4, 6.6
 */
export class CardCollectionService {
  /**
   * Create a new card collection in the database
   * Generates a unique UUID for the collection
   * Requirements: 1.1, 1.2
   * 
   * @param data - Card collection creation data
   * @returns Created card collection with generated ID
   * @throws Error if validation fails or database operation fails
   */
  async create(data: CreateCardCollectionInput): Promise<CardCollection> {
    // Validate input data
    const validation = validateCreateCardCollection(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const validatedData = validation.data;
    
    // Generate unique UUID for the collection (Requirement 1.2)
    const id = randomUUID();

    const query = `
      INSERT INTO card_collections (
        id,
        recipient_name,
        sender_name,
        contact_email,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id,
      validatedData.recipientName,
      validatedData.senderName,
      validatedData.contactEmail || null,
      'pending', // Default status
    ];

    try {
      const result = await pool.query<CardCollectionRow>(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create card collection');
      }

      // Convert database row to CardCollection entity
      return rowToCardCollection(result.rows[0]);
    } catch (error) {
      console.error('Error creating card collection:', error);
      throw new Error(`Failed to create card collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a card collection by its ID
   * Requirement: 1.2
   * 
   * @param id - Card collection UUID
   * @returns Card collection if found, null otherwise
   */
  async findById(id: string): Promise<CardCollection | null> {
    const query = `
      SELECT * FROM card_collections
      WHERE id = $1
    `;

    try {
      const result = await pool.query<CardCollectionRow>(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToCardCollection(result.rows[0]);
    } catch (error) {
      console.error('Error finding card collection by ID:', error);
      throw new Error(`Failed to find card collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a card collection by its slug
   * Requirement: 6.3
   * 
   * @param slug - Card collection slug
   * @returns Card collection if found, null otherwise
   */
  async findBySlug(slug: string): Promise<CardCollection | null> {
    const query = `
      SELECT * FROM card_collections
      WHERE slug = $1
    `;

    try {
      const result = await pool.query<CardCollectionRow>(query, [slug]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToCardCollection(result.rows[0]);
    } catch (error) {
      console.error('Error finding card collection by slug:', error);
      throw new Error(`Failed to find card collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update the status of a card collection
   * Used when payment is confirmed
   * Requirement: 6.6
   * 
   * @param id - Card collection UUID
   * @param status - New status ('paid' or 'pending')
   * @returns Updated card collection
   * @throws Error if card collection not found or update fails
   */
  async updateStatus(id: string, status: 'paid' | 'pending'): Promise<CardCollection> {
    const query = `
      UPDATE card_collections
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query<CardCollectionRow>(query, [status, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Card collection with ID ${id} not found`);
      }

      return rowToCardCollection(result.rows[0]);
    } catch (error) {
      console.error('Error updating card collection status:', error);
      throw new Error(`Failed to update card collection status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a card collection with partial data
   * 
   * @param id - Card collection UUID
   * @param data - Partial card collection data to update
   * @returns Updated card collection
   * @throws Error if card collection not found or update fails
   */
  async update(id: string, data: Partial<CardCollection>): Promise<CardCollection> {
    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.recipientName !== undefined) {
      updates.push(`recipient_name = $${paramIndex++}`);
      values.push(data.recipientName);
    }
    if (data.senderName !== undefined) {
      updates.push(`sender_name = $${paramIndex++}`);
      values.push(data.senderName);
    }
    if (data.contactEmail !== undefined) {
      updates.push(`contact_email = $${paramIndex++}`);
      values.push(data.contactEmail);
    }
    if (data.contactPhone !== undefined) {
      updates.push(`contact_phone = $${paramIndex++}`);
      values.push(data.contactPhone);
    }
    if (data.contactName !== undefined) {
      updates.push(`contact_name = $${paramIndex++}`);
      values.push(data.contactName);
    }
    if (data.introMessage !== undefined) {
      updates.push(`intro_message = $${paramIndex++}`);
      values.push(data.introMessage);
    }
    if (data.youtubeVideoId !== undefined) {
      updates.push(`youtube_video_id = $${paramIndex++}`);
      values.push(data.youtubeVideoId);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    // Always update the updated_at timestamp
    updates.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE card_collections
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      console.log('[CardCollectionService] Updating collection:', {
        id,
        data,
        query,
        values,
      });

      const result = await pool.query<CardCollectionRow>(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Card collection with ID ${id} not found`);
      }

      console.log('[CardCollectionService] Collection updated successfully:', result.rows[0]);

      return rowToCardCollection(result.rows[0]);
    } catch (error) {
      console.error('Error updating card collection:', error);
      throw new Error(`Failed to update card collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update card collection with QR code URL and slug
   * Called after successful payment and QR code generation
   * Requirements: 6.3, 6.4
   * 
   * @param id - Card collection UUID
   * @param qrCodeUrl - URL of the generated QR code
   * @param slug - Generated slug for the card collection
   * @returns Updated card collection
   * @throws Error if card collection not found or update fails
   */
  async updateQRCode(id: string, qrCodeUrl: string, slug: string): Promise<CardCollection> {
    const query = `
      UPDATE card_collections
      SET qr_code_url = $1, slug = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    try {
      const result = await pool.query<CardCollectionRow>(query, [qrCodeUrl, slug, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Card collection with ID ${id} not found`);
      }

      return rowToCardCollection(result.rows[0]);
    } catch (error) {
      console.error('Error updating card collection QR code:', error);
      throw new Error(`Failed to update card collection QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update card collection with Stripe session ID
   * Called when checkout session is created
   * 
   * @param id - Card collection UUID
   * @param stripeSessionId - Stripe checkout session ID
   * @returns Updated card collection
   * @throws Error if card collection not found or update fails
   */
  async updateStripeSession(id: string, stripeSessionId: string): Promise<CardCollection> {
    const query = `
      UPDATE card_collections
      SET stripe_session_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query<CardCollectionRow>(query, [stripeSessionId, id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Card collection with ID ${id} not found`);
      }

      return rowToCardCollection(result.rows[0]);
    } catch (error) {
      console.error('Error updating Stripe session:', error);
      throw new Error(`Failed to update Stripe session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a card collection by Stripe session ID
   * Used in webhook processing
   * 
   * @param stripeSessionId - Stripe checkout session ID
   * @returns Card collection if found, null otherwise
   */
  async findByStripeSessionId(stripeSessionId: string): Promise<CardCollection | null> {
    const query = `
      SELECT * FROM card_collections
      WHERE stripe_session_id = $1
    `;

    try {
      const result = await pool.query<CardCollectionRow>(query, [stripeSessionId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToCardCollection(result.rows[0]);
    } catch (error) {
      console.error('Error finding card collection by Stripe session ID:', error);
      throw new Error(`Failed to find card collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const cardCollectionService = new CardCollectionService();
