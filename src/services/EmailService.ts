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
import { ART_DELIVERY_EMAIL_TEMPLATE } from './email-templates/art-delivery';
import type { ArtDeliveryEmailData } from './email-templates/art-delivery';
import { ART_RECOVERY_EMAIL_TEMPLATE } from './email-templates/art-recovery';
import type { ArtRecoveryEmailData } from './email-templates/art-recovery';

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
  sendArtDeliveryEmail(data: ArtDeliveryEmailData): Promise<EmailSendResult>;
  sendArtRecoveryEmail(data: ArtRecoveryEmailData): Promise<EmailSendResult>;
  validateConfig(): boolean;
}

/**
 * QR Code email template — Paper Bloom visual identity
 */
export const QR_CODE_EMAIL_TEMPLATE = {
  subject: (recipientName: string) => 
    `Sua mensagem para ${recipientName} está pronta 🌸`,
  
  html: (data: QRCodeEmailData) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.7; color: #4A4A4A; margin: 0; padding: 0; background-color: #FFFAFA; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .brand-bar { height: 6px; background: linear-gradient(90deg, #E6C2C2, #D4A5A5, #E6C2C2); }
          .header { text-align: center; padding: 40px 30px 20px; }
          .header .logo { font-family: 'Georgia', serif; font-size: 26px; color: #8B5F5F; letter-spacing: 1px; margin: 0; }
          .header .tagline { font-size: 13px; color: #D4A5A5; margin: 6px 0 0; letter-spacing: 2px; text-transform: uppercase; }
          .divider { width: 60px; height: 1px; background: #E6C2C2; margin: 0 auto; }
          .content { padding: 30px; text-align: center; }
          .content h2 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 22px; font-weight: normal; margin: 0 0 10px; }
          .content p { color: #4A4A4A; font-size: 15px; margin: 8px 0; }
          .hero { margin: 25px 0; padding: 28px 20px; background: linear-gradient(135deg, #FFFAFA 0%, #f5e6e6 100%); border-radius: 12px; border: 1px solid #E6C2C2; }
          .hero h3 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 18px; font-weight: normal; margin: 0 0 6px; }
          .qr-section { text-align: center; margin: 30px 0; padding: 25px; background-color: #FFFAFA; border-radius: 12px; }
          .qr-section img { max-width: 220px; width: 100%; height: auto; border: 2px solid #E6C2C2; padding: 12px; background: #fff; border-radius: 12px; }
          .qr-section p { color: #8B5F5F; font-size: 13px; margin: 12px 0 0; }
          .link-box { background: #FFFAFA; padding: 20px; border-radius: 12px; margin: 20px 30px; border: 1px solid #E6C2C2; text-align: center; }
          .link-box a.url { color: #8B5F5F; text-decoration: none; word-break: break-all; font-size: 14px; }
          .btn { display: inline-block; padding: 14px 32px; background: #D4A5A5; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-size: 15px; font-family: 'Georgia', serif; letter-spacing: 0.5px; margin-top: 16px; }
          .tips { margin: 25px 30px; padding: 20px; background: #fdf8f4; border-radius: 12px; border: 1px solid #f0ddd0; text-align: left; }
          .tips h4 { color: #8B5F5F; font-family: 'Georgia', serif; font-weight: normal; margin: 0 0 12px; font-size: 15px; }
          .tips ul { margin: 0; padding-left: 18px; }
          .tips li { color: #4A4A4A; font-size: 14px; margin: 6px 0; }
          .footer { text-align: center; padding: 30px; border-top: 1px solid #f0e6e6; }
          .footer .name { color: #8B5F5F; font-family: 'Georgia', serif; font-size: 16px; }
          .footer a { color: #D4A5A5; text-decoration: none; font-size: 13px; }
          .footer .auto { font-size: 11px; color: #c4b0b0; margin-top: 12px; }
          @media only screen and (max-width: 600px) { .content { padding: 20px; } .link-box, .tips { margin: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand-bar"></div>
          <div class="header">
            <p class="logo">Paper Bloom</p>
            <p class="tagline">Mensagens com emoção</p>
          </div>
          <div class="divider"></div>

          <div class="content">
            <h2>Sua mensagem está pronta 🌸</h2>
            <p>Olá, ${data.recipientName}</p>
            <p>A mensagem "<strong>${data.messageTitle}</strong>" foi criada com carinho e já pode ser compartilhada.</p>
          </div>

          <div class="qr-section">
            <img src="cid:qrcode" alt="QR Code da mensagem ${data.messageTitle}" />
            <p>Escaneie para acessar a mensagem</p>
          </div>

          <div class="link-box">
            <p style="color: #8B5F5F; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Link direto</p>
            <a class="url" href="${data.messageUrl}">${data.messageUrl}</a>
            <br />
            <a href="${data.messageUrl}" class="btn">Visualizar Mensagem</a>
          </div>

          <div class="tips">
            <h4>🌿 Como compartilhar</h4>
            <ul>
              <li>Envie o QR Code por WhatsApp ou redes sociais</li>
              <li>Imprima e coloque em um cartão físico</li>
              <li>Compartilhe o link direto com o destinatário</li>
            </ul>
          </div>

          <div class="footer">
            <p class="name">Paper Bloom</p>
            <p><a href="https://paperbloom.com.br">paperbloom.com.br</a></p>
            <p class="auto">Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `,
};

/**
 * Card Collection email template — Paper Bloom visual identity
 */
export const CARD_COLLECTION_EMAIL_TEMPLATE = {
  subject: (recipientName: string) => 
    `Suas 12 Cartas para ${recipientName} estão prontas 💌`,
  
  html: (data: CardCollectionEmailData) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.7; color: #4A4A4A; margin: 0; padding: 0; background-color: #FFFAFA; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .brand-bar { height: 6px; background: linear-gradient(90deg, #E6C2C2, #D4A5A5, #E6C2C2); }
          .header { text-align: center; padding: 40px 30px 20px; }
          .header .logo { font-family: 'Georgia', serif; font-size: 26px; color: #8B5F5F; letter-spacing: 1px; margin: 0; }
          .header .tagline { font-size: 13px; color: #D4A5A5; margin: 6px 0 0; letter-spacing: 2px; text-transform: uppercase; }
          .divider { width: 60px; height: 1px; background: #E6C2C2; margin: 0 auto; }
          .content { padding: 30px; text-align: center; }
          .content h2 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 22px; font-weight: normal; margin: 0 0 10px; }
          .content p { color: #4A4A4A; font-size: 15px; margin: 8px 0; }
          .hero { margin: 25px 30px; padding: 28px 20px; background: linear-gradient(135deg, #FFFAFA 0%, #f5e6e6 100%); border-radius: 12px; border: 1px solid #E6C2C2; text-align: center; }
          .hero h3 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 18px; font-weight: normal; margin: 0 0 8px; }
          .hero p { color: #4A4A4A; font-size: 14px; margin: 4px 0; }
          .qr-section { text-align: center; margin: 30px 0; padding: 25px; background-color: #FFFAFA; border-radius: 12px; }
          .qr-section img { max-width: 220px; width: 100%; height: auto; border: 2px solid #E6C2C2; padding: 12px; background: #fff; border-radius: 12px; }
          .qr-section p { color: #8B5F5F; font-size: 13px; margin: 12px 0 0; }
          .link-box { background: #FFFAFA; padding: 20px; border-radius: 12px; margin: 20px 30px; border: 1px solid #E6C2C2; text-align: center; }
          .link-box a.url { color: #8B5F5F; text-decoration: none; word-break: break-all; font-size: 14px; }
          .btn { display: inline-block; padding: 14px 32px; background: #D4A5A5; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-size: 15px; font-family: 'Georgia', serif; letter-spacing: 0.5px; margin-top: 16px; }
          .note { margin: 25px 30px; padding: 20px; background: #fdf2f4; border-radius: 12px; border: 1px solid #f0d4d8; text-align: center; }
          .note h4 { color: #8B5F5F; font-family: 'Georgia', serif; font-weight: normal; margin: 0 0 8px; font-size: 15px; }
          .note p { color: #4A4A4A; font-size: 14px; margin: 4px 0; }
          .tips { margin: 25px 30px; padding: 20px; background: #fdf8f4; border-radius: 12px; border: 1px solid #f0ddd0; text-align: left; }
          .tips h4 { color: #8B5F5F; font-family: 'Georgia', serif; font-weight: normal; margin: 0 0 12px; font-size: 15px; }
          .tips ul { margin: 0; padding-left: 18px; }
          .tips li { color: #4A4A4A; font-size: 14px; margin: 6px 0; }
          .how { margin: 25px 30px; padding: 20px; background: #f8f4f0; border-radius: 12px; border: 1px solid #e8ddd4; text-align: left; }
          .how h4 { color: #8B5F5F; font-family: 'Georgia', serif; font-weight: normal; margin: 0 0 12px; font-size: 15px; }
          .how ul { margin: 0; padding-left: 18px; }
          .how li { color: #4A4A4A; font-size: 14px; margin: 6px 0; }
          .footer { text-align: center; padding: 30px; border-top: 1px solid #f0e6e6; }
          .footer .name { color: #8B5F5F; font-family: 'Georgia', serif; font-size: 16px; }
          .footer a { color: #D4A5A5; text-decoration: none; font-size: 13px; }
          .footer .auto { font-size: 11px; color: #c4b0b0; margin-top: 12px; }
          @media only screen and (max-width: 600px) { .content { padding: 20px; } .link-box, .tips, .how, .note, .hero { margin: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand-bar"></div>
          <div class="header">
            <p class="logo">Paper Bloom</p>
            <p class="tagline">Mensagens com emoção</p>
          </div>
          <div class="divider"></div>

          <div class="content">
            <h2>Suas 12 Cartas estão prontas 💌</h2>
            <p>As cartas para <strong>${data.recipientName}</strong> foram criadas com carinho e já podem ser compartilhadas.</p>
          </div>

          <div class="hero">
            <h3>🌸 Uma jornada emocional única</h3>
            <p>12 mensagens especiais que só podem ser abertas uma vez cada</p>
          </div>

          <div class="qr-section">
            <img src="cid:qrcode" alt="QR Code das 12 Cartas para ${data.recipientName}" />
            <p>Escaneie para acessar as cartas</p>
          </div>

          <div class="link-box">
            <p style="color: #8B5F5F; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Link direto</p>
            <a class="url" href="${data.collectionUrl}">${data.collectionUrl}</a>
            <br />
            <a href="${data.collectionUrl}" class="btn">Abrir as 12 Cartas</a>
          </div>

          <div class="note">
            <h4>✨ Experiência única</h4>
            <p>Cada carta só pode ser aberta <strong>uma única vez</strong>.</p>
            <p>Quando ${data.recipientName} abrir uma carta, ela não poderá ser visualizada novamente — tornando cada momento ainda mais especial. 💝</p>
          </div>

          <div class="tips">
            <h4>🌿 Como compartilhar</h4>
            <ul>
              <li>Envie o QR Code por WhatsApp ou redes sociais</li>
              <li>Imprima e coloque em um cartão físico especial</li>
              <li>Compartilhe o link direto com ${data.recipientName}</li>
            </ul>
          </div>

          <div class="how">
            <h4>📖 Como funciona</h4>
            <ul>
              <li>${data.recipientName} verá as 12 cartas disponíveis</li>
              <li>Cada carta tem um título especial ("Abra quando...")</li>
              <li>Ao clicar, a carta será aberta pela primeira e única vez</li>
              <li>As outras cartas continuam disponíveis para quando quiser</li>
            </ul>
          </div>

          <div class="footer">
            <p class="name">Paper Bloom</p>
            <p><a href="https://paperbloom.com.br">paperbloom.com.br</a></p>
            <p class="auto">Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `,
};

/**
 * Payment Confirmation email template — neutral, no recipient name, no QR code
 */
export const PAYMENT_CONFIRMATION_EMAIL_TEMPLATE = {
  subject: 'Seu presente está pronto 💌',

  html: (data: { panelUrl: string; recoverUrl: string }) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.7; color: #4A4A4A; margin: 0; padding: 0; background-color: #FFFAFA; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      .brand-bar { height: 6px; background: linear-gradient(90deg, #E6C2C2, #D4A5A5, #E6C2C2); }
      .header { text-align: center; padding: 40px 30px 20px; }
      .header .logo { font-family: 'Georgia', serif; font-size: 26px; color: #8B5F5F; letter-spacing: 1px; margin: 0; }
      .header .tagline { font-size: 13px; color: #D4A5A5; margin: 6px 0 0; letter-spacing: 2px; text-transform: uppercase; }
      .divider { width: 60px; height: 1px; background: #E6C2C2; margin: 0 auto; }
      .content { padding: 36px 30px; text-align: center; }
      .content h2 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 22px; font-weight: normal; margin: 0 0 16px; }
      .content p { color: #4A4A4A; font-size: 15px; margin: 8px 0; }
      .btn-wrap { margin: 32px 0 24px; }
      .btn { display: inline-block; padding: 16px 40px; background: #D4A5A5; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-size: 16px; font-family: 'Georgia', serif; letter-spacing: 0.5px; }
      .footer { text-align: center; padding: 24px 30px 30px; border-top: 1px solid #f0e6e6; }
      .footer .name { color: #8B5F5F; font-family: 'Georgia', serif; font-size: 15px; margin: 0 0 6px; }
      .footer a { color: #D4A5A5; text-decoration: none; font-size: 13px; }
      .footer .auto { font-size: 11px; color: #c4b0b0; margin-top: 12px; }
      .footer .recover { font-size: 12px; color: #b0a0a0; margin-top: 10px; }
      .footer .recover a { color: #b0a0a0; text-decoration: underline; }
      @media only screen and (max-width: 600px) { .content { padding: 24px 20px; } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="brand-bar"></div>
      <div class="header">
        <p class="logo">Paper Bloom</p>
        <p class="tagline">Mensagens com emoção</p>
      </div>
      <div class="divider"></div>

      <!-- Preheader (hidden) -->
      <span style="display:none;font-size:1px;color:#ffffff;max-height:0;max-width:0;opacity:0;overflow:hidden;">Acesse seu painel para ver e organizar</span>

      <div class="content">
        <h2>Seu presente está pronto 💌</h2>
        <p>Tudo certo! Acesse seu painel para visualizar e organizar o presente.</p>
        <div class="btn-wrap">
          <a href="${data.panelUrl}" class="btn">Acessar painel</a>
        </div>
        <p style="font-size:13px;color:#a09090;">Guarde este email — ele é seu acesso ao painel.</p>
      </div>

      <div class="footer">
        <p class="name">Paper Bloom</p>
        <p><a href="https://paperbloom.com.br">paperbloom.com.br</a></p>
        <p class="auto">Este é um email automático. Por favor, não responda.</p>
        <p class="recover"><a href="${data.recoverUrl}">Perdi meu acesso</a></p>
      </div>
    </div>
  </body>
</html>`,
};

/**
 * Recover Access email template — lists all buyer panels for a given email
 */
export const RECOVER_ACCESS_EMAIL_TEMPLATE = {
  subject: 'Seus painéis Paperbloom',

  html: (data: {
    email: string;
    panels: Array<{ recipientName: string; createdAt: Date; dashboardToken: string }>;
    baseUrl: string;
  }) => {
    const panelRows = data.panels
      .map((p) => {
        const date = p.createdAt.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        const url = `${data.baseUrl}/painel/${p.dashboardToken}`;
        return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #f0e6e6;">
            <p style="margin: 0 0 4px; font-family: 'Georgia', serif; color: #8B5F5F; font-size: 15px;">Para <strong>${p.recipientName}</strong></p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #888;">Comprado em ${date}</p>
            <a href="${url}" style="display: inline-block; padding: 10px 24px; background: #D4A5A5; color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 14px; font-family: 'Georgia', serif;">Acessar painel</a>
          </td>
        </tr>`;
      })
      .join('');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.7; color: #4A4A4A; margin: 0; padding: 0; background-color: #FFFAFA; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      .brand-bar { height: 6px; background: linear-gradient(90deg, #E6C2C2, #D4A5A5, #E6C2C2); }
      .header { text-align: center; padding: 40px 30px 20px; }
      .header .logo { font-family: 'Georgia', serif; font-size: 26px; color: #8B5F5F; letter-spacing: 1px; margin: 0; }
      .header .tagline { font-size: 13px; color: #D4A5A5; margin: 6px 0 0; letter-spacing: 2px; text-transform: uppercase; }
      .divider { width: 60px; height: 1px; background: #E6C2C2; margin: 0 auto; }
      .content { padding: 30px; }
      .content h2 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 20px; font-weight: normal; margin: 0 0 16px; text-align: center; }
      .footer { text-align: center; padding: 24px 30px 30px; border-top: 1px solid #f0e6e6; }
      .footer .name { color: #8B5F5F; font-family: 'Georgia', serif; font-size: 15px; margin: 0 0 6px; }
      .footer a { color: #D4A5A5; text-decoration: none; font-size: 13px; }
      .footer .auto { font-size: 11px; color: #c4b0b0; margin-top: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="brand-bar"></div>
      <div class="header">
        <p class="logo">Paper Bloom</p>
        <p class="tagline">Mensagens com emoção</p>
      </div>
      <div class="divider"></div>

      <div class="content">
        <h2>Seus painéis Paperbloom</h2>
        <p style="font-size: 14px; color: #666; margin: 0 0 20px;">Encontramos as seguintes compras associadas ao seu email:</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tbody>
            ${panelRows}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p class="name">Paper Bloom</p>
        <p><a href="https://paperbloom.com.br">paperbloom.com.br</a></p>
        <p class="auto">Este é um email automático. Por favor, não responda.</p>
      </div>
    </div>
  </body>
</html>`;
  },
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
   * @deprecated Use sendPaymentConfirmationEmail instead
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

  /**
   * Sends neutral payment confirmation email to the buyer.
   * Does not mention the recipient name, QR code, or direct card links.
   * Includes a single CTA button pointing to the buyer's dashboard.
   *
   * @param data - Payment confirmation email data
   * @returns Email send result
   */
  async sendPaymentConfirmationEmail(data: {
    contactEmail: string;
    contactName: string;
    collectionId: string;
    dashboardToken: string;
  }): Promise<EmailSendResult> {
    if (!this.validateConfig()) {
      return { success: false, error: 'Email service not configured properly' };
    }

    console.log('[EmailService] Attempting to send payment confirmation email:', {
      contactEmail: data.contactEmail,
      collectionId: data.collectionId,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await this.sendPaymentConfirmationWithRetry(data, 3);

      console.log('[EmailService] Payment confirmation email sent successfully:', {
        messageId: result.messageId,
        contactEmail: data.contactEmail,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';

      console.error('[EmailService] Payment confirmation email send failed:', {
        error: errorMessage,
        contactEmail: data.contactEmail,
        timestamp: new Date().toISOString(),
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sends payment confirmation email with retry logic and exponential backoff
   */
  private async sendPaymentConfirmationWithRetry(
    data: {
      contactEmail: string;
      contactName: string;
      collectionId: string;
      dashboardToken: string;
    },
    maxRetries: number
  ): Promise<EmailSendResult> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const panelUrl = `${baseUrl}/painel/${data.dashboardToken}`;
    const recoverUrl = `${baseUrl}/recuperar-acesso`;

    const html = PAYMENT_CONFIRMATION_EMAIL_TEMPLATE.html({ panelUrl, recoverUrl });

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[EmailService] Payment confirmation send attempt ${attempt}/${maxRetries}`, {
          contactEmail: data.contactEmail,
        });

        const result = await this.resend.emails.send({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: data.contactEmail,
          subject: PAYMENT_CONFIRMATION_EMAIL_TEMPLATE.subject,
          html,
        });

        if (result.error) {
          console.error('[EmailService] Resend REJECTED payment confirmation:', JSON.stringify(result.error));
          throw new Error(`Resend rejected: ${result.error.message || JSON.stringify(result.error)}`);
        }
        if (!result.data?.id) {
          throw new Error('Resend returned no messageId — treating as failure');
        }

        return { success: true, messageId: result.data.id };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        console.warn(`[EmailService] Payment confirmation attempt ${attempt}/${maxRetries} failed:`, {
          error: lastError.message,
          contactEmail: data.contactEmail,
        });

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to send payment confirmation email after retries');
  }

  /**
   * Sends recover-access email listing all buyer panels for a given email.
   * If panels array is empty, no email is sent.
   *
   * @param email - Buyer's email address
   * @param panels - List of panels to include in the email
   * @returns Email send result
   */
  async sendRecoverAccessEmail(
    email: string,
    panels: Array<{
      recipientName: string;
      createdAt: Date;
      dashboardToken: string;
    }>
  ): Promise<EmailSendResult> {
    if (panels.length === 0) {
      // Nothing to send — return silently
      return { success: true };
    }

    if (!this.validateConfig()) {
      return { success: false, error: 'Email service not configured properly' };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const html = RECOVER_ACCESS_EMAIL_TEMPLATE.html({ email, panels, baseUrl });

    try {
      const result = await this.resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: email,
        subject: RECOVER_ACCESS_EMAIL_TEMPLATE.subject,
        html,
      });

      if (result.error) {
        console.error('[EmailService] Resend REJECTED recover access:', JSON.stringify(result.error));
        throw new Error(`Resend rejected: ${result.error.message || JSON.stringify(result.error)}`);
      }
      if (!result.data?.id) {
        throw new Error('Resend returned no messageId — treating as failure');
      }

      console.log('[EmailService] Recover access email sent successfully:', {
        messageId: result.data.id,
        email,
        panelCount: panels.length,
      });

      return { success: true, messageId: result.data.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      console.error('[EmailService] Recover access email send failed:', { error: errorMessage, email });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sends art delivery email after digital art purchase.
   * Includes Canva template URL, license text and recovery link.
   */
  async sendArtDeliveryEmail(data: ArtDeliveryEmailData): Promise<EmailSendResult> {
    if (!this.validateConfig()) {
      return { success: false, error: 'Email service not configured properly' };
    }

    console.log('[EmailService] Attempting to send art delivery email:', {
      recipientEmail: data.recipientEmail,
      productTitle: data.productTitle,
      timestamp: new Date().toISOString(),
    });

    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.resend.emails.send({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: data.recipientEmail,
          subject: ART_DELIVERY_EMAIL_TEMPLATE.subject(data.productTitle),
          html: ART_DELIVERY_EMAIL_TEMPLATE.html(data),
        });
        if (result.error) {
          console.error('[EmailService] Resend REJECTED art delivery (class):', JSON.stringify(result.error));
          throw new Error(`Resend rejected: ${result.error.message || JSON.stringify(result.error)}`);
        }
        if (!result.data?.id) {
          throw new Error('Resend returned no messageId — treating as failure');
        }
        return { success: true, messageId: result.data.id };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }
    }

    return { success: false, error: lastError?.message || 'Failed to send art delivery email' };
  }

  /**
   * Sends art recovery email with all purchased arts for the given email.
   */
  async sendArtRecoveryEmail(data: ArtRecoveryEmailData): Promise<EmailSendResult> {
    if (!this.validateConfig()) {
      return { success: false, error: 'Email service not configured properly' };
    }

    console.log('[EmailService] Attempting to send art recovery email:', {
      recipientEmail: data.recipientEmail,
      orderCount: data.orders.length,
      timestamp: new Date().toISOString(),
    });

    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.resend.emails.send({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: data.recipientEmail,
          subject: ART_RECOVERY_EMAIL_TEMPLATE.subject(),
          html: ART_RECOVERY_EMAIL_TEMPLATE.html(data),
        });
        if (result.error) {
          console.error('[EmailService] Resend REJECTED art recovery (class):', JSON.stringify(result.error));
          throw new Error(`Resend rejected: ${result.error.message || JSON.stringify(result.error)}`);
        }
        if (!result.data?.id) {
          throw new Error('Resend returned no messageId — treating as failure');
        }
        return { success: true, messageId: result.data.id };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }
    }

    return { success: false, error: lastError?.message || 'Failed to send art recovery email' };
  }
}

/**
 * Gender Reveal email data structure
 */
export interface GenderRevealEmailData {
  recipientEmail: string;
  recipientName: string;
  boyName: string;
  girlName: string;
  dadName: string;
  momName: string;
  publicUrl: string;
  dashboardUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Gender Reveal email template — Paper Bloom visual identity
 */
export const GENDER_REVEAL_EMAIL_TEMPLATE = {
  subject: (boyName: string, girlName: string) => 
    `Sua Revelação Virtual está pronta 🧸 ${boyName} ou ${girlName}?`,
  
  html: (data: GenderRevealEmailData) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.7; color: #4A4A4A; margin: 0; padding: 0; background-color: #FFFAFA; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .brand-bar { height: 6px; background: linear-gradient(90deg, #a8d4e6, #E6C2C2, #a8d4e6); }
          .header { text-align: center; padding: 40px 30px 20px; }
          .header .logo { font-family: 'Georgia', serif; font-size: 26px; color: #8B5F5F; letter-spacing: 1px; margin: 0; }
          .header .tagline { font-size: 13px; color: #D4A5A5; margin: 6px 0 0; letter-spacing: 2px; text-transform: uppercase; }
          .divider { width: 60px; height: 1px; background: #E6C2C2; margin: 0 auto; }
          .content { padding: 30px; text-align: center; }
          .content h2 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 22px; font-weight: normal; margin: 0 0 10px; }
          .content p { color: #4A4A4A; font-size: 15px; margin: 8px 0; }
          .hero { margin: 25px 30px; padding: 28px 20px; background: linear-gradient(135deg, #e8f4fa 0%, #fce8ee 100%); border-radius: 12px; border: 1px solid #E6C2C2; text-align: center; }
          .hero h3 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 20px; font-weight: normal; margin: 0 0 8px; }
          .hero p { color: #4A4A4A; font-size: 14px; margin: 4px 0; }
          .qr-section { text-align: center; margin: 30px 0; padding: 25px; background-color: #FFFAFA; border-radius: 12px; }
          .qr-section img { max-width: 220px; width: 100%; height: auto; border: 2px solid #E6C2C2; padding: 12px; background: #fff; border-radius: 12px; }
          .qr-section p { color: #8B5F5F; font-size: 13px; margin: 12px 0 0; }
          .link-box { background: #FFFAFA; padding: 20px; border-radius: 12px; margin: 20px 30px; border: 1px solid #E6C2C2; text-align: center; }
          .link-box a.url { color: #8B5F5F; text-decoration: none; word-break: break-all; font-size: 14px; }
          .btn { display: inline-block; padding: 14px 32px; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-size: 15px; font-family: 'Georgia', serif; letter-spacing: 0.5px; margin-top: 16px; }
          .btn-pink { background: #D4A5A5; }
          .btn-blue { background: #8bb8d4; }
          .tips { margin: 25px 30px; padding: 20px; background: #fdf8f4; border-radius: 12px; border: 1px solid #f0ddd0; text-align: left; }
          .tips h4 { color: #8B5F5F; font-family: 'Georgia', serif; font-weight: normal; margin: 0 0 12px; font-size: 15px; }
          .tips ul { margin: 0; padding-left: 18px; }
          .tips li { color: #4A4A4A; font-size: 14px; margin: 6px 0; }
          .footer { text-align: center; padding: 30px; border-top: 1px solid #f0e6e6; }
          .footer .name { color: #8B5F5F; font-family: 'Georgia', serif; font-size: 16px; }
          .footer a { color: #D4A5A5; text-decoration: none; font-size: 13px; }
          .footer .auto { font-size: 11px; color: #c4b0b0; margin-top: 12px; }
          @media only screen and (max-width: 600px) { .content { padding: 20px; } .link-box, .tips { margin: 20px 15px; } .hero { margin: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand-bar"></div>
          <div class="header">
            <p class="logo">Paper Bloom</p>
            <p class="tagline">Mensagens com emoção</p>
          </div>
          <div class="divider"></div>

          <div class="content">
            <h2>Revelação Virtual pronta 🧸</h2>
            <p>Olá, ${data.recipientName}</p>
            <p>A revelação do sexo do bebê de <strong>${data.dadName} & ${data.momName}</strong> está pronta para ser compartilhada.</p>
          </div>

          <div class="hero">
            <h3>💙 ${data.boyName} ou ${data.girlName}? 💖</h3>
            <p>Compartilhe com família e amigos para descobrirem juntos</p>
          </div>

          <div class="qr-section">
            <img src="cid:qrcode" alt="QR Code da Revelação Virtual" />
            <p>Escaneie para acessar a revelação</p>
          </div>

          <div class="link-box">
            <p style="color: #8B5F5F; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Link para convidados</p>
            <a class="url" href="${data.publicUrl}">${data.publicUrl}</a>
            <br />
            <a href="${data.publicUrl}" class="btn btn-pink">Abrir Revelação</a>
          </div>

          <div class="link-box">
            <p style="color: #8B5F5F; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Seu dashboard privado</p>
            <a class="url" href="${data.dashboardUrl}">${data.dashboardUrl}</a>
            <br />
            <a href="${data.dashboardUrl}" class="btn btn-blue">Ver Dashboard</a>
          </div>

          <div class="tips">
            <h4>🌿 Como funciona</h4>
            <ul>
              <li>Compartilhe o link para convidados com todos</li>
              <li>Eles vão poder dar palpites e deixar mensagens</li>
              <li>No final, a revelação acontece com confetes</li>
              <li>Use o dashboard para ver todos os votos e mensagens</li>
            </ul>
          </div>

          <div class="footer">
            <p class="name">Paper Bloom</p>
            <p><a href="https://paperbloom.com.br">paperbloom.com.br</a></p>
            <p class="auto">Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `,
};

export interface BabyShowerEmailData {
  recipientEmail: string;
  recipientName: string;
  hostName: string;
  partnerName?: string | null;
  babyName?: string | null;
  publicUrl: string;
  dashboardUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Baby Shower ("Chá de Fralda") email template — Paper Bloom visual identity
 */
export const BABY_SHOWER_EMAIL_TEMPLATE = {
  subject: (hostName: string) =>
    `Seu Chá de Fralda está pronto 🍼 — convide quem você ama, ${hostName}!`,

  html: (data: BabyShowerEmailData) => {
    const parents = data.partnerName ? `${data.hostName} & ${data.partnerName}` : data.hostName;
    const babyLine = data.babyName ? `do(a) ${data.babyName}` : 'do bebê';
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.7; color: #4A4A4A; margin: 0; padding: 0; background-color: #FFFAFA; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .brand-bar { height: 6px; background: linear-gradient(90deg, #E6C2C2, #f3dede, #E6C2C2); }
          .header { text-align: center; padding: 40px 30px 20px; }
          .header .logo { font-family: 'Georgia', serif; font-size: 26px; color: #8B5F5F; letter-spacing: 1px; margin: 0; }
          .header .tagline { font-size: 13px; color: #D4A5A5; margin: 6px 0 0; letter-spacing: 2px; text-transform: uppercase; }
          .divider { width: 60px; height: 1px; background: #E6C2C2; margin: 0 auto; }
          .content { padding: 30px; text-align: center; }
          .content h2 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 22px; font-weight: normal; margin: 0 0 10px; }
          .content p { color: #4A4A4A; font-size: 15px; margin: 8px 0; }
          .hero { margin: 25px 30px; padding: 28px 20px; background: linear-gradient(135deg, #fce8ee 0%, #fdf3ea 100%); border-radius: 12px; border: 1px solid #E6C2C2; text-align: center; }
          .hero h3 { font-family: 'Georgia', serif; color: #8B5F5F; font-size: 20px; font-weight: normal; margin: 0 0 8px; }
          .hero p { color: #4A4A4A; font-size: 14px; margin: 4px 0; }
          .qr-section { text-align: center; margin: 30px 0; padding: 25px; background-color: #FFFAFA; border-radius: 12px; }
          .qr-section img { max-width: 220px; width: 100%; height: auto; border: 2px solid #E6C2C2; padding: 12px; background: #fff; border-radius: 12px; }
          .qr-section p { color: #8B5F5F; font-size: 13px; margin: 12px 0 0; }
          .link-box { background: #FFFAFA; padding: 20px; border-radius: 12px; margin: 20px 30px; border: 1px solid #E6C2C2; text-align: center; }
          .link-box a.url { color: #8B5F5F; text-decoration: none; word-break: break-all; font-size: 14px; }
          .btn { display: inline-block; padding: 14px 32px; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-size: 15px; font-family: 'Georgia', serif; letter-spacing: 0.5px; margin-top: 16px; }
          .btn-pink { background: #D4A5A5; }
          .btn-rose { background: #c98f9b; }
          .tips { margin: 25px 30px; padding: 20px; background: #fdf8f4; border-radius: 12px; border: 1px solid #f0ddd0; text-align: left; }
          .tips h4 { color: #8B5F5F; font-family: 'Georgia', serif; font-weight: normal; margin: 0 0 12px; font-size: 15px; }
          .tips ul { margin: 0; padding-left: 18px; }
          .tips li { color: #4A4A4A; font-size: 14px; margin: 6px 0; }
          .footer { text-align: center; padding: 30px; border-top: 1px solid #f0e6e6; }
          .footer .name { color: #8B5F5F; font-family: 'Georgia', serif; font-size: 16px; }
          .footer a { color: #D4A5A5; text-decoration: none; font-size: 13px; }
          .footer .auto { font-size: 11px; color: #c4b0b0; margin-top: 12px; }
          @media only screen and (max-width: 600px) { .content { padding: 20px; } .link-box, .tips { margin: 20px 15px; } .hero { margin: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand-bar"></div>
          <div class="header">
            <p class="logo">Paper Bloom</p>
            <p class="tagline">Mensagens com emoção</p>
          </div>
          <div class="divider"></div>

          <div class="content">
            <h2>Seu Chá de Fralda está pronto 🍼</h2>
            <p>Olá, ${data.recipientName}</p>
            <p>O convite do chá de fralda ${babyLine} de <strong>${parents}</strong> está pronto para ser compartilhado.</p>
          </div>

          <div class="hero">
            <h3>🧸 Convide quem você ama</h3>
            <p>Os convidados confirmam presença, escolhem um presente da lista e deixam um recado carinhoso</p>
          </div>

          <div class="qr-section">
            <img src="cid:qrcode" alt="QR Code do Chá de Fralda" />
            <p>Escaneie para acessar o convite</p>
          </div>

          <div class="link-box">
            <p style="color: #8B5F5F; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Link para convidados</p>
            <a class="url" href="${data.publicUrl}">${data.publicUrl}</a>
            <br />
            <a href="${data.publicUrl}" class="btn btn-pink">Abrir Convite</a>
          </div>

          <div class="link-box">
            <p style="color: #8B5F5F; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Seu painel privado</p>
            <a class="url" href="${data.dashboardUrl}">${data.dashboardUrl}</a>
            <br />
            <a href="${data.dashboardUrl}" class="btn btn-rose">Ver Painel</a>
          </div>

          <div class="tips">
            <h4>🌿 Como funciona</h4>
            <ul>
              <li>Compartilhe o link para convidados com todos</li>
              <li>Eles confirmam presença e reservam um presente da lista</li>
              <li>Cada presente reservado some da lista, evitando repetições</li>
              <li>Use o painel para ver confirmações, presentes e recados</li>
            </ul>
          </div>

          <div class="footer">
            <p class="name">Paper Bloom</p>
            <p><a href="https://paperbloom.com.br">paperbloom.com.br</a></p>
            <p class="auto">Este é um email automático. Por favor, não responda.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  },
};

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
  /**
   * @deprecated Use sendPaymentConfirmationEmail instead
   */
  sendCardCollectionEmail: (data: CardCollectionEmailData) => emailService.instance.sendCardCollectionEmail(data),
  sendPaymentConfirmationEmail: (data: {
    contactEmail: string;
    contactName: string;
    collectionId: string;
    dashboardToken: string;
  }) => emailService.instance.sendPaymentConfirmationEmail(data),
  sendRecoverAccessEmail: (
    email: string,
    panels: Array<{ recipientName: string; createdAt: Date; dashboardToken: string }>
  ) => emailService.instance.sendRecoverAccessEmail(email, panels),
  sendGenderRevealEmail: async (data: GenderRevealEmailData): Promise<EmailSendResult> => {
    const instance = emailService.instance;
    if (!instance.validateConfig()) {
      return { success: false, error: 'Email service not configured properly' };
    }
    
    try {
      const result = await instance['resend'].emails.send({
        from: `${instance['config'].fromName} <${instance['config'].fromEmail}>`,
        to: data.recipientEmail,
        subject: GENDER_REVEAL_EMAIL_TEMPLATE.subject(data.boyName, data.girlName),
        html: GENDER_REVEAL_EMAIL_TEMPLATE.html(data),
        attachments: [
          {
            filename: 'qrcode.png',
            content: data.qrCodeDataUrl.split(',')[1],
            contentId: 'qrcode',
          },
        ],
      });

      if (result.error) {
        console.error('[EmailService] Resend REJECTED gender reveal:', JSON.stringify(result.error));
        return { success: false, error: result.error.message || JSON.stringify(result.error) };
      }
      if (!result.data?.id) {
        return { success: false, error: 'Resend returned no messageId' };
      }

      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error('[EmailService] Gender reveal email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    }
  },
  sendBabyShowerEmail: async (data: BabyShowerEmailData): Promise<EmailSendResult> => {
    const instance = emailService.instance;
    if (!instance.validateConfig()) {
      return { success: false, error: 'Email service not configured properly' };
    }

    try {
      const result = await instance['resend'].emails.send({
        from: `${instance['config'].fromName} <${instance['config'].fromEmail}>`,
        to: data.recipientEmail,
        subject: BABY_SHOWER_EMAIL_TEMPLATE.subject(data.hostName),
        html: BABY_SHOWER_EMAIL_TEMPLATE.html(data),
        attachments: [
          {
            filename: 'qrcode.png',
            content: data.qrCodeDataUrl.split(',')[1],
            contentId: 'qrcode',
          },
        ],
      });

      if (result.error) {
        console.error('[EmailService] Resend REJECTED baby shower:', JSON.stringify(result.error));
        return { success: false, error: result.error.message || JSON.stringify(result.error) };
      }
      if (!result.data?.id) {
        return { success: false, error: 'Resend returned no messageId' };
      }

      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error('[EmailService] Baby shower email failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    }
  },
  validateConfig: () => emailService.instance.validateConfig(),

  /**
   * Sends art delivery email after digital art purchase.
   * Includes Canva template URL and license text.
   */
  sendArtDeliveryEmail: async (data: ArtDeliveryEmailData): Promise<EmailSendResult> => {
    const instance = emailService.instance;
    if (!instance.validateConfig()) {
      return { success: false, error: 'Email service not configured properly' };
    }

    console.log('[EmailService] Attempting to send art delivery email:', {
      recipientEmail: data.recipientEmail,
      productTitle: data.productTitle,
      timestamp: new Date().toISOString(),
    });

    let lastError: Error | null = null;
    const maxRetries = 3;
    const resend = (instance as unknown as { resend: Resend }).resend;
    const config = (instance as unknown as { config: { fromName: string; fromEmail: string } }).config;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[EmailService] Art delivery send attempt ${attempt}/${maxRetries}`, {
          recipientEmail: data.recipientEmail,
        });

        const result = await resend.emails.send({
          from: `${config.fromName} <${config.fromEmail}>`,
          to: data.recipientEmail,
          subject: ART_DELIVERY_EMAIL_TEMPLATE.subject(data.productTitle),
          html: ART_DELIVERY_EMAIL_TEMPLATE.html(data),
        });

        if (result.error) {
          console.error('[EmailService] Resend REJECTED art delivery:', JSON.stringify(result.error));
          throw new Error(`Resend rejected: ${result.error.message || JSON.stringify(result.error)}`);
        }

        if (!result.data?.id) {
          console.error('[EmailService] Resend returned no messageId for art delivery:', JSON.stringify(result));
          throw new Error('Resend returned no messageId — treating as failure');
        }

        console.log('[EmailService] Art delivery email sent:', {
          messageId: result.data.id,
          recipientEmail: data.recipientEmail,
        });

        return { success: true, messageId: result.data.id };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`[EmailService] Art delivery attempt ${attempt}/${maxRetries} failed:`, {
          error: lastError.message,
          recipientEmail: data.recipientEmail,
        });
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    const errorMessage = lastError?.message || 'Failed to send art delivery email';
    console.error('[EmailService] Art delivery email failed after retries:', { recipientEmail: data.recipientEmail });
    return { success: false, error: errorMessage };
  },

  /**
   * Sends art recovery email with all purchased arts for the given email.
   */
  sendArtRecoveryEmail: async (data: ArtRecoveryEmailData): Promise<EmailSendResult> => {
    const instance = emailService.instance;
    if (!instance.validateConfig()) {
      return { success: false, error: 'Email service not configured properly' };
    }

    console.log('[EmailService] Attempting to send art recovery email:', {
      recipientEmail: data.recipientEmail,
      orderCount: data.orders.length,
      timestamp: new Date().toISOString(),
    });

    let lastError: Error | null = null;
    const maxRetries = 3;
    const resend = (instance as unknown as { resend: Resend }).resend;
    const config = (instance as unknown as { config: { fromName: string; fromEmail: string } }).config;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[EmailService] Art recovery send attempt ${attempt}/${maxRetries}`, {
          recipientEmail: data.recipientEmail,
        });

        const result = await resend.emails.send({
          from: `${config.fromName} <${config.fromEmail}>`,
          to: data.recipientEmail,
          subject: ART_RECOVERY_EMAIL_TEMPLATE.subject(),
          html: ART_RECOVERY_EMAIL_TEMPLATE.html(data),
        });

        if (result.error) {
          console.error('[EmailService] Resend REJECTED art recovery:', JSON.stringify(result.error));
          throw new Error(`Resend rejected: ${result.error.message || JSON.stringify(result.error)}`);
        }

        if (!result.data?.id) {
          console.error('[EmailService] Resend returned no messageId for art recovery:', JSON.stringify(result));
          throw new Error('Resend returned no messageId — treating as failure');
        }

        console.log('[EmailService] Art recovery email sent:', {
          messageId: result.data.id,
          recipientEmail: data.recipientEmail,
        });

        return { success: true, messageId: result.data.id };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`[EmailService] Art recovery attempt ${attempt}/${maxRetries} failed:`, {
          error: lastError.message,
          recipientEmail: data.recipientEmail,
        });
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    const errorMessage = lastError?.message || 'Failed to send art recovery email';
    console.error('[EmailService] Art recovery email failed after retries:', { recipientEmail: data.recipientEmail });
    return { success: false, error: errorMessage };
  },
};
