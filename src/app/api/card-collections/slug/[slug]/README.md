# Card Collection Fetch API - By Slug

## Endpoint
`GET /api/card-collections/slug/[slug]`

## Description
Fetches a card collection by its unique slug along with all associated cards. This endpoint is the primary way recipients access their card collection after payment. The slug is generated after successful payment and shared via email and QR code.

## Requirements
- **5.1**: Display interface with all 12 cards when recipient accesses the slug
- **5.5**: Show full content for unopened cards, limited info for opened cards

## Request

### URL Parameters
- `slug` (string, required): Unique slug of the card collection (e.g., "maria-12-cartas-2024")

### Example
```
GET /api/card-collections/slug/maria-12-cartas-2024
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
    },
    // ... 10 more cards
  ]
}
```

### Error Responses

#### Invalid Slug (400 Bad Request)
```json
{
  "error": {
    "code": "INVALID_SLUG",
    "message": "Slug cannot be empty"
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
- `messageText`: The full message content (up to 500 characters)
- `imageUrl`: URL to the uploaded image (if any)
- `youtubeUrl`: YouTube video URL for background music (if any)

### Opened Cards
Limited card data is returned:
- Basic metadata (id, collectionId, order, title, status, timestamps)
- Content fields (messageText, imageUrl, youtubeUrl) are **omitted**
- This enforces the one-time viewing experience

## Usage Example

```typescript
// Fetch collection by slug (recipient view)
const slug = 'maria-12-cartas-2024';
const response = await fetch(`/api/card-collections/slug/${slug}`);
const data = await response.json();

if (response.ok) {
  const { collection, cards } = data;
  
  console.log(`Collection for ${collection.recipientName}`);
  console.log(`From: ${collection.senderName}`);
  
  // Display cards in a grid
  cards.forEach(card => {
    if (card.status === 'unopened') {
      console.log(`Card ${card.order}: ${card.title} - Ready to open!`);
    } else {
      console.log(`Card ${card.order}: ${card.title} - Opened on ${card.openedAt}`);
    }
  });
  
  // Count remaining cards
  const remaining = cards.filter(c => c.status === 'unopened').length;
  console.log(`${remaining} cards remaining to open`);
} else {
  console.error('Error:', data.error);
}
```

## Typical User Flow

1. **Recipient receives email** with link containing the slug
2. **Recipient clicks link** or scans QR code
3. **Frontend calls this endpoint** with the slug
4. **API returns collection** with all 12 cards
5. **Frontend displays grid** showing which cards are opened/unopened
6. **Recipient selects a card** to open
7. **Frontend calls** `POST /api/cards/[id]/open` to mark as opened
8. **Card content is revealed** (one-time only)

## Implementation Notes

1. **Slug Validation**: Validates that slug is not empty before querying
2. **Content Protection**: Opened cards have their sensitive content stripped
3. **Card Ordering**: Cards are always returned sorted by order (1-12)
4. **CORS Support**: Includes CORS headers for cross-origin requests
5. **Public Access**: This endpoint is publicly accessible (no authentication required)
6. **Slug Generation**: Slugs are generated after payment confirmation in the webhook

## Security Considerations

- **No Authentication**: This endpoint is intentionally public to allow recipients to access their cards
- **Slug Uniqueness**: Slugs must be unique and hard to guess (handled by SlugService)
- **Content Protection**: Opened cards don't expose content, preventing replay attacks
- **Rate Limiting**: Consider implementing rate limiting to prevent abuse

## Related Endpoints
- `POST /api/card-collections/create` - Create a new collection
- `GET /api/card-collections/[id]` - Fetch collection by ID
- `POST /api/cards/[id]/open` - Open a card for the first time
- `PATCH /api/cards/[id]` - Update a card (during editing)

## Slug Format

Slugs are typically generated in the format:
- `{recipient-name}-12-cartas-{year}`
- Example: `maria-12-cartas-2024`
- Normalized to lowercase, spaces replaced with hyphens
- Special characters removed
- Uniqueness ensured by SlugService
