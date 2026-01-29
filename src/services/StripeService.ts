import Stripe from 'stripe';

/**
 * StripeService
 * Handles all Stripe payment processing operations
 * Requirements: 2.1, 2.5
 */
export class StripeService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    // Initialize Stripe SDK with secret key
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
    });
  }

  /**
   * Create a Stripe checkout session for a message or card collection
   * Requirement: 2.1, 6.1, 6.2
   * 
   * @param itemId - UUID of the message or card collection to create checkout for
   * @param amount - Amount in cents (e.g., 1990 for R$ 19.90, 2990 for R$ 29.90)
   * @param contactInfo - Optional contact information for email delivery
   * @param productType - Type of product: 'message' or 'card-collection'
   * @returns Object containing session ID and checkout URL
   * @throws Error if session creation fails
   */
  async createCheckoutSession(
    itemId: string,
    amount: number,
    contactInfo?: {
      contactName?: string;
      contactEmail?: string;
      contactPhone?: string;
    },
    productType: 'message' | 'card-collection' = 'message'
  ): Promise<{ sessionId: string; url: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    try {
      const metadata: Record<string, string> = {
        productType, // Store product type to differentiate in webhook
      };

      // Store appropriate ID based on product type
      if (productType === 'message') {
        metadata.messageId = itemId; // Store messageId in session metadata (Requirement 2.1)
      } else {
        metadata.collectionId = itemId; // Store collectionId in session metadata (Requirement 6.1)
      }

      // Add contact info to metadata if provided
      if (contactInfo?.contactName) {
        metadata.contactName = contactInfo.contactName;
      }
      if (contactInfo?.contactEmail) {
        metadata.contactEmail = contactInfo.contactEmail;
      }
      if (contactInfo?.contactPhone) {
        metadata.contactPhone = contactInfo.contactPhone;
      }

      // Set product details based on type
      const productDetails = productType === 'message' 
        ? {
            name: 'Paper Bloom Digital - Mensagem Personalizada',
            description: 'Presente digital personalizado com mensagem, foto e música',
          }
        : {
            name: 'Paper Bloom Digital - 12 Cartas',
            description: 'Jornada emocional única com 12 mensagens personalizadas',
          };

      // Set cancel URL based on product type
      const cancelUrl = productType === 'message'
        ? `${baseUrl}/editor/mensagem`
        : `${baseUrl}/editor/12-cartas`;

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'], // Apenas cartão por enquanto
        // Para ativar PIX quando disponível, adicione 'pix' ao array acima
        // payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: productDetails,
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata,
        // Collect customer email if not provided in metadata
        customer_email: contactInfo?.contactEmail,
        // Configurações para PIX (descomente quando PIX estiver disponível)
        // 
        // },
      });

      if (!session.id || !session.url) {
        throw new Error('Failed to create checkout session: missing session ID or URL');
      }

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(
        `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verify the signature of a Stripe webhook event
   * Requirement: 2.5
   * 
   * @param payload - Raw request body as string
   * @param signature - Stripe signature from request headers
   * @returns true if signature is valid, false otherwise
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    try {
      // Verify webhook signature using Stripe's library
      this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return true;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Construct and return a Stripe webhook event
   * Used after signature verification
   * Requirement: 2.5
   * 
   * @param payload - Raw request body as string
   * @param signature - Stripe signature from request headers
   * @returns Stripe event object
   * @throws Error if signature verification fails
   */
  constructWebhookEvent(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error('Failed to construct webhook event:', error);
      throw new Error(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Handle successful payment from Stripe webhook
   * Extracts messageId from session metadata
   * Requirement: 2.2, 2.3
   * 
   * @param session - Stripe checkout session object
   * @returns messageId from session metadata
   * @throws Error if messageId is not found in metadata
   */
  handleSuccessfulPayment(session: Stripe.Checkout.Session): string {
    const messageId = session.metadata?.messageId;

    if (!messageId) {
      throw new Error('Message ID not found in session metadata');
    }

    return messageId;
  }

  /**
   * Retrieve a checkout session by ID
   * Useful for verifying session details
   * 
   * @param sessionId - Stripe checkout session ID
   * @returns Stripe checkout session object
   * @throws Error if session retrieval fails
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      throw new Error(
        `Failed to retrieve checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();
