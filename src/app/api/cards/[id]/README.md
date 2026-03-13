# Card Management API Routes

This directory contains API routes for managing individual cards within a card collection.

## Requirements

- **1.4**: Allow users to personalize card titles
- **1.5**: Allow users to edit card text (max 500 characters)
- **1.6**: Allow users to add photos to cards
- **1.7**: Allow users to add music (YouTube URL) to cards
- **3.2**: Auto-save card edits and validate that only unopened cards can be edited

## Endpoints

### GET /api/cards/[id]

Retrieves a card by its ID.

**Parameters:**
- `id` (path parameter): UUID of the card

**Response (200 OK):**
```json
{
  "card": {
    "id": "uuid",
    "collectionId": "uuid",
    "order": 1,
    "title": "Abra quando...",
    "messageText": "Message content...",
    "imageUrl": "https://...",
    "youtubeUrl": "https://youtube.com/...",
    "status": "unopened",
    "openedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid UUID format
- `404 Not Found`: Card not found
- `500 Internal Server Error`: Unexpected error

---

### PATCH /api/cards/[id]

Updates a card's content. Only cards with status "unopened" can be edited.

**Parameters:**
- `id` (path parameter): UUID of the card

**Request Body:**
```json
{
  "title": "Updated title (optional, max 200 chars)",
  "messageText": "Updated message (optional, max 500 chars)",
  "imageUrl": "https://... (optional, valid URL)",
  "youtubeUrl": "https://youtube.com/... (optional, valid YouTube URL)"
}
```

**Response (200 OK):**
```json
{
  "card": {
    "id": "uuid",
    "collectionId": "uuid",
    "order": 1,
    "title": "Updated title",
    "messageText": "Updated message...",
    "imageUrl": "https://...",
    "youtubeUrl": "https://youtube.com/...",
    "status": "unopened",
    "openedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Card updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid UUID format or validation error
- `403 Forbidden`: Card has already been opened (cannot edit)
- `404 Not Found`: Card not found
- `500 Internal Server Error`: Unexpected error

**Validation Rules:**
- `title`: 1-200 characters
- `messageText`: 1-500 characters
- `imageUrl`: Must be a valid URL
- `youtubeUrl`: Must be a valid YouTube URL (youtube.com/watch?v=, youtu.be/, youtube.com/embed/)

---

### OPTIONS /api/cards/[id]

Handles CORS preflight requests.

**Response (200 OK):**
```json
{}
```

## Usage Examples

### Retrieve a card

```bash
curl http://localhost:3000/api/cards/123e4567-e89b-12d3-a456-426614174000
```

### Update a card

```bash
curl -X PATCH http://localhost:3000/api/cards/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Abra quando... você precisar de um abraço",
    "messageText": "Mesmo à distância, meu abraço está sempre com você. ❤️",
    "imageUrl": "https://example.com/hug.jpg",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }'
```

### Update only the message

```bash
curl -X PATCH http://localhost:3000/api/cards/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "messageText": "Updated message text only"
  }'
```

## Testing

Run the test script to verify the API routes:

```bash
# Make sure the dev server is running
npm run dev

# In another terminal, run the test script
npx tsx test-card-api-routes.ts
```

## Implementation Notes

### Security
- UUID validation prevents injection attacks
- Status check prevents editing opened cards
- Zod validation ensures data integrity
- CORS headers allow cross-origin requests

### Validation
- All fields are optional in PATCH requests
- Only provided fields are updated
- YouTube URL validation uses regex pattern
- Message text limited to 500 characters (Requirement 1.5)

### Error Handling
- Clear error codes for different failure scenarios
- Detailed error messages for debugging
- Proper HTTP status codes
- Validation errors include field-specific details

### Business Logic
- Only "unopened" cards can be edited (Requirement 3.2)
- Attempting to edit an "opened" card returns 403 Forbidden
- All updates automatically update the `updated_at` timestamp
- Partial updates are supported (only update provided fields)

## Related Files

- `src/services/CardService.ts` - Service layer for card operations
- `src/types/card.ts` - Type definitions and validation schemas
- `test-card-api-routes.ts` - Test script for API routes
