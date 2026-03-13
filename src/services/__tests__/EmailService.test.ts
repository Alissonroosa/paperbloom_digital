/**
 * EmailService Tests
 * 
 * Tests for email delivery service using Resend API
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailService, QRCodeEmailData, CardCollectionEmailData } from '../EmailService';

describe('EmailService', () => {
  let emailService: EmailService;
  
  const mockConfig = {
    apiKey: 're_mock_api_key_for_testing',
    fromEmail: 'test@paperbloom.com',
    fromName: 'Paper Bloom Test',
  };
  
  const mockEmailData: QRCodeEmailData = {
    recipientEmail: 'recipient@example.com',
    recipientName: 'João Silva',
    messageUrl: 'https://paperbloom.com/mensagem/joao/aniversario',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    senderName: 'Maria',
    messageTitle: 'Feliz Aniversário',
  };

  const mockCardCollectionData: CardCollectionEmailData = {
    recipientEmail: 'sender@example.com',
    recipientName: 'Ana Costa',
    senderName: 'Pedro Silva',
    collectionUrl: 'https://paperbloom.com/cartas/abc123',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };

  beforeEach(() => {
    // Set up environment variables for tests
    process.env.RESEND_API_KEY = 're_test_mock_key';
    process.env.RESEND_FROM_EMAIL = 'test@paperbloom.com';
    process.env.RESEND_FROM_NAME = 'Paper Bloom Test';
  });

  describe('Initialization', () => {
    it('should initialize with provided config', () => {
      expect(() => new EmailService(mockConfig)).not.toThrow();
    });

    it('should initialize with environment config', () => {
      expect(() => new EmailService()).not.toThrow();
    });

    it('should log initialization', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      new EmailService(mockConfig);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[EmailService] Initialized with config:',
        expect.objectContaining({
          fromEmail: mockConfig.fromEmail,
          fromName: mockConfig.fromName,
          apiKeyPresent: true,
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('validateConfig - Requirement 13.2', () => {
    it('should return true for valid configuration', () => {
      emailService = new EmailService(mockConfig);
      expect(emailService.validateConfig()).toBe(true);
    });

    it('should return false if API key is missing', () => {
      const invalidConfig = { ...mockConfig, apiKey: '' };
      emailService = new EmailService(invalidConfig);
      
      const consoleSpy = vi.spyOn(console, 'error');
      const result = emailService.validateConfig();
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[EmailService] Invalid configuration:',
        expect.objectContaining({
          hasApiKey: false,
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should return false if fromEmail is missing', () => {
      const invalidConfig = { ...mockConfig, fromEmail: '' };
      emailService = new EmailService(invalidConfig);
      
      expect(emailService.validateConfig()).toBe(false);
    });

    it('should return false if fromName is missing', () => {
      const invalidConfig = { ...mockConfig, fromName: '' };
      emailService = new EmailService(invalidConfig);
      
      expect(emailService.validateConfig()).toBe(false);
    });
  });

  describe('sendQRCodeEmail - Requirements 13.1, 13.4, 13.5', () => {
    it('should return error if configuration is invalid', async () => {
      const invalidConfig = { ...mockConfig, apiKey: '' };
      emailService = new EmailService(invalidConfig);
      
      const result = await emailService.sendQRCodeEmail(mockEmailData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email service not configured properly');
    });

    it('should log email send attempt - Requirement 13.5', async () => {
      emailService = new EmailService(mockConfig);
      const consoleSpy = vi.spyOn(console, 'log');
      
      // Mock the sendWithRetry to avoid actual API call
      vi.spyOn(emailService as any, 'sendWithRetry').mockRejectedValue(
        new Error('Mock error')
      );
      
      await emailService.sendQRCodeEmail(mockEmailData);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[EmailService] Attempting to send QR code email:',
        expect.objectContaining({
          recipientEmail: mockEmailData.recipientEmail,
          recipientName: mockEmailData.recipientName,
          messageTitle: mockEmailData.messageTitle,
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully - Requirement 13.4', async () => {
      emailService = new EmailService(mockConfig);
      
      // Mock the sendWithRetry to throw an error
      vi.spyOn(emailService as any, 'sendWithRetry').mockRejectedValue(
        new Error('Network error')
      );
      
      const result = await emailService.sendQRCodeEmail(mockEmailData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should log errors - Requirement 13.5', async () => {
      emailService = new EmailService(mockConfig);
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      // Mock the sendWithRetry to throw an error
      vi.spyOn(emailService as any, 'sendWithRetry').mockRejectedValue(
        new Error('API error')
      );
      
      await emailService.sendQRCodeEmail(mockEmailData);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[EmailService] Email send failed:',
        expect.objectContaining({
          error: 'API error',
          recipientEmail: mockEmailData.recipientEmail,
        })
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Email Template', () => {
    it('should generate subject with recipient name', async () => {
      const { QR_CODE_EMAIL_TEMPLATE } = await import('../EmailService');
      const subject = QR_CODE_EMAIL_TEMPLATE.subject('João Silva');
      
      expect(subject).toContain('João Silva');
      expect(subject).toContain('🎁');
    });

    it('should generate HTML with all required data', async () => {
      const { QR_CODE_EMAIL_TEMPLATE } = await import('../EmailService');
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Check for recipient name
      expect(html).toContain(mockEmailData.recipientName);
      
      // Check for message title
      expect(html).toContain(mockEmailData.messageTitle);
      
      // Check for message URL
      expect(html).toContain(mockEmailData.messageUrl);
      
      // Check for QR code reference
      expect(html).toContain('cid:qrcode');
      
      // Check for instructions
      expect(html).toContain('Como Compartilhar');
      
      // Check for responsive design
      expect(html).toContain('max-width: 600px');
    });

    it('should include mobile responsive styles', async () => {
      const { QR_CODE_EMAIL_TEMPLATE } = await import('../EmailService');
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('@media only screen and (max-width: 600px)');
    });
  });

  describe('Configuration Validation', () => {
    it('should have all required methods', () => {
      emailService = new EmailService(mockConfig);
      
      expect(emailService.sendQRCodeEmail).toBeDefined();
      expect(typeof emailService.sendQRCodeEmail).toBe('function');
      
      expect(emailService.validateConfig).toBeDefined();
      expect(typeof emailService.validateConfig).toBe('function');
    });
  });

  describe('sendCardCollectionEmail - Requirement 6.5', () => {
    it('should return error if configuration is invalid', async () => {
      const invalidConfig = { ...mockConfig, apiKey: '' };
      emailService = new EmailService(invalidConfig);
      
      const result = await emailService.sendCardCollectionEmail(mockCardCollectionData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email service not configured properly');
    });

    it('should log email send attempt', async () => {
      emailService = new EmailService(mockConfig);
      const consoleSpy = vi.spyOn(console, 'log');
      
      // Mock the sendCardCollectionWithRetry to avoid actual API call
      vi.spyOn(emailService as any, 'sendCardCollectionWithRetry').mockRejectedValue(
        new Error('Mock error')
      );
      
      await emailService.sendCardCollectionEmail(mockCardCollectionData);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[EmailService] Attempting to send card collection email:',
        expect.objectContaining({
          recipientEmail: mockCardCollectionData.recipientEmail,
          recipientName: mockCardCollectionData.recipientName,
          senderName: mockCardCollectionData.senderName,
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      emailService = new EmailService(mockConfig);
      
      // Mock the sendCardCollectionWithRetry to throw an error
      vi.spyOn(emailService as any, 'sendCardCollectionWithRetry').mockRejectedValue(
        new Error('Network error')
      );
      
      const result = await emailService.sendCardCollectionEmail(mockCardCollectionData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should log errors', async () => {
      emailService = new EmailService(mockConfig);
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      // Mock the sendCardCollectionWithRetry to throw an error
      vi.spyOn(emailService as any, 'sendCardCollectionWithRetry').mockRejectedValue(
        new Error('API error')
      );
      
      await emailService.sendCardCollectionEmail(mockCardCollectionData);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[EmailService] Card collection email send failed:',
        expect.objectContaining({
          error: 'API error',
          recipientEmail: mockCardCollectionData.recipientEmail,
        })
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Card Collection Email Template', () => {
    it('should generate subject with recipient name', async () => {
      const { CARD_COLLECTION_EMAIL_TEMPLATE } = await import('../EmailService');
      const subject = CARD_COLLECTION_EMAIL_TEMPLATE.subject('Ana Costa');
      
      expect(subject).toContain('Ana Costa');
      expect(subject).toContain('12 Cartas');
      expect(subject).toContain('💌');
    });

    it('should generate HTML with all required data', async () => {
      const { CARD_COLLECTION_EMAIL_TEMPLATE } = await import('../EmailService');
      const html = CARD_COLLECTION_EMAIL_TEMPLATE.html(mockCardCollectionData);
      
      // Check for recipient name
      expect(html).toContain(mockCardCollectionData.recipientName);
      
      // Check for sender name
      expect(html).toContain(mockCardCollectionData.senderName);
      
      // Check for collection URL
      expect(html).toContain(mockCardCollectionData.collectionUrl);
      
      // Check for QR code reference
      expect(html).toContain('cid:qrcode');
      
      // Check for "12 Cartas" branding
      expect(html).toContain('12 Cartas');
      expect(html).toContain('Uma Jornada Emocional Única');
      
      // Check for instructions
      expect(html).toContain('Como Compartilhar');
      expect(html).toContain('Como Funciona');
      
      // Check for special note about one-time opening
      expect(html).toContain('só pode ser aberta uma única vez');
      
      // Check for responsive design
      expect(html).toContain('max-width: 600px');
    });

    it('should include mobile responsive styles', async () => {
      const { CARD_COLLECTION_EMAIL_TEMPLATE } = await import('../EmailService');
      const html = CARD_COLLECTION_EMAIL_TEMPLATE.html(mockCardCollectionData);
      
      expect(html).toContain('@media only screen and (max-width: 600px)');
    });

    it('should include visual identity elements', async () => {
      const { CARD_COLLECTION_EMAIL_TEMPLATE } = await import('../EmailService');
      const html = CARD_COLLECTION_EMAIL_TEMPLATE.html(mockCardCollectionData);
      
      // Check for gradient hero section
      expect(html).toContain('linear-gradient');
      
      // Check for Paper Bloom branding
      expect(html).toContain('Paper Bloom');
      
      // Check for emojis
      expect(html).toContain('💌');
      expect(html).toContain('🎁');
      expect(html).toContain('✨');
    });

    it('should include usage instructions', async () => {
      const { CARD_COLLECTION_EMAIL_TEMPLATE } = await import('../EmailService');
      const html = CARD_COLLECTION_EMAIL_TEMPLATE.html(mockCardCollectionData);
      
      // Check for sharing instructions
      expect(html).toContain('WhatsApp');
      expect(html).toContain('Imprima');
      expect(html).toContain('Link Direto');
      
      // Check for how it works section
      expect(html).toContain('verá as 12 cartas disponíveis');
      expect(html).toContain('Abra quando');
    });
  });
});
