/**
 * Integration tests for POST /api/checkout/create-session
 * Tests the complete flow of creating a Stripe checkout session
 * 
 * Requirements: 2.1
 */

import { POST } from '../route';
import { NextRequest } from 'next/server';
import { messageService } from '@/services/MessageService';
import { stripeService } from '@/services/StripeService';

describe('POST /api/checkout/create-session', () => {
  let testMessageId: string;

  beforeAll(async () => {
    // Create a test message for checkout
    const message = await messageService.create({
      recipientName: 'Test Recipient',
      senderName: 'Test Sender',
      messageText: 'Test message for checkout',
    });
    testMessageId = message.id;
  });

  it('should create a checkout session for a valid pending message', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        messageId: testMessageId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('sessionId');
    expect(data).toHaveProperty('url');
    expect(data.sessionId).toMatch(/^cs_/); // Stripe session IDs start with cs_
    expect(data.url).toContain('checkout.stripe.com');

    // Verify message was updated with session ID
    const updatedMessage = await messageService.findById(testMessageId);
    expect(updatedMessage?.stripeSessionId).toBe(data.sessionId);
  });

  it('should return 400 for invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_JSON');
  });

  it('should return 400 for invalid messageId format', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        messageId: 'not-a-uuid',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details).toHaveProperty('messageId');
  });

  it('should return 404 for non-existent message', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        messageId: '00000000-0000-0000-0000-000000000000',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('MESSAGE_NOT_FOUND');
  });

  it('should return 400 for already paid message', async () => {
    // Create a message and mark it as paid
    const paidMessage = await messageService.create({
      recipientName: 'Paid Recipient',
      senderName: 'Paid Sender',
      messageText: 'Already paid message',
    });
    await messageService.updateStatus(paidMessage.id, 'paid');

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        messageId: paidMessage.id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('MESSAGE_ALREADY_PAID');
  });

  it('should include CORS headers in response', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        messageId: testMessageId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('should store messageId in Stripe session metadata', async () => {
    // Create a new message for this test
    const message = await messageService.create({
      recipientName: 'Metadata Test',
      senderName: 'Test Sender',
      messageText: 'Testing metadata',
    });

    const request = new NextRequest('http://localhost:3000/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify({
        messageId: message.id,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    // Retrieve the session from Stripe and verify metadata
    const session = await stripeService.getCheckoutSession(data.sessionId);
    expect(session.metadata?.messageId).toBe(message.id);
  });
});
