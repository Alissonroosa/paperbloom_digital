/**
 * Email Template Tests
 * 
 * Tests for QR code email template rendering and content validation
 * Requirements: 12.2, 12.3, 12.4
 */

import { describe, it, expect } from 'vitest';
import { QR_CODE_EMAIL_TEMPLATE, QRCodeEmailData } from '../EmailService';

describe('QR Code Email Template', () => {
  const mockEmailData: QRCodeEmailData = {
    recipientEmail: 'recipient@example.com',
    recipientName: 'Maria Silva',
    messageUrl: 'https://paperbloom.com/mensagem/maria/abc123',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    senderName: 'João Santos',
    messageTitle: 'Feliz Aniversário',
  };

  describe('Subject Line', () => {
    it('should generate subject with recipient name', () => {
      const subject = QR_CODE_EMAIL_TEMPLATE.subject(mockEmailData.recipientName);
      
      expect(subject).toContain(mockEmailData.recipientName);
      expect(subject).toContain('🎁');
      expect(subject).toContain('Sua mensagem especial');
    });

    it('should handle special characters in recipient name', () => {
      const subject = QR_CODE_EMAIL_TEMPLATE.subject('José María Ñoño');
      
      expect(subject).toContain('José María Ñoño');
    });
  });

  describe('HTML Content - Requirement 12.2: QR Code Image', () => {
    it('should include QR code image with cid reference', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Requirement 12.2: QR code must be embedded as image
      expect(html).toContain('src="cid:qrcode"');
      expect(html).toContain('<img');
      expect(html).toContain('alt="QR Code');
    });

    it('should have proper QR code section styling', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('class="qr-code"');
      expect(html).toContain('QR Code da Mensagem');
    });

    it('should include descriptive alt text for accessibility', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain(`alt="QR Code da mensagem ${mockEmailData.messageTitle}"`);
    });
  });

  describe('HTML Content - Requirement 12.3: Message URL', () => {
    it('should include message URL as clickable link', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Requirement 12.3: Message URL must be clickable link
      expect(html).toContain(`href="${mockEmailData.messageUrl}"`);
      expect(html).toContain(mockEmailData.messageUrl);
    });

    it('should include "Visualizar Mensagem" button with URL', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('Visualizar Mensagem');
      expect(html).toContain('class="button"');
      expect(html).toContain(`href="${mockEmailData.messageUrl}"`);
    });

    it('should display URL in message-url section', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('class="message-url"');
      expect(html).toContain('Link Direto:');
    });
  });

  describe('HTML Content - Requirement 12.4: Usage Instructions', () => {
    it('should include sharing instructions', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Requirement 12.4: Must include usage instructions
      expect(html).toContain('Como Compartilhar');
      expect(html).toContain('class="instructions"');
    });

    it('should list multiple sharing methods', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Check for various sharing methods
      expect(html).toContain('WhatsApp');
      expect(html).toContain('email');
      expect(html).toContain('redes sociais');
      expect(html).toContain('Imprima o QR Code');
      expect(html).toContain('cartão físico');
      expect(html).toContain('link direto');
    });

    it('should have instructions in a visually distinct section', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>');
      expect(html).toContain('💡');
    });
  });

  describe('Email Structure and Content', () => {
    it('should include all required data fields', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain(mockEmailData.recipientName);
      expect(html).toContain(mockEmailData.messageTitle);
      expect(html).toContain(mockEmailData.messageUrl);
    });

    it('should have proper HTML structure', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
    });

    it('should include meta charset for proper encoding', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('<meta charset="utf-8">');
    });

    it('should include viewport meta for mobile responsiveness', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('<meta name="viewport"');
    });

    it('should have header section with greeting', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('class="header"');
      expect(html).toContain('Sua Mensagem Está Pronta!');
      expect(html).toContain(`Olá ${mockEmailData.recipientName}`);
    });

    it('should have footer with branding', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('class="footer"');
      expect(html).toContain('Equipe Paper Bloom');
      expect(html).toContain('paperbloom.com');
    });
  });

  describe('Email Styling', () => {
    it('should include inline CSS styles', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('<style>');
      expect(html).toContain('</style>');
    });

    it('should have responsive styles for mobile', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('@media only screen and (max-width: 600px)');
    });

    it('should style buttons for visibility', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('.button');
      expect(html).toContain('background: #4F46E5');
    });

    it('should have container with max-width for email clients', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('max-width: 600px');
    });
  });

  describe('Special Characters and Encoding', () => {
    it('should handle special characters in recipient name', () => {
      const dataWithSpecialChars: QRCodeEmailData = {
        ...mockEmailData,
        recipientName: 'José María Ñoño',
      };
      
      const html = QR_CODE_EMAIL_TEMPLATE.html(dataWithSpecialChars);
      
      expect(html).toContain('José María Ñoño');
    });

    it('should handle special characters in message title', () => {
      const dataWithSpecialChars: QRCodeEmailData = {
        ...mockEmailData,
        messageTitle: 'Feliz Aniversário & Boas Festas!',
      };
      
      const html = QR_CODE_EMAIL_TEMPLATE.html(dataWithSpecialChars);
      
      // Template literals don't auto-escape, which is fine for HTML rendering
      expect(html).toContain('Feliz Aniversário & Boas Festas!');
    });

    it('should handle URLs with query parameters', () => {
      const dataWithQueryParams: QRCodeEmailData = {
        ...mockEmailData,
        messageUrl: 'https://paperbloom.com/mensagem/maria/abc123?ref=email&utm_source=qrcode',
      };
      
      const html = QR_CODE_EMAIL_TEMPLATE.html(dataWithQueryParams);
      
      expect(html).toContain(dataWithQueryParams.messageUrl);
    });
  });

  describe('Email Client Compatibility', () => {
    it('should use inline styles for better email client support', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Check for inline styles on key elements
      expect(html).toContain('style="');
    });

    it('should use table-safe HTML structure', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Should use divs with proper styling instead of complex layouts
      expect(html).toContain('<div class="container">');
    });

    it('should specify image dimensions for consistent rendering', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('max-width: 300px');
    });

    it('should use web-safe fonts', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      expect(html).toContain('font-family');
      expect(html).toContain('Arial');
      expect(html).toContain('sans-serif');
    });
  });

  describe('Content Completeness - All Requirements', () => {
    it('should satisfy Requirement 12.2: QR code embedded as image', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Must have QR code image with cid reference for inline embedding
      expect(html).toContain('src="cid:qrcode"');
      expect(html).toContain('QR Code da Mensagem');
    });

    it('should satisfy Requirement 12.3: Message URL as clickable link', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Must have clickable link to message URL
      const urlCount = (html.match(new RegExp(mockEmailData.messageUrl, 'g')) || []).length;
      expect(urlCount).toBeGreaterThanOrEqual(2); // At least in text and button
    });

    it('should satisfy Requirement 12.4: Usage instructions included', () => {
      const html = QR_CODE_EMAIL_TEMPLATE.html(mockEmailData);
      
      // Must have clear instructions on how to use and share
      expect(html).toContain('Como Compartilhar');
      expect(html).toContain('WhatsApp');
      expect(html).toContain('Imprima');
      expect(html).toContain('Compartilhe');
    });
  });
});
