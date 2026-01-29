/**
 * Database Constraints Test
 * Tests that database constraints and indexes are properly enforced
 * Requirements: 6.3
 */

import pool, { closePool } from '../db';
import { v4 as uuidv4 } from 'uuid';

describe('Database Constraints and Indexes', () => {
  afterAll(async () => {
    await closePool();
  });

  describe('UNIQUE constraint on slug', () => {
    it('should prevent duplicate slugs', async () => {
      const slug = `test-slug-${uuidv4()}`;
      
      // Insert first message with slug
      await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text, slug, status)
         VALUES ($1, $2, $3, $4, $5)`,
        ['Recipient 1', 'Sender 1', 'Message 1', slug, 'paid']
      );

      // Try to insert second message with same slug
      await expect(
        pool.query(
          `INSERT INTO messages (recipient_name, sender_name, message_text, slug, status)
           VALUES ($1, $2, $3, $4, $5)`,
          ['Recipient 2', 'Sender 2', 'Message 2', slug, 'paid']
        )
      ).rejects.toThrow();
    });

    it('should allow multiple NULL slugs', async () => {
      // Insert first message with NULL slug
      const result1 = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text, slug, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['Recipient 1', 'Sender 1', 'Message 1', null, 'pending']
      );

      // Insert second message with NULL slug (should succeed)
      const result2 = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text, slug, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['Recipient 2', 'Sender 2', 'Message 2', null, 'pending']
      );

      expect(result1.rows[0].id).toBeDefined();
      expect(result2.rows[0].id).toBeDefined();
      expect(result1.rows[0].id).not.toBe(result2.rows[0].id);
    });
  });

  describe('NOT NULL constraints', () => {
    it('should reject NULL recipient_name', async () => {
      await expect(
        pool.query(
          `INSERT INTO messages (recipient_name, sender_name, message_text)
           VALUES ($1, $2, $3)`,
          [null, 'Sender', 'Message']
        )
      ).rejects.toThrow();
    });

    it('should reject NULL sender_name', async () => {
      await expect(
        pool.query(
          `INSERT INTO messages (recipient_name, sender_name, message_text)
           VALUES ($1, $2, $3)`,
          ['Recipient', null, 'Message']
        )
      ).rejects.toThrow();
    });

    it('should reject NULL message_text', async () => {
      await expect(
        pool.query(
          `INSERT INTO messages (recipient_name, sender_name, message_text)
           VALUES ($1, $2, $3)`,
          ['Recipient', 'Sender', null]
        )
      ).rejects.toThrow();
    });

    it('should allow NULL for optional fields', async () => {
      const result = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text, image_url, youtube_url, qr_code_url, stripe_session_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        ['Recipient', 'Sender', 'Message', null, null, null, null]
      );

      expect(result.rows[0].id).toBeDefined();
    });
  });

  describe('CHECK constraint on status', () => {
    it('should accept valid status "pending"', async () => {
      const result = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, status`,
        ['Recipient', 'Sender', 'Message', 'pending']
      );

      expect(result.rows[0].status).toBe('pending');
    });

    it('should accept valid status "paid"', async () => {
      const result = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id, status`,
        ['Recipient', 'Sender', 'Message', 'paid']
      );

      expect(result.rows[0].status).toBe('paid');
    });

    it('should reject invalid status', async () => {
      await expect(
        pool.query(
          `INSERT INTO messages (recipient_name, sender_name, message_text, status)
           VALUES ($1, $2, $3, $4)`,
          ['Recipient', 'Sender', 'Message', 'invalid_status']
        )
      ).rejects.toThrow();
    });
  });

  describe('Indexes', () => {
    it('should have index on slug column', async () => {
      const result = await pool.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'messages' AND indexname = 'idx_messages_slug'
      `);

      expect(result.rows.length).toBe(1);
    });

    it('should have index on status column', async () => {
      const result = await pool.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'messages' AND indexname = 'idx_messages_status'
      `);

      expect(result.rows.length).toBe(1);
    });

    it('should have index on stripe_session_id column', async () => {
      const result = await pool.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'messages' AND indexname = 'idx_messages_stripe_session_id'
      `);

      expect(result.rows.length).toBe(1);
    });
  });

  describe('Default values', () => {
    it('should set default status to "pending"', async () => {
      const result = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text)
         VALUES ($1, $2, $3)
         RETURNING status`,
        ['Recipient', 'Sender', 'Message']
      );

      expect(result.rows[0].status).toBe('pending');
    });

    it('should set default view_count to 0', async () => {
      const result = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text)
         VALUES ($1, $2, $3)
         RETURNING view_count`,
        ['Recipient', 'Sender', 'Message']
      );

      expect(result.rows[0].view_count).toBe(0);
    });

    it('should auto-generate UUID for id', async () => {
      const result = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['Recipient', 'Sender', 'Message']
      );

      expect(result.rows[0].id).toBeDefined();
      expect(typeof result.rows[0].id).toBe('string');
      // UUID v4 format check
      expect(result.rows[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should auto-set created_at timestamp', async () => {
      const result = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text)
         VALUES ($1, $2, $3)
         RETURNING created_at`,
        ['Recipient', 'Sender', 'Message']
      );

      expect(result.rows[0].created_at).toBeDefined();
      expect(result.rows[0].created_at).toBeInstanceOf(Date);
    });

    it('should auto-set updated_at timestamp', async () => {
      const result = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text)
         VALUES ($1, $2, $3)
         RETURNING updated_at`,
        ['Recipient', 'Sender', 'Message']
      );

      expect(result.rows[0].updated_at).toBeDefined();
      expect(result.rows[0].updated_at).toBeInstanceOf(Date);
    });
  });

  describe('Updated_at trigger', () => {
    it('should automatically update updated_at on row update', async () => {
      // Insert a message
      const insertResult = await pool.query(
        `INSERT INTO messages (recipient_name, sender_name, message_text)
         VALUES ($1, $2, $3)
         RETURNING id, updated_at`,
        ['Recipient', 'Sender', 'Message']
      );

      const messageId = insertResult.rows[0].id;
      const originalUpdatedAt = insertResult.rows[0].updated_at;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update the message
      const updateResult = await pool.query(
        `UPDATE messages SET message_text = $1 WHERE id = $2 RETURNING updated_at`,
        ['Updated message', messageId]
      );

      const newUpdatedAt = updateResult.rows[0].updated_at;

      expect(newUpdatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Primary key constraint', () => {
    it('should enforce unique id', async () => {
      const customId = uuidv4();
      
      // Insert first message with custom id
      await pool.query(
        `INSERT INTO messages (id, recipient_name, sender_name, message_text)
         VALUES ($1, $2, $3, $4)`,
        [customId, 'Recipient 1', 'Sender 1', 'Message 1']
      );

      // Try to insert second message with same id
      await expect(
        pool.query(
          `INSERT INTO messages (id, recipient_name, sender_name, message_text)
           VALUES ($1, $2, $3, $4)`,
          [customId, 'Recipient 2', 'Sender 2', 'Message 2']
        )
      ).rejects.toThrow();
    });
  });
});
