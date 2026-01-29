# Services

This directory contains the service layer for the Paper Bloom backend application.

## StripeService

Handles all Stripe payment processing operations.

**Requirements:** 2.1, 2.5

### Methods

#### `createCheckoutSession(messageId: string, amount: number)`
Creates a Stripe checkout session for a message payment.

- **Parameters:**
  - `messageId`: UUID of the message to create checkout for
  - `amount`: Amount in cents (e.g., 2999 for $29.99)
- **Returns:** `{ sessionId: string; url: string }`
- **Throws:** Error if session creation fails

**Requirement 2.1:** Stores messageId in session metadata for tracking.

#### `verifyWebhookSignature(payload: string, signature: string)`
Verifies the signature of a Stripe webhook event.

- **Parameters:**
  - `payload`: Raw request body as string
  - `signature`: Stripe signature from request headers
- **Returns:** `boolean` - true if signature is valid, false otherwise

**Requirement 2.5:** Validates webhook signatures using Stripe's library.

#### `constructWebhookEvent(payload: string, signature: string)`
Constructs and returns a Stripe webhook event after signature verification.

- **Parameters:**
  - `payload`: Raw request body as string
  - `signature`: Stripe signature from request headers
- **Returns:** `Stripe.Event` object
- **Throws:** Error if signature verification fails

#### `handleSuccessfulPayment(session: Stripe.Checkout.Session)`
Handles successful payment from Stripe webhook by extracting messageId from session metadata.

- **Parameters:**
  - `session`: Stripe checkout session object
- **Returns:** `string` - messageId from session metadata
- **Throws:** Error if messageId is not found in metadata

**Requirements 2.2, 2.3:** Extracts messageId for status update.

#### `getCheckoutSession(sessionId: string)`
Retrieves a checkout session by ID.

- **Parameters:**
  - `sessionId`: Stripe checkout session ID
- **Returns:** `Promise<Stripe.Checkout.Session>`
- **Throws:** Error if session retrieval fails

### Environment Variables

The StripeService requires the following environment variables:

- `STRIPE_SECRET_KEY`: Your Stripe secret key (sk_test_... or sk_live_...)
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret (whsec_...)
- `NEXT_PUBLIC_BASE_URL`: Base URL for success/cancel redirects

### Usage Example

```typescript
import { stripeService } from '@/services/StripeService';

// Create a checkout session
const { sessionId, url } = await stripeService.createCheckoutSession(
  'message-id-123',
  2999 // $29.99 in cents
);

// Verify webhook signature
const isValid = stripeService.verifyWebhookSignature(
  requestBody,
  stripeSignature
);

// Handle successful payment
if (isValid) {
  const event = stripeService.constructWebhookEvent(requestBody, stripeSignature);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const messageId = stripeService.handleSuccessfulPayment(session);
    // Update message status to 'paid'
  }
}
```

## MessageService

Handles all database operations for messages.

**Requirements:** 1.4, 1.5, 4.1, 4.5

See `MessageService.ts` for detailed documentation.

## QRCodeService

Handles QR code generation for message sharing.

**Requirements:** 3.2, 3.3, 9.1, 9.2, 9.4, 9.5

See `QRCodeService.ts` for detailed documentation.

## ImageService

Handles image upload and processing.

**Requirements:** 1.2, 8.1, 8.2, 8.3, 8.5, 10.3

See `ImageService.ts` for detailed documentation.

## SlugService

Handles URL slug generation for messages.

**Requirements:** 3.1, 3.5

See `SlugService.ts` for detailed documentation.

## EmailService

Handles email delivery using Resend API for transactional emails.

**Requirements:** 13.1, 13.2, 13.3, 13.4, 13.5, 13.6

### Methods

#### `sendQRCodeEmail(data: QRCodeEmailData)`
Sends QR code email to recipient with retry logic.

- **Parameters:**
  - `data`: QRCodeEmailData object containing:
    - `recipientEmail`: Email address to send to
    - `recipientName`: Name of the recipient
    - `messageUrl`: URL of the message
    - `qrCodeDataUrl`: Base64 encoded QR code image
    - `senderName`: Name of the message sender
    - `messageTitle`: Title of the message
- **Returns:** `Promise<EmailSendResult>` with success status and message ID or error
- **Throws:** Does not throw - returns error in result object

**Requirement 13.1:** Uses Resend API for all transactional emails.
**Requirement 13.4:** Handles Resend API errors gracefully.
**Requirement 13.5:** Logs all email sending attempts and results.
**Requirement 13.6:** Retries failed sends up to 3 times with exponential backoff (1s, 2s, 4s).

#### `validateConfig()`
Validates the email service configuration.

- **Returns:** `boolean` - true if configuration is valid, false otherwise

**Requirement 13.2:** Validates API key and configuration.

### Environment Variables

The EmailService requires the following environment variables:

- `RESEND_API_KEY`: Your Resend API key (re_...)
- `RESEND_FROM_EMAIL`: Verified sender email address
- `RESEND_FROM_NAME`: Friendly name for email sender

**Requirement 13.2:** Stores API key securely in environment variables.
**Requirement 13.3:** Uses verified sender email address.

### Usage Example

```typescript
import { emailService } from '@/services/EmailService';

// Send QR code email
const result = await emailService.sendQRCodeEmail({
  recipientEmail: 'user@example.com',
  recipientName: 'João Silva',
  messageUrl: 'https://paperbloom.com/mensagem/joao/aniversario',
  qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgo...',
  senderName: 'Maria',
  messageTitle: 'Feliz Aniversário',
});

if (result.success) {
  console.log('Email sent successfully:', result.messageId);
} else {
  console.error('Email send failed:', result.error);
}

// Validate configuration
if (!emailService.validateConfig()) {
  console.error('Email service not configured properly');
}
```

### Email Template

The service includes a responsive HTML email template with:
- QR code embedded as inline image
- Message URL as clickable link
- Usage instructions
- Mobile-responsive design
- Professional styling

The template is defined in `QR_CODE_EMAIL_TEMPLATE` and can be customized as needed.
