# POST /api/checkout/card-collection

Creates a Stripe checkout session for a card collection (12 Cartas product).

## Requirements

- **6.1**: Create checkout session when user finalizes card collection
- **6.2**: Define price for "12 Cartas" product

## Request

### Method
`POST`

### Headers
```
Content-Type: application/json
```

### Body
```typescript
{
  collectionId: string; // UUID of the card collection
}
```

### Example
```json
{
  "collectionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Response

### Success (200)
```typescript
{
  sessionId: string;  // Stripe checkout session ID
  url: string;        // Stripe checkout URL to redirect user
}
```

### Example
```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

## Error Responses

### 400 - Invalid JSON
```json
{
  "error": {
    "code": "INVALID_JSON",
    "message": "Invalid JSON format in request body"
  }
}
```

### 400 - Validation Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "collectionId": "Collection ID must be a valid UUID"
    }
  }
}
```

### 404 - Collection Not Found
```json
{
  "error": {
    "code": "COLLECTION_NOT_FOUND",
    "message": "Card collection not found"
  }
}
```

### 400 - Already Paid
```json
{
  "error": {
    "code": "COLLECTION_ALREADY_PAID",
    "message": "Card collection has already been paid for"
  }
}
```

### 500 - Internal Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred while creating checkout session"
  }
}
```

## Implementation Details

### Price
- Product: "12 Cartas - Jornada Emocional"
- Amount: R$ 49.99 (4999 cents)

### Flow
1. Validates that `collectionId` is a valid UUID
2. Verifies that the card collection exists in the database
3. Verifies that the collection status is 'pending' (not already paid)
4. Creates a Stripe checkout session with:
   - Product name: "Paper Bloom Digital - 12 Cartas"
   - Product description: "Jornada emocional única com 12 mensagens personalizadas"
   - Amount: 4999 cents (R$ 49.99)
   - Success URL: `/success?session_id={CHECKOUT_SESSION_ID}`
   - Cancel URL: `/editor/12-cartas`
5. Updates the card collection with the Stripe session ID
6. Returns the session ID and checkout URL

### Metadata Stored in Stripe Session
- `productType`: "card-collection"
- `collectionId`: UUID of the card collection
- `contactName`: Sender's name
- `contactEmail`: Contact email (if provided)

### CORS
This endpoint supports CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Usage Example

```typescript
// Frontend code to initiate checkout
async function proceedToCheckout(collectionId: string) {
  try {
    const response = await fetch('/api/checkout/card-collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collectionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    const { url } = await response.json();
    
    // Redirect to Stripe checkout
    window.location.href = url;
  } catch (error) {
    console.error('Checkout failed:', error);
    alert('Failed to create checkout session. Please try again.');
  }
}
```

## Testing

### Manual Test
```bash
# Create a test card collection first
curl -X POST http://localhost:3000/api/card-collections/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "João Silva",
    "senderName": "Maria Santos",
    "contactEmail": "maria@example.com"
  }'

# Use the returned collection ID to create checkout
curl -X POST http://localhost:3000/api/checkout/card-collection \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": "YOUR_COLLECTION_ID_HERE"
  }'
```

### Integration with Webhook
After successful payment, the webhook at `/api/checkout/webhook` will:
1. Detect `productType: "card-collection"` in metadata
2. Extract `collectionId` from metadata
3. Generate a unique slug for the collection
4. Generate a QR code
5. Update collection status to 'paid'
6. Send email with link and QR code

## Related Files
- `src/services/StripeService.ts` - Stripe integration service
- `src/services/CardCollectionService.ts` - Card collection database operations
- `src/app/api/checkout/webhook/route.ts` - Webhook handler (needs update for card collections)
- `src/app/(marketing)/editor/12-cartas/page.tsx` - Editor page that uses this endpoint
