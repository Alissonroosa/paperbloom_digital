# GET /api/messages/by-session

Fetch message data using Stripe session ID.

## Requirements
- 3.4: Payment confirmation returns both link and QR code
- 7.5: User completes payment and is redirected to success page with QR code and link

## Request

**Method:** GET

**Query Parameters:**
- `session_id` (required): Stripe checkout session ID

**Example:**
```
GET /api/messages/by-session?session_id=cs_test_a1b2c3d4e5f6
```

## Response

### Success (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recipientName": "Maria Silva",
  "senderName": "João Santos",
  "slug": "/mensagem/maria-silva/550e8400-e29b-41d4-a716-446655440000",
  "qrCodeUrl": "/uploads/qrcodes/550e8400-e29b-41d4-a716-446655440000.png",
  "status": "paid"
}
```

### Error Responses

**400 Bad Request** - Missing session_id parameter
```json
{
  "error": "session_id parameter is required"
}
```

**404 Not Found** - Message not found
```json
{
  "error": "Message not found"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Failed to fetch message data",
  "details": "Error message"
}
```

## Implementation Details

1. Retrieves Stripe session using `stripeService.getCheckoutSession()`
2. Extracts messageId from session metadata
3. Fetches message from database using `messageService.findById()`
4. Returns message data including QR code URL and shareable link

## Usage

This endpoint is used by the success page (`/success`) to display the QR code and shareable link after a successful payment.
