# GET /api/messages/[slug]

Retrieves a message by its unique slug.

## Requirements

- 4.1: Slug lookup returns correct message
- 4.2: Paid messages return complete data
- 4.3: Non-existent slugs return 404
- 4.4: Unpaid messages are not accessible
- 4.5: View count increments on access

## Endpoint

```
GET /api/messages/[slug]
```

## URL Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| slug      | string | Yes      | The unique slug of the message to retrieve     |

## Response Codes

| Code | Description                                                    |
|------|----------------------------------------------------------------|
| 200  | Success - Message found and returned                           |
| 400  | Bad Request - Invalid or empty slug                            |
| 402  | Payment Required - Message exists but payment not completed    |
| 404  | Not Found - Message with the given slug does not exist         |
| 500  | Internal Server Error - Unexpected error occurred              |

## Success Response (200)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "recipientName": "Ana Costa",
  "senderName": "Pedro Lima",
  "messageText": "Parabéns pelo seu dia especial!",
  "imageUrl": "https://example.com/uploads/images/abc123.jpg",
  "youtubeUrl": "https://www.youtube.com/watch?v=abc123",
  "qrCodeUrl": "https://example.com/uploads/qrcodes/qr-abc123.png",
  "viewCount": 42,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## Error Responses

### 400 - Invalid Slug

```json
{
  "error": {
    "code": "INVALID_SLUG",
    "message": "Slug parameter is required"
  }
}
```

### 402 - Payment Required

```json
{
  "error": {
    "code": "PAYMENT_REQUIRED",
    "message": "This message is not available. Payment is required."
  }
}
```

### 404 - Not Found

```json
{
  "error": {
    "code": "MESSAGE_NOT_FOUND",
    "message": "Message not found"
  }
}
```

### 500 - Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred while retrieving the message"
  }
}
```

## Behavior

1. **Slug Validation**: The endpoint validates that a slug parameter is provided
2. **Message Lookup**: Queries the database for a message with the given slug (Requirement 4.1)
3. **Existence Check**: Returns 404 if no message is found (Requirement 4.3)
4. **Payment Status Check**: Returns 402 if the message exists but status is 'pending' (Requirement 4.4)
5. **View Count Increment**: Increments the view count by 1 for paid messages (Requirement 4.5)
6. **Data Return**: Returns complete message data for paid messages (Requirement 4.2)

## CORS Headers

All responses include the following CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Example Usage

### Using fetch

```javascript
const slug = 'ana-costa-550e8400';

fetch(`http://localhost:3000/api/messages/${slug}`)
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('Error:', data.error.message);
    } else {
      console.log('Message:', data);
    }
  });
```

### Using curl

```bash
curl http://localhost:3000/api/messages/ana-costa-550e8400
```

## Testing

Run the integration tests:

```bash
npx ts-node --project tsconfig.node.json -r tsconfig-paths/register src/app/api/messages/[slug]/__tests__/integration-test.ts
```

## Notes

- The slug format is typically `/mensagem/{recipient_name}/{message_id}`
- Only messages with status 'paid' can be accessed
- Each access increments the view count, allowing tracking of message popularity
- The returned `viewCount` reflects the incremented value
- All optional fields (imageUrl, youtubeUrl, qrCodeUrl) may be null
