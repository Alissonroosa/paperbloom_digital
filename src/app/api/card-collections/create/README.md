# Card Collection Creation API

## Endpoint

`POST /api/card-collections/create`

## Description

Creates a new card collection with 12 pre-filled cards based on emotional templates. This endpoint handles the initial creation of a "12 Cartas" product, generating a unique collection and populating it with 12 cards that have default content based on predefined templates.

## Requirements

- **1.1**: Create new card collection with validation
- **1.2**: Generate unique UUID for collection
- **1.3**: Create 12 cards with pre-filled templates

## Request

### Headers

```
Content-Type: application/json
```

### Body

```typescript
{
  recipientName: string;    // Required, 1-100 characters
  senderName: string;       // Required, 1-100 characters
  contactEmail?: string;    // Optional, valid email format, max 255 characters
}
```

### Example Request

```json
{
  "recipientName": "Maria Silva",
  "senderName": "João Santos",
  "contactEmail": "joao@example.com"
}
```

## Response

### Success Response (201 Created)

```typescript
{
  collection: CardCollection;
  cards: Card[];
  message: string;
}
```

#### CardCollection Object

```typescript
{
  id: string;                      // UUID
  recipientName: string;
  senderName: string;
  slug: null;                      // Generated after payment
  qrCodeUrl: null;                 // Generated after payment
  status: "pending";               // Default status
  stripeSessionId: null;           // Set during checkout
  contactEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Card Object

```typescript
{
  id: string;                      // UUID
  collectionId: string;            // References collection
  order: number;                   // 1-12
  title: string;                   // Template title
  messageText: string;             // Pre-filled message
  imageUrl: null;                  // Can be added later
  youtubeUrl: null;                // Can be added later
  status: "unopened";              // Default status
  openedAt: null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Example Success Response

```json
{
  "collection": {
    "id": "6ffa96b8-eb4f-4dfe-a911-c22fa60b4cf6",
    "recipientName": "Maria Silva",
    "senderName": "João Santos",
    "slug": null,
    "qrCodeUrl": null,
    "status": "pending",
    "stripeSessionId": null,
    "contactEmail": "joao@example.com",
    "createdAt": "2024-01-04T10:30:00.000Z",
    "updatedAt": "2024-01-04T10:30:00.000Z"
  },
  "cards": [
    {
      "id": "a1b2c3d4-...",
      "collectionId": "6ffa96b8-eb4f-4dfe-a911-c22fa60b4cf6",
      "order": 1,
      "title": "Abra quando... estiver tendo um dia difícil",
      "messageText": "Sei que hoje não está sendo fácil...",
      "imageUrl": null,
      "youtubeUrl": null,
      "status": "unopened",
      "openedAt": null,
      "createdAt": "2024-01-04T10:30:00.000Z",
      "updatedAt": "2024-01-04T10:30:00.000Z"
    }
    // ... 11 more cards
  ],
  "message": "Card collection created successfully with 12 cards"
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
    "message": "Validation failed for one or more fields",
    "details": {
      "recipientName": ["Recipient name is required"],
      "senderName": ["Sender name is required"]
    }
  }
}
```

#### 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred while creating the card collection",
    "details": "Error message details"
  }
}
```

## Card Templates

The endpoint automatically creates 12 cards with the following themes:

1. "Abra quando... estiver tendo um dia difícil"
2. "Abra quando... estiver se sentindo inseguro(a)"
3. "Abra quando... estivermos longe um do outro"
4. "Abra quando... estiver estressado(a) com o trabalho"
5. "Abra quando... quiser saber o quanto eu te amo"
6. "Abra quando... completarmos mais um ano juntos"
7. "Abra quando... estivermos celebrando uma conquista sua"
8. "Abra quando... for uma noite de chuva e tédio"
9. "Abra quando... tivermos nossa primeira briga boba"
10. "Abra quando... você precisar dar uma risada"
11. "Abra quando... eu tiver feito algo que te irritou"
12. "Abra quando... você não conseguir dormir"

Each card is pre-filled with appropriate emotional content that can be customized later.

## Validation Rules

### recipientName
- Required
- Minimum length: 1 character
- Maximum length: 100 characters
- Automatically trimmed

### senderName
- Required
- Minimum length: 1 character
- Maximum length: 100 characters
- Automatically trimmed

### contactEmail
- Optional
- Must be valid email format
- Maximum length: 255 characters
- Automatically trimmed

## CORS

The endpoint supports CORS with the following headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Usage Example

### Using fetch

```javascript
const response = await fetch('/api/card-collections/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    recipientName: 'Maria Silva',
    senderName: 'João Santos',
    contactEmail: 'joao@example.com',
  }),
});

const data = await response.json();

if (response.ok) {
  console.log('Collection created:', data.collection.id);
  console.log('Cards created:', data.cards.length);
} else {
  console.error('Error:', data.error);
}
```

### Using curl

```bash
curl -X POST http://localhost:3000/api/card-collections/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Maria Silva",
    "senderName": "João Santos",
    "contactEmail": "joao@example.com"
  }'
```

## Implementation Details

### Services Used

- **CardCollectionService**: Creates the collection record in the database
- **CardService**: Creates 12 cards using the `createBulk` method with predefined templates

### Database Tables

- **card_collections**: Stores collection metadata
- **cards**: Stores individual card data with foreign key to collection

### Transaction Handling

The card creation uses a database transaction to ensure all 12 cards are created atomically. If any card fails to create, the entire operation is rolled back.

## Next Steps

After creating a collection:

1. User can edit individual cards via `PATCH /api/cards/[id]`
2. User proceeds to checkout via `POST /api/checkout/card-collection`
3. After payment, webhook generates slug and QR code
4. Email is sent with access link
5. Recipient can view and open cards via `/cartas/[slug]`

## Testing

The API route has been tested with:

- ✅ Valid requests with all fields
- ✅ Valid requests without optional email
- ✅ Invalid JSON format
- ✅ Missing required fields
- ✅ Invalid email format
- ✅ CORS headers
- ✅ Database transaction integrity
- ✅ Card template population

All tests passed successfully, confirming the endpoint works as expected.
