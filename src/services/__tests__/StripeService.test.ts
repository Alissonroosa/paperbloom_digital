import { StripeService } from '../StripeService';

describe('StripeService', () => {
  let stripeService: StripeService;

  beforeEach(() => {
    // Ensure environment variables are set for tests
    if (!process.env.STRIPE_SECRET_KEY) {
      process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_initialization';
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret';
    }
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
    }
  });

  describe('Initialization', () => {
    it('should initialize with valid Stripe secret key', () => {
      expect(() => new StripeService()).not.toThrow();
    });

    it('should throw error if STRIPE_SECRET_KEY is not set', () => {
      const originalKey = process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_SECRET_KEY;

      expect(() => new StripeService()).toThrow('STRIPE_SECRET_KEY environment variable is not set');

      process.env.STRIPE_SECRET_KEY = originalKey;
    });
  });

  describe('createCheckoutSession', () => {
    it('should have createCheckoutSession method', () => {
      stripeService = new StripeService();
      expect(stripeService.createCheckoutSession).toBeDefined();
      expect(typeof stripeService.createCheckoutSession).toBe('function');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should have verifyWebhookSignature method', () => {
      stripeService = new StripeService();
      expect(stripeService.verifyWebhookSignature).toBeDefined();
      expect(typeof stripeService.verifyWebhookSignature).toBe('function');
    });

    it('should throw error if STRIPE_WEBHOOK_SECRET is not set', () => {
      stripeService = new StripeService();
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      expect(() => stripeService.verifyWebhookSignature('payload', 'signature')).toThrow(
        'STRIPE_WEBHOOK_SECRET environment variable is not set'
      );

      process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    });
  });

  describe('handleSuccessfulPayment', () => {
    it('should extract messageId from session metadata', () => {
      stripeService = new StripeService();
      const mockSession = {
        id: 'cs_test_123',
        metadata: {
          messageId: 'test-message-id-123',
        },
      } as any;

      const messageId = stripeService.handleSuccessfulPayment(mockSession);
      expect(messageId).toBe('test-message-id-123');
    });

    it('should throw error if messageId is not in metadata', () => {
      stripeService = new StripeService();
      const mockSession = {
        id: 'cs_test_123',
        metadata: {},
      } as any;

      expect(() => stripeService.handleSuccessfulPayment(mockSession)).toThrow(
        'Message ID not found in session metadata'
      );
    });

    it('should throw error if metadata is undefined', () => {
      stripeService = new StripeService();
      const mockSession = {
        id: 'cs_test_123',
      } as any;

      expect(() => stripeService.handleSuccessfulPayment(mockSession)).toThrow(
        'Message ID not found in session metadata'
      );
    });
  });

  describe('constructWebhookEvent', () => {
    it('should have constructWebhookEvent method', () => {
      stripeService = new StripeService();
      expect(stripeService.constructWebhookEvent).toBeDefined();
      expect(typeof stripeService.constructWebhookEvent).toBe('function');
    });
  });

  describe('getCheckoutSession', () => {
    it('should have getCheckoutSession method', () => {
      stripeService = new StripeService();
      expect(stripeService.getCheckoutSession).toBeDefined();
      expect(typeof stripeService.getCheckoutSession).toBe('function');
    });
  });
});
