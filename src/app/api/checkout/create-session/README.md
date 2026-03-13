# POST /api/checkout/create-session

Creates a Stripe checkout session for a message payment.

## Requirements

- **2.1**: WHEN um usuário solicita checkout THEN o Sistema SHALL criar uma sessão de pagamento no Stripe com os dados da mensagem

## Request

### Method
`POST`

### Headers
- `Content-Type: application/json`

### Body
```json
{
  "messageId": "uuid-string"
}
```

### Body Parameters
- `messageId` (string, required): UUID of the message to create checkout for. Must be a valid UUID format.

## Response

### Success Response (200 OK)
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Error Responses

#### 400 Bad Request - Invalid JSON
```json
{
  "error": {
    "code": "INVALID_JSON",
    "message": "Invalid JSON format in request body"
  }
}
```

#### 400 Bad Request - Validation Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "messageId": "Message ID must be a valid UUID"
    }
  }
}
```

#### 404 Not Found - Message Not Found
```json
{
  "error": {
    "code": "MESSAGE_NOT_FOUND",
    "message": "Message not found"
  }
}
```

#### 400 Bad Request - Message Already Paid
```json
{
  "error": {
    "code": "MESSAGE_ALREADY_PAID",
    "message": "Message has already been paid for"
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred while creating checkout session"
  }
}
```

## Implementation Details

1. **Validates messageId**: Ensures the messageId is a valid UUID
2. **Verifies message exists**: Checks that the message exists in the database
3. **Verifies message is pending**: Ensures the message hasn't already been paid for
4. **Creates Stripe session**: Calls StripeService to create a checkout session with the message ID in metadata
5. **Updates message**: Stores the Stripe session ID in the message record
6. **Returns session details**: Returns the session ID and checkout URL for the frontend to redirect

## Usage Example

```typescript
const response = await fetch('/api/checkout/create-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messageId: '123e4567-e89b-12d3-a456-426614174000',
  }),
});

const data = await response.json();

if (response.ok) {
  // Redirect user to Stripe checkout
  window.location.href = data.url;
} else {
  console.error('Error:', data.error);
}
```

## CORS

This endpoint includes CORS headers to allow cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Related Services

- **MessageService**: Used to find and update messages
- **StripeService**: Used to create checkout sessions
