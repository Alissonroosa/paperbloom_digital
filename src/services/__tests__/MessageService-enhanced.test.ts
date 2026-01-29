import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MessageService } from '../MessageService';
import pool from '../../lib/db';
import { CreateMessageInput } from '../../types/message';

describe('MessageService - Enhanced Fields', () => {
  const messageService = new MessageService();
  let testMessageId: string;

  afterAll(async () => {
    // Clean up test data
    if (testMessageId) {
      await pool.query('DELETE FROM messages WHERE id = $1', [testMessageId]);
    }
    await pool.end();
  });

  describe('create with enhanced fields', () => {
    it('should create a message with all enhanced fields', async () => {
      const messageData: CreateMessageInput = {
        recipientName: 'Test Recipient',
        senderName: 'Test Sender',
        messageText: 'Test message with enhanced fields',
        imageUrl: 'https://example.com/image.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Happy Birthday!',
        specialDate: new Date('2024-12-25'),
        closingMessage: 'With all my love',
        signature: 'Your friend',
        galleryImages: [
          'https://example.com/gallery1.jpg',
          'https://example.com/gallery2.jpg',
          'https://example.com/gallery3.jpg'
        ],
      };

      const message = await messageService.create(messageData);
      testMessageId = message.id;

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.recipientName).toBe('Test Recipient');
      expect(message.senderName).toBe('Test Sender');
      expect(message.messageText).toBe('Test message with enhanced fields');
      expect(message.title).toBe('Happy Birthday!');
      expect(message.specialDate).toBeInstanceOf(Date);
      expect(message.closingMessage).toBe('With all my love');
      expect(message.signature).toBe('Your friend');
      expect(message.galleryImages).toHaveLength(3); // Test uses 3 images
      expect(message.galleryImages).toEqual([
        'https://example.com/gallery1.jpg',
        'https://example.com/gallery2.jpg',
        'https://example.com/gallery3.jpg'
      ]);
      expect(message.status).toBe('pending');
    });

    it('should create a message with optional enhanced fields as null', async () => {
      const messageData: CreateMessageInput = {
        recipientName: 'Test Recipient 2',
        senderName: 'Test Sender 2',
        messageText: 'Test message without enhanced fields',
      };

      const message = await messageService.create(messageData);
      
      // Clean up
      await pool.query('DELETE FROM messages WHERE id = $1', [message.id]);

      expect(message).toBeDefined();
      expect(message.title).toBeNull();
      expect(message.specialDate).toBeNull();
      expect(message.closingMessage).toBeNull();
      expect(message.signature).toBeNull();
      expect(message.galleryImages).toEqual([]);
    });

    it('should retrieve message with enhanced fields by ID', async () => {
      const message = await messageService.findById(testMessageId);

      expect(message).toBeDefined();
      expect(message?.title).toBe('Happy Birthday!');
      expect(message?.specialDate).toBeInstanceOf(Date);
      expect(message?.closingMessage).toBe('With all my love');
      expect(message?.signature).toBe('Your friend');
      expect(message?.galleryImages).toHaveLength(3); // Test uses 3 images
    });
  });

  describe('validation', () => {
    it('should reject title longer than 100 characters', async () => {
      const messageData: CreateMessageInput = {
        recipientName: 'Test',
        senderName: 'Test',
        messageText: 'Test',
        title: 'a'.repeat(101),
      };

      await expect(messageService.create(messageData)).rejects.toThrow();
    });

    it('should reject closing message longer than 200 characters', async () => {
      const messageData: CreateMessageInput = {
        recipientName: 'Test',
        senderName: 'Test',
        messageText: 'Test',
        closingMessage: 'a'.repeat(201),
      };

      await expect(messageService.create(messageData)).rejects.toThrow();
    });

    it('should reject signature longer than 50 characters', async () => {
      const messageData: CreateMessageInput = {
        recipientName: 'Test',
        senderName: 'Test',
        messageText: 'Test',
        signature: 'a'.repeat(51),
      };

      await expect(messageService.create(messageData)).rejects.toThrow();
    });

    it('should reject more than 3 gallery images', async () => {
      const messageData: CreateMessageInput = {
        recipientName: 'Test',
        senderName: 'Test',
        messageText: 'Test',
        galleryImages: [
          'https://example.com/1.jpg',
          'https://example.com/2.jpg',
          'https://example.com/3.jpg',
          'https://example.com/4.jpg',
        ],
      };

      await expect(messageService.create(messageData)).rejects.toThrow();
    });
  });
});
