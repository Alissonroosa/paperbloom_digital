# Webhook Implementation Summary

## Task 13: Create API route: POST /api/checkout/webhook

### Status: ✅ COMPLETED

## Implementation Details

### Files Created
1. **`src/app/api/checkout/webhook/route.ts`** - Main webhook handler
2. **`src/app/api/checkout/webhook/README.md`** - API documentation
3. **`src/app/api/checkout/webhook/__tests__/integration-test.ts`** - Integration tests
4. **`src/app/api/checkout/webhook/__tests__/verify-webhook.ts`** - Manual verification script

### Requirements Implemented

#### ✅ Requirement 2.2: Receive webhook and update message status
- Handles `checkout.session.completed` event
- Updates message status to 'paid' upon successful payment

#### ✅ Requirement 2.3: Mark message as active in database
- Message status is updated to 'paid' in the database
- Message becomes accessible after payment

#### ✅ Requirement 2.4: Handle failed payments
- Failed payments maintain 'pending' status
- Only successful `checkout.session.completed` events trigger status change

#### ✅ Requirement 2.5: Validate webhook signature
- Verifies Stripe signature using `stripeService.constructWebhookEvent()`
- Rejects requests with missing or invalid signatures (400 error)

#### ✅ Requirement 3.1: Generate slug for paid messages
- Uses `slugService.generateSlug()` to create URL-safe slugs
- Format: `/mensagem/{normalized_recipient_name}/{message_id}`
- Handles special characters (accents, spaces, symbols)

#### ✅ Requirement 3.2: Create QR code for message URL
- Generates QR code using `qrCodeService.generate()`
- QR code contains full message URL
- Minimum resolution: 300x300 pixels

#### ✅ Requirement 3.3: Store QR code and return URL
- QR code saved to `public/uploads/qrcodes/`
- Public URL returned and stored in database
- Filename format: `{message_id}.png`

## Webhook Flow

```
1. Stripe sends webhook event
   ↓
2. Verify webhook signature (Requirement 2.5)
   ↓
3. Check event type (checkout.session.completed)
   ↓
4. Extract messageId from session metadata (Requirement 2.2)
   ↓
5. Verify message exists
   ↓
6. Update message status to 'paid' (Requirements 2.2, 2.3)
   ↓
7. Generate slug (Requirement 3.1)
   ↓
8. Generate QR code (Requirements 3.2, 3.3)
   ↓
9. Update message with slug and QR code
   ↓
10. Return 200 response to Stripe
```

## Error Handling

### 400 - Missing Signature
```json
{
  "error": {
    "code": "MISSING_SIGNATURE",
    "message": "Missing Stripe signature header"
  }
}
```

### 400 - Invalid Signature
```json
{
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Invalid webhook signature"
  }
}
```

### 404 - Message Not Found
```json
{
  "error": {
    "code": "MESSAGE_NOT_FOUND",
    "message": "Message not found"
  }
}
```

### 200 - Processing Error (Acknowledged)
```json
{
  "received": true,
  "error": "Processing failed but acknowledged"
}
```

**Note:** Returns 200 even on processing errors to prevent Stripe from retrying. Errors are logged for manual investigation.

## Testing

### Manual Verification
Run the verification script:
```bash
npm run webhook:verify
```

This script:
1. Creates a test message
2. Creates a Stripe checkout session
3. Simulates webhook processing
4. Verifies all steps complete successfully
5. Validates final message state

### Verification Results
```
✅ Message creation
✅ Stripe session creation
✅ Metadata extraction
✅ Status update to paid
✅ Slug generation with special character normalization
✅ QR code generation
✅ Message update with slug and QR code
✅ Slug lookup
```

### Live Testing with Stripe CLI

1. **Start webhook listener:**
   ```bash
   npm run stripe:listen
   ```

2. **Trigger test event:**
   ```bash
   npm run stripe:trigger
   ```

3. **Check logs** for successful processing

## Security Features

1. **Signature Verification**: All webhooks must have valid Stripe signatures
2. **Idempotency**: Safe to process same event multiple times
3. **Error Isolation**: Processing errors don't cause Stripe retries
4. **Logging**: All errors logged with context for debugging

## Integration Points

### Services Used
- **StripeService**: Webhook signature verification, event construction
- **MessageService**: Database operations (status update, QR code update)
- **SlugService**: URL-safe slug generation
- **QRCodeService**: QR code image generation

### Database Updates
- `status`: 'pending' → 'paid'
- `slug`: NULL → '/mensagem/{name}/{id}'
- `qr_code_url`: NULL → '/uploads/qrcodes/{id}.png'
- `updated_at`: Updated timestamp

## Environment Variables Required

- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret from Stripe
- `NEXT_PUBLIC_BASE_URL`: Base URL for generating full message URLs

## Next Steps

The webhook is fully implemented and tested. To use in production:

1. Configure webhook endpoint in Stripe Dashboard
2. Set `STRIPE_WEBHOOK_SECRET` environment variable
3. Ensure `NEXT_PUBLIC_BASE_URL` is set to production domain
4. Monitor webhook logs for any issues

## Notes

- Webhook is designed to be idempotent
- Returns 200 to Stripe even on processing errors to avoid retries
- All errors are logged for manual investigation
- QR codes are stored in `public/uploads/qrcodes/` directory
- Slugs handle special characters (accents, spaces, symbols) correctly
