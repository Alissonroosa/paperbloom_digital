import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pool from '../db';
import { randomUUID } from 'crypto';

describe('Enhanced Message Schema', () => {
  let testIds: string[] = [];

  afterAll(async () => {
    // Clean up test data
    if (testIds.length > 0) {
      await pool.query(
        `DELETE FROM messages WHERE id = ANY($1)`,
        [testIds]
      );
    }
    await pool.end();
  });

  describe('New columns exist', () => {
    it('should have title column', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'title'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].data_type).toBe('character varying');
      expect(result.rows[0].character_maximum_length).toBe(100);
    });

    it('should have special_date column', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'special_date'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].data_type).toBe('date');
    });

    it('should have closing_message column', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'closing_message'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].data_type).toBe('character varying');
      expect(result.rows[0].character_maximum_length).toBe(200);
    });

    it('should have signature column', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'signature'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].data_type).toBe('character varying');
      expect(result.rows[0].character_maximum_length).toBe(50);
    });

    it('should have gallery_images column', async () => {
      const result = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'gallery_images'
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].data_type).toBe('ARRAY');
    });
  });

  describe('Indexes exist', () => {
    it('should have index on special_date', async () => {
      const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'messages' AND indexname = 'idx_messages_special_date'
      `);

      expect(result.rows).toHaveLength(1);
    });

    it('should have index on title', async () => {
      const result = await pool.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'messages' AND indexname = 'idx_messages_title'
      `);

      expect(result.rows).toHaveLength(1);
    });
  });

  describe('Data operations', () => {
    it('should insert message with all enhanced fields', async () => {
      const id = randomUUID();
      testIds.push(id);

      const result = await pool.query(`
        INSERT INTO messages (
          id, recipient_name, sender_name, message_text,
          title, special_date, closing_message, signature, gallery_images,
          status, view_count
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        id,
        'Test Recipient',
        'Test Sender',
        'Test Message',
        'Happy Birthday!',
        new Date('2024-12-25'),
        'With love',
        'Your friend',
        ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
        'pending',
        0
      ]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toBe('Happy Birthday!');
      expect(result.rows[0].special_date).toBeInstanceOf(Date);
      expect(result.rows[0].closing_message).toBe('With love');
      expect(result.rows[0].signature).toBe('Your friend');
      expect(result.rows[0].gallery_images).toEqual([
        'https://example.com/1.jpg',
        'https://example.com/2.jpg'
      ]);
    });

    it('should insert message with NULL enhanced fields', async () => {
      const id = randomUUID();
      testIds.push(id);

      const result = await pool.query(`
        INSERT INTO messages (
          id, recipient_name, sender_name, message_text,
          status, view_count
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        id,
        'Test Recipient 2',
        'Test Sender 2',
        'Test Message 2',
        'pending',
        0
      ]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toBeNull();
      expect(result.rows[0].special_date).toBeNull();
      expect(result.rows[0].closing_message).toBeNull();
      expect(result.rows[0].signature).toBeNull();
      expect(result.rows[0].gallery_images).toEqual([]);
    });

    it('should query messages with enhanced fields', async () => {
      const result = await pool.query(`
        SELECT * FROM messages WHERE id = ANY($1)
      `, [testIds]);

      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach(row => {
        expect(row).toHaveProperty('title');
        expect(row).toHaveProperty('special_date');
        expect(row).toHaveProperty('closing_message');
        expect(row).toHaveProperty('signature');
        expect(row).toHaveProperty('gallery_images');
      });
    });
  });
});
