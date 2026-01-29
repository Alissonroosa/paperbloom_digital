# Stripe Webhook Handler

## Overview
This webhook handles Stripe `checkout.session.completed` events for both "message" and "card-collection" products. It processes successful payments by generating slugs, QR codes, and sending confirmation emails.

## Supported Product Types

### 1. Message Product (Original)
- **Product Type**: `message`
- **Metadata Field**: `messageId`
- **URL Format**: `{baseUrl}{slug}`
- **Example**: `https://paperbloom.com/mensagem/joao-abc123`
- **Requirements**: 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3

### 2. Card Collection Product (New)
- **Product Type**: `card-collection`
- **Metadata Field**: `collectionId`
- **URL Format**: `{baseUrl}/cartas{slug}`
- **Example**: `https://paperbloom.com/cartas/maria-abc456`
- **Requirements**: 6.3, 6.4, 6.5, 6.6

## Webhook Flow

### 1. Signature Verification
```typescript
const signature = request.headers.get('stripe-signature');
const event = stripeService.constructWebhookEvent(body, signature);
```
- Verifies webhook authenticity using Stripe signature
- Rejects requests with invalid signatures
- Requirement: 2.5

### 2. Product Type Detection
```typescript
const productType = session.metadata?.productType || 'message';
```
- Reads `productType` from session metadata
- Defaults to `'message'` for backward compatibility
- Routes to appropriate handler function

### 3. Payment Processing

#### For Messages (`handleMessagePayment`)
1. Extract `messageId` from metadata
2. Verify message exists
3. Update status to `'paid'`
4. Generate slug: `/mensagem/{name}-{id}`
5. Generate QR code
6. Update message with slug and QR code
7. Send email with link and QR code

#### For Card Collections (`handleCardCollectionPayment`)
1. Extract `collectionId` from metadata
2. Verify collection exists
3. Update status to `'paid'`
4. Generate slug: `/cartas/{name}-{id}`
5. Generate QR code
6. Update collection with slug and QR code
7. Send email with link and QR code

### 4. Email Delivery (`sendQRCodeEmail`)
1. Read QR code file from disk
2. Convert to base64 data URL
3. Extract contact email from session or database
4. Send email using `emailService.sendQRCodeEmail()`
5. Log success or failure (doesn't block webhook)

## Session Metadata Structure

### Message Product
```json
{
  "productType": "message",
  "messageId": "uuid-of-message",
  "contactEmail": "user@example.com",
  "contactName": "João Silva"
}
```

### Card Collection Product
```json
{
  "productType": "card-collection",
  "collectionId": "uuid-of-collection",
  "contactEmail": "user@example.com",
  "contactName": "Maria Santos"
}
```

### Legacy (Backward Compatible)
```json
{
  "messageId": "uuid-of-message",
  "contactEmail": "user@example.com"
}
```
*Note: Missing `productType` defaults to `'message'`*

## Error Handling

### Graceful Failures
- **Email Send Failures**: Logged but don't block webhook response
- **Missing Item**: Throws error, returns 200 to Stripe (prevents retries)
- **Invalid Metadata**: Throws error, returns 200 to Stripe

### Response Codes
- **200**: Success or acknowledged failure (prevents Stripe retries)
- **400**: Missing or invalid signature
- **500**: Unexpected server error

## Services Used

### CardCollectionService
- `findById(id)` - Verify collection exists
- `updateStatus(id, status)` - Update to 'paid'
- `updateQRCode(id, qrCodeUrl, slug)` - Store slug and QR code

### MessageService
- `findById(id)` - Verify message exists
- `updateStatus(id, status)` - Update to 'paid'
- `updateQRCode(id, qrCodeUrl, slug)` - Store slug and QR code

### SlugService
- `generateSlug(name, id)` - Generate URL-friendly slug

### QRCodeService
- `generate(url, id)` - Generate QR code image

### EmailService
- `sendQRCodeEmail(data)` - Send confirmation email with QR code

### StripeService
- `constructWebhookEvent(body, signature)` - Verify webhook signature
- `handleSuccessfulPayment(session)` - Extract messageId (legacy)

## Testing

### Local Testing with Stripe CLI
```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

### Test Scripts
- `test-webhook-card-collection.ts` - Tests card collection flow
- `test-webhook-both-products.ts` - Demonstrates product type detection

## Logging

### Log Levels
- **Info**: Normal processing steps
- **Warn**: Non-critical issues (missing email, URL validation)
- **Error**: Failures (email send, missing items)

### Log Format
```
[Webhook] Processing {productType} payment for session {sessionId}
[Webhook] Starting email send process for item: {itemId}
[Webhook] ✅ Successfully sent QR code email for item {itemId}
[Webhook] ❌ Failed to send QR code email for item {itemId}
```

## Environment Variables Required
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `NEXT_PUBLIC_BASE_URL` - Base URL for generating links
- `RESEND_API_KEY` - Email service API key
- `RESEND_FROM_EMAIL` - Sender email address
- `RESEND_FROM_NAME` - Sender name

## Security Considerations

### Signature Verification
- All webhooks must have valid Stripe signature
- Invalid signatures are rejected with 400 status
- Prevents unauthorized webhook calls

### Idempotency
- Status updates are idempotent (can be called multiple times)
- Duplicate webhooks won't cause issues
- Stripe automatically retries failed webhooks

### Error Responses
- Always return 200 for acknowledged events
- Prevents Stripe from retrying indefinitely
- Errors are logged for manual investigation

## Backward Compatibility

### ✅ Existing Messages
- All existing message functionality preserved
- Legacy sessions without `productType` still work
- No breaking changes to existing flows

### ✅ Database Schema
- No changes to existing `messages` table
- New `card_collections` table is separate
- Both products use same webhook endpoint

## Future Enhancements

### Potential Improvements
1. Add webhook event logging to database
2. Implement retry queue for failed emails
3. Add webhook event replay functionality
4. Support additional payment methods (PIX)
5. Add webhook event analytics

## Troubleshooting

### Common Issues

#### Email Not Sent
- Check `contactEmail` in session metadata or database
- Verify `RESEND_API_KEY` is configured
- Check email service logs for errors

#### QR Code Not Generated
- Verify `public/uploads/qrcodes/` directory exists
- Check file permissions
- Verify QRCodeService is working

#### Slug Not Generated
- Check SlugService implementation
- Verify recipient name is valid
- Check for special characters in name

#### Status Not Updated
- Verify item exists in database
- Check database connection
- Verify item ID in metadata is correct

## Support
For issues or questions, check:
1. Webhook logs in console
2. Stripe dashboard webhook events
3. Database records for item status
4. Email service logs

## Related Documentation
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [CardCollectionService](../../../services/CardCollectionService.ts)
- [MessageService](../../../services/MessageService.ts)
- [EmailService](../../../services/EmailService.ts)
