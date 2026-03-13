# Card Opening API Route

## Overview

This API route handles the opening of individual cards in the "12 Cartas" product. It implements the one-time opening mechanism where each card can only be opened once, creating a special and unique experience for the recipient.

## Endpoint

**POST** `/api/cards/[id]/open`

## Requirements Implemented

- **4.2**: Changes card status from "unopened" to "opened" on first opening
- **4.3**: Prevents reopening of already opened cards
- **4.4**: Records timestamp of first opening
- **4.5**: Returns full content only on first opening, limited info on subsequent attempts

## Request

### URL Parameters

- `id` (string, required): UUID of the card to open

### Request Body

None required.

### Example Request

```bash
curl -X POST http://localhost:3000/api/cards/[card-uuid]/open
```

## Response

### Success Response (First Opening)

**Status Code**: 200 OK

```json
{
  "message": "Carta aberta com sucesso",
  "card": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "collectionId": "123e4567-e89b-12d3-a456-426614174001",
    "order": 1,
    "title": "Abra quando... estiver tendo um dia difícil",
    "messageText": "Sei que hoje não está sendo fácil...",
    "imageUrl": "https://example.com/image.jpg",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "status": "opened",
    "openedAt": "2026-01-04T10:30:00.000Z",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-04T10:30:00.000Z"
  },
  "alreadyOpened": false
}
```

### Success Response (Already Opened)

**Status Code**: 200 OK

```json
{
  "message": "Esta carta já foi aberta anteriormente",
  "card": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Abra quando... estiver tendo um dia difícil",
    "status": "opened",
    "openedAt": "2026-01-04T10:30:00.000Z"
  },
  "alreadyOpened": true
}
```

Note: When a card has already been opened, the response does NOT include:
- `messageText` (the full message content)
- `imageUrl` (the photo)
- `youtubeUrl` (the music)
- `collectionId`
- `order`

This ensures the content remains special and can only be viewed once.

### Error Responses

#### Invalid Card ID Format

**Status Code**: 400 Bad Request

```json
{
  "error": "Invalid card ID format"
}
```

#### Card Not Found

**Status Code**: 404 Not Found

```json
{
  "error": "Card not found"
}
```

#### Card Already Opened (Alternative Error)

**Status Code**: 403 Forbidden

```json
{
  "error": "Esta carta já foi aberta"
}
```

#### Server Error

**Status Code**: 500 Internal Server Error

```json
{
  "error": "Erro ao abrir carta"
}
```

## Business Logic

### Opening Flow

1. **Validation**: Validates the card ID format (UUID)
2. **Existence Check**: Verifies the card exists in the database
3. **Status Check**: Checks if the card can be opened (status is "unopened")
4. **First Opening**:
   - Updates card status to "opened"
   - Records the current timestamp in `opened_at`
   - Returns full card content including message, image, and music
5. **Subsequent Attempts**:
   - Returns limited information (title, status, opened timestamp)
   - Does NOT return the full content (message, image, music)

### One-Time Opening Mechanism

The one-time opening is enforced at multiple levels:

1. **Database Level**: The `markAsOpened` method uses a WHERE clause that only updates cards with status "unopened"
2. **Service Level**: The `canOpen` method checks the current status before allowing the update
3. **API Level**: The route checks `canOpen` and returns different responses based on the result

This multi-layer approach ensures data integrity and prevents race conditions.

## Integration with CardService

This route uses the following CardService methods:

- `findById(id)`: Retrieves the card to check if it exists
- `canOpen(id)`: Checks if the card status is "unopened"
- `markAsOpened(id)`: Updates the card status and records the timestamp

## Testing

### Manual Testing

```bash
# First opening (should succeed and return full content)
curl -X POST http://localhost:3000/api/cards/[card-uuid]/open

# Second opening (should return limited info)
curl -X POST http://localhost:3000/api/cards/[card-uuid]/open

# Invalid UUID
curl -X POST http://localhost:3000/api/cards/invalid-id/open

# Non-existent card
curl -X POST http://localhost:3000/api/cards/00000000-0000-0000-0000-000000000000/open
```

### Property Tests

The following property tests should be implemented:

- **Property 9**: Transição de status ao abrir (Requirements 4.2, 4.4)
- **Property 10**: Bloqueio de conteúdo após abertura (Requirements 4.3, 4.5)

## Security Considerations

- **No Authentication Required**: Cards are accessed via UUID, which acts as a secure token
- **UUID Validation**: Prevents injection attacks by validating UUID format
- **Idempotent**: Multiple calls with the same card ID are safe (returns appropriate response)
- **No Sensitive Data Exposure**: Already-opened cards don't expose full content

## Future Enhancements

Potential improvements for future iterations:

1. **Rate Limiting**: Prevent abuse by limiting requests per IP
2. **Analytics**: Track when cards are opened for sender insights
3. **Notifications**: Notify sender when recipient opens a card
4. **Undo Window**: Allow reopening within a short time window (e.g., 5 minutes)
5. **Access Logs**: Maintain audit trail of opening attempts

## Related Files

- `src/services/CardService.ts`: Service layer implementation
- `src/types/card.ts`: Type definitions and validation schemas
- `src/app/api/cards/[id]/route.ts`: GET and PATCH routes for cards
- `src/app/api/card-collections/create/route.ts`: Collection creation route
