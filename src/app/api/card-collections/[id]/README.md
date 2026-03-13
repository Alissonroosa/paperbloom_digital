# Card Collection Fetch API - By ID

## Endpoint
`GET /api/card-collections/[id]`

## Description
Fetches a card collection by its UUID along with all associated cards. This endpoint is used during the editing phase when the user needs to retrieve their collection by ID.

## Requirements
- **5.1**: Display interface with all 12 cards
- **5.5**: Show full content for unopened cards, limited info for opened cards

## Request

### URL Parameters
- `id` (string, required): UUID of the card collection

### Example
```
GET /api/card-collections/550e8400-e29b-41d4-a716-446655440000
```

## Response

### Success Response (200 OK)
```json
{
  "collection": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "recipientName": "Maria Silva",
    "senderName": "João Santos",
    "slug": "maria-12-cartas-2024",
    "qrCodeUrl": "https://example.com/qr/abc123.png",
    "status": "paid",
    "stripeSessionId": "cs_test_123",
    "contactEmail": "joao@example.com",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "cards": [
    {
      "id": "card-uuid-1",
      "collectionId": "550e8400-e29b-41d4-a716-446655440000",
      "order": 1,
      "title": "Abra quando... estiver tendo um dia difícil",
      "messageText": "Sei que hoje não está sendo fácil...",
      "imageUrl": "https://example.com/images/photo1.jpg",
      "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "status": "unopened",
      "openedAt": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:45:00Z"
    },
    {
      "id": "card-uuid-2",
      "collectionId": "550e8400-e29b-41d4-a716-446655440000",
      "order": 2,
      "title": "Abra quando... estiver se sentindo inseguro(a)",
      "status": "opened",
      "openedAt": "2024-01-16T14:20:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T14:20:00Z"
      // Note: messageText, imageUrl, youtubeUrl are omitted for opened cards
    }
  ]
}
```

### Error Responses

#### Invalid ID Format (400 Bad Request)
```json
{
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid collection ID format"
  }
}
```

#### Collection Not Found (404 Not Found)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Card collection not found"
  }
}
```

#### Internal Server Error (500)
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred while fetching the card collection",
    "details": "Error details here"
  }
}
```

## Card Content Filtering

### Unopened Cards
Full card data is returned including:
- `messageText`: The full message content
- `imageUrl`: URL to the uploaded image (if any)
- `youtubeUrl`: YouTube video URL (if any)

### Opened Cards
Limited card data is returned:
- Basic metadata (id, collectionId, order, title, status, timestamps)
- Content fields (messageText, imageUrl, youtubeUrl) are **omitted**
- This prevents recipients from viewing the content again after opening

## Usage Example

```typescript
// Fetch collection by ID
const response = await fetch('/api/card-collections/550e8400-e29b-41d4-a716-446655440000');
const data = await response.json();

if (response.ok) {
  console.log('Collection:', data.collection);
  console.log('Cards:', data.cards);
  
  // Check which cards are still unopened
  const unopenedCards = data.cards.filter(card => card.status === 'unopened');
  console.log(`${unopenedCards.length} cards remaining to open`);
} else {
  console.error('Error:', data.error);
}
```

## Implementation Notes

1. **UUID Validation**: The endpoint validates that the ID is a valid UUID format before querying the database
2. **Content Protection**: Opened cards have their content stripped to maintain the one-time viewing experience
3. **Card Ordering**: Cards are returned sorted by their `order` field (1-12)
4. **CORS Support**: Includes CORS headers for cross-origin requests
5. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

## Related Endpoints
- `POST /api/card-collections/create` - Create a new collection
- `GET /api/card-collections/slug/[slug]` - Fetch collection by slug
- `PATCH /api/cards/[id]` - Update a card
- `POST /api/cards/[id]/open` - Open a card for the first time
