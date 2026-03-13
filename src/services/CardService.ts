import pool from '../lib/db';
import { 
  Card, 
  CardRow, 
  CreateCardInput, 
  UpdateCardInput,
  CardTemplate,
  CARD_TEMPLATES,
  rowToCard,
  validateCreateCard,
  validateUpdateCard
} from '../types/card';
import { randomUUID } from 'crypto';

/**
 * CardService
 * Handles all database operations for individual cards
 * Requirements: 1.1, 1.3, 1.4, 1.5, 3.2, 4.1, 4.2
 */
export class CardService {
  /**
   * Create a single card in the database
   * Requirements: 1.3, 1.4, 1.5
   * 
   * @param data - Card creation data
   * @returns Created card with generated ID
   * @throws Error if validation fails or database operation fails
   */
  async create(data: CreateCardInput): Promise<Card> {
    // Validate input data
    const validation = validateCreateCard(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const validatedData = validation.data;
    
    // Generate unique UUID for the card
    const id = randomUUID();

    const query = `
      INSERT INTO cards (
        id,
        collection_id,
        "order",
        title,
        message_text,
        image_url,
        youtube_url,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      id,
      validatedData.collectionId,
      validatedData.order,
      validatedData.title,
      validatedData.messageText,
      validatedData.imageUrl || null,
      validatedData.youtubeUrl || null,
      'unopened', // Default status (Requirement 4.1)
    ];

    try {
      const result = await pool.query<CardRow>(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create card');
      }

      // Convert database row to Card entity
      return rowToCard(result.rows[0]);
    } catch (error) {
      console.error('Error creating card:', error);
      throw new Error(`Failed to create card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create 12 cards at once using templates
   * Used when creating a new card collection
   * Requirements: 1.1, 1.3, 2.1, 2.2, 2.4
   * 
   * @param collectionId - UUID of the card collection
   * @param templates - Array of card templates (defaults to CARD_TEMPLATES)
   * @returns Array of created cards
   * @throws Error if creation fails
   */
  async createBulk(collectionId: string, templates: CardTemplate[] = CARD_TEMPLATES): Promise<Card[]> {
    // Validate that we have exactly 12 templates
    if (templates.length !== 12) {
      throw new Error('Must provide exactly 12 card templates');
    }

    // Validate collection ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(collectionId)) {
      throw new Error('Invalid collection ID format');
    }

    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');

      const cards: Card[] = [];

      // Create all 12 cards
      for (const template of templates) {
        const id = randomUUID();
        
        const query = `
          INSERT INTO cards (
            id,
            collection_id,
            "order",
            title,
            message_text,
            image_url,
            youtube_url,
            status,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `;

        const values = [
          id,
          collectionId,
          template.order,
          template.title,
          template.defaultMessage,
          null, // No image by default
          null, // No YouTube URL by default
          'unopened', // Default status (Requirement 4.1)
        ];

        const result = await client.query<CardRow>(query, values);
        
        if (result.rows.length === 0) {
          throw new Error(`Failed to create card ${template.order}`);
        }

        cards.push(rowToCard(result.rows[0]));
      }

      // Commit transaction
      await client.query('COMMIT');

      // Sort cards by order to ensure correct sequence (Requirement 2.4)
      return cards.sort((a, b) => a.order - b.order);
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error creating bulk cards:', error);
      throw new Error(`Failed to create bulk cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  /**
   * Find a card by its ID
   * Requirement: 1.4
   * 
   * @param id - Card UUID
   * @returns Card if found, null otherwise
   */
  async findById(id: string): Promise<Card | null> {
    const query = `
      SELECT * FROM cards
      WHERE id = $1
    `;

    try {
      const result = await pool.query<CardRow>(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return rowToCard(result.rows[0]);
    } catch (error) {
      console.error('Error finding card by ID:', error);
      throw new Error(`Failed to find card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find all cards belonging to a collection
   * Returns cards sorted by order
   * Requirement: 1.3
   * 
   * @param collectionId - Card collection UUID
   * @returns Array of cards sorted by order
   */
  async findByCollectionId(collectionId: string): Promise<Card[]> {
    const query = `
      SELECT * FROM cards
      WHERE collection_id = $1
      ORDER BY "order" ASC
    `;

    try {
      const result = await pool.query<CardRow>(query, [collectionId]);
      
      return result.rows.map(row => rowToCard(row));
    } catch (error) {
      console.error('Error finding cards by collection ID:', error);
      throw new Error(`Failed to find cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update card content
   * Only allows updating title, message, image, and YouTube URL
   * Requirements: 1.4, 1.5, 1.6, 1.7, 3.2
   * 
   * @param id - Card UUID
   * @param data - Update data
   * @returns Updated card
   * @throws Error if card not found or update fails
   */
  async update(id: string, data: UpdateCardInput): Promise<Card> {
    // Validate input data
    const validation = validateUpdateCard(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.error.issues)}`);
    }

    const validatedData = validation.data;

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (validatedData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(validatedData.title);
    }

    if (validatedData.messageText !== undefined) {
      updates.push(`message_text = $${paramIndex++}`);
      values.push(validatedData.messageText);
    }

    if (validatedData.imageUrl !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      values.push(validatedData.imageUrl);
    }

    if (validatedData.youtubeUrl !== undefined) {
      updates.push(`youtube_url = $${paramIndex++}`);
      values.push(validatedData.youtubeUrl);
    }

    // If no fields to update, return current card
    if (updates.length === 0) {
      const card = await this.findById(id);
      if (!card) {
        throw new Error(`Card with ID ${id} not found`);
      }
      return card;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    // Add card ID as the last parameter
    values.push(id);

    const query = `
      UPDATE cards
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      console.log('[CardService] Updating card:', {
        id,
        data: validatedData,
        query,
        values,
      });

      const result = await pool.query<CardRow>(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Card with ID ${id} not found`);
      }

      console.log('[CardService] Card updated successfully:', result.rows[0]);

      return rowToCard(result.rows[0]);
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error(`Failed to update card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark a card as opened
   * Records the timestamp of the first opening
   * Requirements: 4.2, 4.4
   * 
   * @param id - Card UUID
   * @returns Updated card with opened status
   * @throws Error if card not found, already opened, or update fails
   */
  async markAsOpened(id: string): Promise<Card> {
    // First check if card can be opened
    const canOpen = await this.canOpen(id);
    if (!canOpen) {
      throw new Error('Card has already been opened');
    }

    const query = `
      UPDATE cards
      SET status = 'opened', opened_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND status = 'unopened'
      RETURNING *
    `;

    try {
      const result = await pool.query<CardRow>(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error(`Card with ID ${id} not found or already opened`);
      }

      return rowToCard(result.rows[0]);
    } catch (error) {
      console.error('Error marking card as opened:', error);
      throw new Error(`Failed to mark card as opened: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a card can be opened
   * A card can only be opened if its status is 'unopened'
   * Requirements: 4.1, 4.3
   * 
   * @param id - Card UUID
   * @returns true if card can be opened, false otherwise
   */
  async canOpen(id: string): Promise<boolean> {
    const query = `
      SELECT status FROM cards
      WHERE id = $1
    `;

    try {
      const result = await pool.query<{ status: 'unopened' | 'opened' }>(query, [id]);
      
      if (result.rows.length === 0) {
        return false;
      }

      return result.rows[0].status === 'unopened';
    } catch (error) {
      console.error('Error checking if card can be opened:', error);
      throw new Error(`Failed to check card status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const cardService = new CardService();
