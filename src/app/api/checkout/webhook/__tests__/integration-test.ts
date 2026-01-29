/**
 * Integration tests for POST /api/checkout/webhook
 * Tests the complete flow of processing Stripe webhook events
 * 
 * Requirements: 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3
 */

import { POST } from '../route';
import { NextRequest } from 'next/server';
import { messageService } from '@/services/MessageService';
import Stripe from 'stripe';

describe('POST /api/checkout/webhook', () => {
  let testMessageId: string;
  let stripe: Stripe;

  beforeAll(async () => {
    // Initialize Stripe for testing
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not set');
    }
    stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
    });

    // Create a test message
    const message = await messageService.create({
      recipientName: 'João Silva',
      senderName: 'Maria Santos',
      messageText: 'Test message for webhook',
    });
    testMessageId = message.id;
  });

  it('should return 400 when stripe-signature header is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/webhook', {
      method: 'POST',
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('MISSING_SIGNATURE');
  });

  it('should return 400 for invalid webhook signature', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/webhook', {
      method: 'POST',
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: {} },
      }),
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'invalid_signature',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_SIGNATURE');
  });

  it('should return 200 for valid webhook with unknown event type', async () => {
    // Create a valid webhook signature for an unknown event type
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not set');
    }

    const payload = JSON.stringify({
      type: 'unknown.event.type',
      data: { object: {} },
    });

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    const request = new NextRequest('http://localhost:3000/api/checkout/webhook', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
  });

  it('should process checkout.session.completed event successfully', async () => {
    // Create a checkout session for the test message
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Test Product',
            },
            unit_amount: 1990,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/editor`,
      metadata: {
        messageId: testMessageId,
      },
    });

    // Update message with session ID
    await messageService.updateStripeSession(testMessageId, session.id);

    // Create webhook event payload
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not set');
    }

    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: session,
      },
    });

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    const request = new NextRequest('http://localhost:3000/api/checkout/webhook', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);

    // Verify message was updated
    const updatedMessage = await messageService.findById(testMessageId);
    expect(updatedMessage?.status).toBe('paid');
    expect(updatedMessage?.slug).toBeTruthy();
    expect(updatedMessage?.slug).toMatch(/^\/mensagem\/joao-silva\//);
    expect(updatedMessage?.qrCodeUrl).toBeTruthy();
    expect(updatedMessage?.qrCodeUrl).toContain('/uploads/qrcodes/');
  });

  it('should return 404 when message is not found', async () => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not set');
    }

    // Create a session with non-existent message ID
    const fakeSession = {
      id: 'cs_test_fake',
      metadata: {
        messageId: '00000000-0000-0000-0000-000000000000',
      },
    };

    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: fakeSession,
      },
    });

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    const request = new NextRequest('http://localhost:3000/api/checkout/webhook', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('MESSAGE_NOT_FOUND');
  });

  it('should handle special characters in recipient name for slug generation', async () => {
    // Create a message with special characters
    const specialMessage = await messageService.create({
      recipientName: 'José María Ñoño',
      senderName: 'Test Sender',
      messageText: 'Testing special characters',
    });

    // Create a checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Test Product',
            },
            unit_amount: 1990,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/editor`,
      metadata: {
        messageId: specialMessage.id,
      },
    });

    await messageService.updateStripeSession(specialMessage.id, session.id);

    // Create webhook event
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not set');
    }

    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: session,
      },
    });

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    const request = new NextRequest('http://localhost:3000/api/checkout/webhook', {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify slug was normalized correctly
    const updatedMessage = await messageService.findById(specialMessage.id);
    expect(updatedMessage?.slug).toMatch(/^\/mensagem\/jose-maria-nono\//);
  });
});
