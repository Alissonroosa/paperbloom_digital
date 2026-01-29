/**
 * Email Service
 * 
 * Handles email delivery using Resend API for transactional emails.
 * Implements retry logic with exponential backoff for reliability.
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 */

import { Resend } from 'resend';
import { env } from '@/lib/env';

/**
 * QR Code email data structure
 */
export interface QRCodeEmailData {
  recipientEmail: string;
  recipientName: string;
  messageUrl: string;
  qrCodeDataUrl: string; // Base64 encoded QR code image
  senderName: string;
  messageTitle: string;
}

/**
 * Card Collection email data structure
 */
export interface CardCollectionEmailData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  collectionUrl: string;
  qrCodeDataUrl: string; // Base64 encoded QR code image
}

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Resend configuration
 */
export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

/**
 * Email service interface
 */
export interface IEmailService {
  sendQRCodeEmail(data: QRCodeEmailData): Promise<EmailSendResult>;
  sendCardCollectionEmail(data: CardCollectionEmailData): Promise<EmailSendResult>;
  validateConfig(): boolean;
}

/**
 * QR Code email template
 */
export const QR_CODE_EMAIL_TEMPLATE = {
  subject: (recipientName: string) => 
    `Sua mensagem especial para ${recipientName} está pronta! 🎁`,
  
  html: (data: QRCodeEmailData) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #ffffff;
          }
          .header { 
            text-align: center; 
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .qr-code { 
            text-align: center; 
            margin: 30px 0;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 8px;
          }
          .qr-code img { 
            max-width: 300px;
            width: 100%;
            height: auto;
            border: 2px solid #e5e7eb;
            padding: 10px;
            background-color: #ffffff;
            border-radius: 8px;
          }
          .message-url { 
            background: #f3f4f6; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #4F46E5;
          }
          .message-url h3 {
            margin-top: 0;
            color: #1f2937;
          }
          .message-url a {
            color: #4F46E5;
            text-decoration: none;
            word-break: break-all;
          }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #4F46E5; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 6px;
            font-weight: 600;
            margin-top: 15px;
          }
          .button:hover {
            background: #4338CA;
          }
          .instructions {
            margin: 30px 0;
            padding: 20px;
            background-color: #fef3c7;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          .instructions h3 {
            margin-top: 0;
            color: #92400e;
          }
          .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 8px 0;
            color: #78350f;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #6b7280; 
            font-size: 14px;
          }
          .footer a {
            color: #4F46E5;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .container {
              padding: 10px;
            }
            .header h1 {
              font-size: 24px;
            }
            .qr-code img {
              max-width: 250px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Sua Mensagem Está Pronta!</h1>
            <p>Olá ${data.recipientName},</p>
            <p>Sua mensagem especial "${data.messageTitle}" foi criada com sucesso!</p>
          </div>
          
          <div class="qr-code">
            <h2 style="color: #1f2937; margin-top: 0;">QR Code da Mensagem</h2>
            <img src="cid:qrcode" alt="QR Code da mensagem ${data.messageTitle}" />
            <p style="color: #6b7280; margin-bottom: 0;">Escaneie este código para acessar sua mensagem</p>
          </div>
          
          <div class="message-url">
            <h3>Link Direto:</h3>
            <p><a href="${data.messageUrl}">${data.messageUrl}</a></p>
            <p style="text-align: center; margin-top: 15px; margin-bottom: 0;">
              <a href="${data.messageUrl}" class="button">Visualizar Mensagem</a>
            </p>
          </div>
          
          <div class="instructions">
            <h3>💡 Como Compartilhar:</h3>
            <ul>
              <li>Envie o QR Code por WhatsApp, email ou redes sociais</li>
              <li>Imprima o QR Code e coloque em um cartão físico</li>
              <li>Compartilhe o link direto com o destinatário</li>
              <li>Salve o QR Code em seu dispositivo para uso futuro</li>
            </ul>
          </div>
          
          <div class="footer">
            <p style="margin: 10px 0;">Com carinho,<br><strong>Equipe Paper Bloom</strong></p>
            <p style="margin: 10px 0;"><a href="https://paperbloom.com">paperbloom.com</a></p>
            <p style="margin: 10px 0; font-size: 12px; color: #9ca3af;">
              Este é um email automático. Por favor, não responda.
            </p>
          </div>
        </div>
      </body>
    </html>
  `,
};

/**
 * Card Collection email template
 */
export const CARD_COLLECTION_EMAIL_TEMPLATE = {
  subject: (recipientName: string) => 
    `Suas 12 Cartas para ${recipientName} estão prontas! 💌`,
  
  html: (data: CardCollectionEmailData) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #ffffff;
          }
          .header { 
            text-align: center; 
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .hero {
            text-align: center;
            padding: 30px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            margin: 20px 0;
            color: white;
          }
          .hero h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .hero p {
            margin: 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .qr-code { 
            text-align: center; 
            margin: 30px 0;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 8px;
          }
          .qr-code img { 
            max-width: 300px;
            width: 100%;
            height: auto;
            border: 2px solid #e5e7eb;
            padding: 10px;
            background-color: #ffffff;
            border-radius: 8px;
          }
          .message-url { 
            background: #f3f4f6; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #4F46E5;
          }
          .message-url h3 {
            margin-top: 0;
            color: #1f2937;
          }
          .message-url a {
            color: #4F46E5;
            text-decoration: none;
            word-break: break-all;
          }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #4F46E5; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 6px;
            font-weight: 600;
            margin-top: 15px;
          }
          .button:hover {
            background: #4338CA;
          }
          .instructions {
            margin: 30px 0;
            padding: 20px;
            background-color: #fef3c7;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          .instructions h3 {
            margin-top: 0;
            color: #92400e;
          }
          .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 8px 0;
            color: #78350f;
          }
          .special-note {
            margin: 30px 0;
            padding: 20px;
            background-color: #fce7f3;
            border-radius: 8px;
            border-left: 4px solid #ec4899;
          }
          .special-note h3 {
            margin-top: 0;
            color: #9f1239;
          }
          .special-note p {
            margin: 8px 0;
            color: #831843;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #6b7280; 
            font-size: 14px;
          }
          .footer a {
            color: #4F46E5;
            text-decoration: none;
          }
          @media only screen and (max-width: 600px) {
            .container {
              padding: 10px;
            }
            .header h1 {
              font-size: 24px;
            }
            .hero h2 {
              font-size: 20px;
            }
            .qr-code img {
              max-width: 250px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💌 Suas 12 Cartas Estão Prontas!</h1>
            <p>Olá,</p>
            <p>Suas 12 cartas para <strong>${data.recipientName}</strong> foram criadas com sucesso!</p>
          </div>
          
          <div class="hero">
            <h2>🎁 Uma Jornada Emocional Única</h2>
            <p>12 mensagens especiais que só podem ser abertas uma vez cada</p>
          </div>
          
          <div class="qr-code">
            <h2 style="color: #1f2937; margin-top: 0;">QR Code das 12 Cartas</h2>
            <img src="cid:qrcode" alt="QR Code das 12 Cartas para ${data.recipientName}" />
            <p style="color: #6b7280; margin-bottom: 0;">Escaneie este código para acessar as cartas</p>
          </div>
          
          <div class="message-url">
            <h3>Link Direto:</h3>
            <p><a href="${data.collectionUrl}">${data.collectionUrl}</a></p>
            <p style="text-align: center; margin-top: 15px; margin-bottom: 0;">
              <a href="${data.collectionUrl}" class="button">Visualizar as 12 Cartas</a>
            </p>
          </div>
          
          <div class="special-note">
            <h3>✨ Experiência Única e Especial</h3>
            <p><strong>Importante:</strong> Cada carta só pode ser aberta uma única vez! Quando ${data.recipientName} abrir uma carta, ela não poderá ser visualizada novamente.</p>
            <p>Isso torna cada momento ainda mais especial e memorável. 💝</p>
          </div>
          
          <div class="instructions">
            <h3>💡 Como Compartilhar:</h3>
            <ul>
              <li><strong>QR Code:</strong> Envie por WhatsApp, email ou redes sociais</li>
              <li><strong>Impresso:</strong> Imprima o QR Code e coloque em um cartão físico especial</li>
              <li><strong>Link Direto:</strong> Compartilhe o link com ${data.recipientName}</li>
              <li><strong>Salvar:</strong> Guarde o QR Code em seu dispositivo para referência futura</li>
            </ul>
          </div>
          
          <div class="instructions" style="background-color: #dbeafe; border-left-color: #3b82f6;">
            <h3 style="color: #1e3a8a;">📖 Como Funciona:</h3>
            <ul style="color: #1e40af;">
              <li>${data.recipientName} verá as 12 cartas disponíveis</li>
              <li>Cada carta tem um título especial ("Abra quando...")</li>
              <li>Ao clicar em uma carta, ela será aberta pela primeira vez</li>
              <li>Após abrir, a carta ficará marcada como "já aberta"</li>
              <li>As outras cartas continuam disponíveis para serem abertas quando ${data.recipientName} quiser</li>
            </ul>
          </div>
          
          <div class="footer">
            <p style="margin: 10px 0;">Com carinho,<br><strong>Equipe Paper Bloom</strong></p>
            <p style="margin: 10px 0;"><a href="https://paperbloom.com">paperbloom.com</a></p>
            <p style="margin: 10px 0; font-size: 12px; color: #9ca3af;">
              Este é um email automático. Por favor, não responda.
            </p>
          </div>
        </div>
      </body>
    </html>
  `,
};

/**
 * Email Service implementation using Resend
 * 
 * Requirement 13.1: Uses Resend API for all transactional emails
 * Requirement 13.2: Stores API key securely in environment variables
 * Requirement 13.3: Uses verified sender email address
 * Requirement 13.4: Handles Resend API errors gracefully
 * Requirement 13.5: Logs all email sending attempts and results
 * Requirement 13.6: Retries failed sends up to 3 times with exponential backoff
 */
export class EmailService implements IEmailService {
  private resend: Resend;
  private config: ResendConfig;
  
  constructor(config?: ResendConfig) {
    // Use provided config or load from environment
    this.config = config || env.resend;
    this.resend = new Resend(this.config.apiKey);
    
    // Log initialization (Requirement 13.5)
    console.log('[EmailService] Initialized with config:', {
      fromEmail: this.config.fromEmail,
      fromName: this.config.fromName,
      apiKeyPresent: !!this.config.apiKey,
    });
  }
  
  /**
   * Validates the email service configuration
   * 
   * Requirement 13.2: Validates API key and configuration
   */
  validateConfig(): boolean {
    const isValid = !!(
      this.config.apiKey &&
      this.config.fromEmail &&
      this.config.fromName
    );
    
    if (!isValid) {
      console.error('[EmailService] Invalid configuration:', {
        hasApiKey: !!this.config.apiKey,
        hasFromEmail: !!this.config.fromEmail,
        hasFromName: !!this.config.fromName,
      });
    }
    
    return isValid;
  }
  
  /**
   * Sends QR code email to recipient
   * 
   * Requirement 13.1: Uses Resend API for email delivery
   * Requirement 13.4: Handles errors gracefully
   * Requirement 13.5: Logs attempts and results
   * Requirement 13.6: Implements retry logic with exponential backoff
   * 
   * @param data - QR code email data
   * @returns Email send result with success status and message ID or error
   */
  async sendQRCodeEmail(data: QRCodeEmailData): Promise<EmailSendResult> {
    // Validate configuration (Requirement 13.2)
    if (!this.validateConfig()) {
      const error = 'Email service not configured properly';
      console.error('[EmailService] Configuration validation failed');
      return {
        success: false,
        error,
      };
    }
    
    // Log email send attempt (Requirement 13.5)
    console.log('[EmailService] Attempting to send QR code email:', {
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      messageTitle: data.messageTitle,
      timestamp: new Date().toISOString(),
    });
    
    try {
      // Send with retry logic (Requirement 13.6)
      const result = await this.sendWithRetry(data, 3);
      
      // Log success (Requirement 13.5)
      console.log('[EmailService] Email sent successfully:', {
        messageId: result.messageId,
        recipientEmail: data.recipientEmail,
        timestamp: new Date().toISOString(),
      });
      
      return result;
    } catch (error) {
      // Handle errors gracefully (Requirement 13.4)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      
      // Log error (Requirement 13.5)
      console.error('[EmailService] Email send failed:', {
        error: errorMessage,
        recipientEmail: data.recipientEmail,
        timestamp: new Date().toISOString(),
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
  
  /**
   * Sends card collection email to recipient
   * 
   * Requirement 6.5: Sends email with link and QR code after payment
   * 
   * @param data - Card collection email data
   * @returns Email send result with success status and message ID or error
   */
  async sendCardCollectionEmail(data: CardCollectionEmailData): Promise<EmailSendResult> {
    // Validate configuration
    if (!this.validateConfig()) {
      const error = 'Email service not configured properly';
      console.error('[EmailService] Configuration validation failed');
      return {
        success: false,
        error,
      };
    }
    
    // Log email send attempt
    console.log('[EmailService] Attempting to send card collection email:', {
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      senderName: data.senderName,
      timestamp: new Date().toISOString(),
    });
    
    try {
      // Send with retry logic
      const result = await this.sendCardCollectionWithRetry(data, 3);
      
      // Log success
      console.log('[EmailService] Card collection email sent successfully:', {
        messageId: result.messageId,
        recipientEmail: data.recipientEmail,
        timestamp: new Date().toISOString(),
      });
      
      return result;
    } catch (error) {
      // Handle errors gracefully
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      
      // Log error
      console.error('[EmailService] Card collection email send failed:', {
        error: errorMessage,
        recipientEmail: data.recipientEmail,
        timestamp: new Date().toISOString(),
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
  
  /**
   * Sends email with retry logic and exponential backoff
   * 
   * Requirement 13.6: Retries up to 3 times with exponential backoff (1s, 2s, 4s)
   * 
   * @param data - QR code email data
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @returns Email send result
   * @throws Error if all retry attempts fail
   */
  private async sendWithRetry(
    data: QRCodeEmailData,
    maxRetries: number
  ): Promise<EmailSendResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Log retry attempt (Requirement 13.5)
        console.log(`[EmailService] Send attempt ${attempt}/${maxRetries}`, {
          recipientEmail: data.recipientEmail,
        });
        
        // Send email using Resend API (Requirement 13.1)
        const result = await this.resend.emails.send({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: data.recipientEmail,
          subject: QR_CODE_EMAIL_TEMPLATE.subject(data.recipientName),
          html: QR_CODE_EMAIL_TEMPLATE.html(data),
          attachments: [
            {
              filename: 'qrcode.png',
              content: data.qrCodeDataUrl.split(',')[1], // Remove data:image/png;base64, prefix
              contentId: 'qrcode',
            },
          ],
        });
        
        // Success - return result
        return {
          success: true,
          messageId: result.data?.id,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Log retry attempt failure (Requirement 13.5)
        console.warn(`[EmailService] Attempt ${attempt}/${maxRetries} failed:`, {
          error: lastError.message,
          recipientEmail: data.recipientEmail,
        });
        
        // If not the last attempt, wait with exponential backoff
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s (Requirement 13.6)
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`[EmailService] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed - throw last error
    throw lastError || new Error('Failed to send email after retries');
  }
  
  /**
   * Sends card collection email with retry logic and exponential backoff
   * 
   * @param data - Card collection email data
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @returns Email send result
   * @throws Error if all retry attempts fail
   */
  private async sendCardCollectionWithRetry(
    data: CardCollectionEmailData,
    maxRetries: number
  ): Promise<EmailSendResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Log retry attempt
        console.log(`[EmailService] Card collection send attempt ${attempt}/${maxRetries}`, {
          recipientEmail: data.recipientEmail,
        });
        
        // Send email using Resend API
        const result = await this.resend.emails.send({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: data.recipientEmail,
          subject: CARD_COLLECTION_EMAIL_TEMPLATE.subject(data.recipientName),
          html: CARD_COLLECTION_EMAIL_TEMPLATE.html(data),
          attachments: [
            {
              filename: 'qrcode.png',
              content: data.qrCodeDataUrl.split(',')[1], // Remove data:image/png;base64, prefix
              contentId: 'qrcode',
            },
          ],
        });
        
        // Success - return result
        return {
          success: true,
          messageId: result.data?.id,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Log retry attempt failure
        console.warn(`[EmailService] Card collection attempt ${attempt}/${maxRetries} failed:`, {
          error: lastError.message,
          recipientEmail: data.recipientEmail,
        });
        
        // If not the last attempt, wait with exponential backoff
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`[EmailService] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed - throw last error
    throw lastError || new Error('Failed to send card collection email after retries');
  }
}

/**
 * Singleton instance of EmailService
 * Uses environment configuration by default
 * Note: Environment must be validated before using this instance
 */
let _emailServiceInstance: EmailService | null = null;

export const emailService = {
  get instance(): EmailService {
    if (!_emailServiceInstance) {
      _emailServiceInstance = new EmailService();
    }
    return _emailServiceInstance;
  },
  
  // Convenience methods that delegate to the singleton instance
  sendQRCodeEmail: (data: QRCodeEmailData) => emailService.instance.sendQRCodeEmail(data),
  sendCardCollectionEmail: (data: CardCollectionEmailData) => emailService.instance.sendCardCollectionEmail(data),
  validateConfig: () => emailService.instance.validateConfig(),
};
