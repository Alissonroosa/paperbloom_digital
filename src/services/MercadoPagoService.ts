import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { getProduct, type ProductType } from '@/config/products';
import { priceService } from './PriceService';

/**
 * MercadoPagoService
 * Handles all Mercado Pago payment processing operations (Checkout Pro)
 */
export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private preference: Preference;
  private payment: Payment;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN environment variable is not set');
    }

    this.client = new MercadoPagoConfig({ accessToken });
    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);
  }

  /**
   * Create a Mercado Pago Checkout Pro preference
   */
  async createCheckoutSession(
    itemId: string,
    productType: ProductType,
    contactInfo?: {
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
    }
  ): Promise<{ preferenceId: string; url: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const product = getProduct(productType);
    
    // Buscar preço dinâmico do banco de dados
    const dynamicPrice = await priceService.getEffectivePrice(productType);
    const priceInCents = dynamicPrice.priceCents;

    try {
      const metadata: Record<string, string> = { productType };

      if (productType === 'message') {
        metadata.messageId = itemId;
      } else if (productType === 'gender-reveal') {
        metadata.revealId = itemId;
      } else if (productType === 'baby-shower') {
        metadata.babyShowerId = itemId;
      } else {
        metadata.collectionId = itemId;
      }

      if (contactInfo?.contactName) metadata.contactName = contactInfo.contactName;
      if (contactInfo?.contactEmail) metadata.contactEmail = contactInfo.contactEmail;
      if (contactInfo?.contactPhone) metadata.contactPhone = contactInfo.contactPhone;

      // Mercado Pago requires public URLs for back_urls and notification_url
      // In development (localhost), we omit auto_return and notification_url
      const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

      const preferenceBody: Record<string, unknown> = {
        items: [
          {
            id: product.id,
            title: product.name,
            description: product.description,
            quantity: 1,
            unit_price: priceInCents / 100, // MP uses BRL, not cents - usando preço dinâmico
            currency_id: 'BRL',
          },
        ],
        metadata,
        statement_descriptor: 'PAPERBLOOM',
        // Note: Removed payment_methods restrictions as they can cause issues with test cards
        // For test mode, we need a test buyer email (different from seller account)
        payer: contactInfo?.contactEmail
          ? { 
              email: contactInfo.contactEmail,
              name: contactInfo.contactName || undefined,
            }
          : undefined,
      };

      // Only set back_urls and auto_return for public URLs
      if (!isLocalhost) {
        preferenceBody.back_urls = {
          success: `${baseUrl}/success`,
          failure: `${baseUrl}${product.editorPath}`,
          pending: `${baseUrl}/success`,
        };
        preferenceBody.auto_return = 'approved';
        preferenceBody.notification_url = `${baseUrl}/api/checkout/webhook`;
      }

      const result = await this.preference.create({
        body: preferenceBody as Parameters<Preference['create']>[0]['body'],
      });

      if (!result.id || !result.init_point) {
        throw new Error('Failed to create preference: missing ID or URL');
      }

      return {
        preferenceId: result.id,
        url: result.init_point,
      };
    } catch (error) {
      console.error('Error creating checkout preference:', error);
      throw new Error(
        `Failed to create checkout: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a Mercado Pago Checkout Pro preference for a digital art order.
   * Back URLs redirect to /loja/sucesso/[orderId] on success/pending and /loja on failure.
   */
  async createCheckoutSessionForArt(
    orderId: string,
    options: {
      artTitle: string;
      priceInCents: number;
      payerEmail: string;
      payerName?: string;
    }
  ): Promise<{ preferenceId: string; url: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

    const { artTitle, priceInCents, payerEmail, payerName } = options;

    try {
      const preferenceBody: Record<string, unknown> = {
        items: [
          {
            id: orderId,
            title: artTitle,
            description: 'Arte digital para download via Canva',
            quantity: 1,
            unit_price: priceInCents / 100,
            currency_id: 'BRL',
          },
        ],
        metadata: {
          productType: 'digital-art',
          orderId,
        },
        statement_descriptor: 'PAPERBLOOM',
        payer: {
          email: payerEmail,
          name: payerName || undefined,
        },
      };

      if (!isLocalhost) {
        preferenceBody.back_urls = {
          success: `${baseUrl}/loja/sucesso/${orderId}`,
          failure: `${baseUrl}/loja`,
          pending: `${baseUrl}/loja/sucesso/${orderId}`,
        };
        preferenceBody.auto_return = 'approved';
        preferenceBody.notification_url = `${baseUrl}/api/checkout/webhook`;
      }

      const result = await this.preference.create({
        body: preferenceBody as Parameters<Preference['create']>[0]['body'],
      });

      if (!result.id || !result.init_point) {
        throw new Error('Failed to create art preference: missing ID or URL');
      }

      return {
        preferenceId: result.id,
        url: result.init_point,
      };
    } catch (error) {
      console.error('Error creating art checkout preference:', error);
      throw new Error(
        `Failed to create art checkout: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get payment details by ID
   */
  async getPayment(paymentId: string | number): Promise<{
    id: number;
    status: string;
    metadata: Record<string, string>;
    payer: { email?: string };
  }> {
    try {
      const result = await this.payment.get({ id: Number(paymentId) });

      return {
        id: result.id!,
        status: result.status || 'unknown',
        metadata: (result.metadata || {}) as Record<string, string>,
        payer: {
          email: result.payer?.email || undefined,
        },
      };
    } catch (error) {
      console.error('Error retrieving payment:', error);
      throw new Error(
        `Failed to retrieve payment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate webhook signature using HMAC-SHA256
   */
  validateWebhookSignature(
    xSignature: string | null,
    xRequestId: string | null,
    dataId: string | null
  ): boolean {
    if (!xSignature || !xRequestId) return false;

    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('MERCADOPAGO_WEBHOOK_SECRET not set');
      return false;
    }

    try {
      // Parse x-signature header: ts=xxx,v1=xxx
      const parts: Record<string, string> = {};
      xSignature.split(',').forEach((part) => {
        const [key, value] = part.split('=');
        if (key && value) parts[key.trim()] = value.trim();
      });

      const ts = parts['ts'];
      const v1 = parts['v1'];

      if (!ts || !v1) return false;

      // Build the manifest string
      const manifest = `id:${dataId || ''};request-id:${xRequestId};ts:${ts};`;

      // Generate HMAC
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(manifest);
      const generatedHash = hmac.digest('hex');

      return generatedHash === v1;
    } catch (error) {
      console.error('Webhook signature validation error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mercadoPagoService = new MercadoPagoService();
