# POST /api/messages/create

API endpoint for creating new messages in the Paper Bloom Digital system.

## Requirements Implemented

- **1.1**: Validates all required fields (recipientName, senderName, messageText)
- **1.4**: Generates unique UUID for each message
- **1.5**: Persists message data to PostgreSQL database
- **5.1**: Validates JSON request body format
- **5.2**: Returns appropriate HTTP status codes and error messages for validation failures
- **5.3**: Returns 201 status code with message ID on success
- **5.4**: Includes CORS headers in all responses

## Endpoint Details

**URL**: `/api/messages/create`  
**Method**: `POST`  
**Content-Type**: `application/json`

## Request Body

```json
{
  "recipientName": "string (1-100 chars, required)",
  "senderName": "string (1-100 chars, required)",
  "messageText": "string (1-500 chars, required)",
  "imageUrl": "string (valid URL, optional)",
  "youtubeUrl": "string (valid YouTube URL, optional)",
  "title": "string (max 100 chars, optional)",
  "specialDate": "ISO date string (optional)",
  "closingMessage": "string (max 200 chars, optional)",
  "signature": "string (max 50 chars, optional)",
  "galleryImages": "array of URLs (max 3, optional)"
}
```

## Response Formats

### Success Response (201 Created)

```json
{
  "id": "uuid-string",
  "message": "Message created successfully"
}
```

### Validation Error (400 Bad Request)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for one or more fields",
    "details": {
      "fieldName": ["error message 1", "error message 2"]
    }
  }
}
```

### Invalid JSON (400 Bad Request)

```json
{
  "error": {
    "code": "INVALID_JSON",
    "message": "Invalid JSON format in request body"
  }
}
```

### Server Error (500 Internal Server Error)

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred while creating the message"
  }
}
```

## CORS Headers

All responses include the following CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Validation Rules

### Required Fields
- `recipientName`: 1-100 characters, trimmed
- `senderName`: 1-100 characters, trimmed
- `messageText`: 1-500 characters, trimmed

### Optional Fields
- `imageUrl`: Must be a valid URL format
- `youtubeUrl`: Must match YouTube URL patterns:
  - `youtube.com/watch?v=VIDEO_ID`
  - `youtu.be/VIDEO_ID`
  - `youtube.com/embed/VIDEO_ID`
- `title`: Maximum 100 characters
- `specialDate`: Valid date (ISO 8601 format or Date object)
- `closingMessage`: Maximum 200 characters
- `signature`: Maximum 50 characters
- `galleryImages`: Array of valid URLs, maximum 3 items

## Examples

### Create a Simple Message

```bash
curl -X POST http://localhost:3000/api/messages/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "João Silva",
    "senderName": "Maria Santos",
    "messageText": "Feliz aniversário! Que seu dia seja especial."
  }'
```

### Create a Message with Image and YouTube Video

```bash
curl -X POST http://localhost:3000/api/messages/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "João Silva",
    "senderName": "Maria Santos",
    "messageText": "Feliz aniversário! Que seu dia seja especial.",
    "imageUrl": "https://example.com/birthday.jpg",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }'
```

### Create an Enhanced Message with All Fields

```bash
curl -X POST http://localhost:3000/api/messages/create \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "João Silva",
    "senderName": "Maria Santos",
    "messageText": "Feliz aniversário! Que seu dia seja especial e repleto de alegrias.",
    "imageUrl": "/uploads/images/main-photo.jpg",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": "Feliz Aniversário, João!",
    "specialDate": "2024-12-25T00:00:00.000Z",
    "closingMessage": "Que este novo ano seja repleto de realizações",
    "signature": "Com carinho, Maria",
    "galleryImages": [
      "/uploads/images/gallery-1.jpg",
      "/uploads/images/gallery-2.jpg",
      "/uploads/images/gallery-3.jpg"
    ]
  }'
```

## Testing

Run the verification scripts to test the endpoint:

```bash
# Test API route functionality
npx ts-node --project tsconfig.node.json -r tsconfig-paths/register \
  src/app/api/messages/create/__tests__/verify-create-route.ts

# Test database persistence
npx ts-node --project tsconfig.node.json -r tsconfig-paths/register \
  src/app/api/messages/create/__tests__/verify-database.ts
```

## Implementation Notes

- Uses Zod for request validation
- Leverages MessageService for database operations
- Implements proper error handling with descriptive messages
- Supports CORS preflight requests via OPTIONS method
- All validation errors include field-specific details
- Database operations are wrapped in try-catch blocks
- Generates UUIDs using Node.js crypto module
