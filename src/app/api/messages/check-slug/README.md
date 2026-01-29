# Slug Availability Check API

## Overview

This API route checks if a URL slug is available for use in the messages table. It queries the database to verify uniqueness and provides alternative suggestions if the requested slug is already taken.

## Endpoint

```
GET /api/messages/check-slug
```

## Query Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `slug`    | string | Yes      | The URL slug to check          |

## Slug Format Requirements

- Only lowercase letters (a-z)
- Numbers (0-9)
- Hyphens (-)
- No spaces or special characters
- Validated with regex: `/^[a-z0-9-]+$/`

## Response Format

### Success Response (200 OK)

#### Slug Available
```json
{
  "available": true,
  "slug": "my-unique-slug"
}
```

#### Slug Taken
```json
{
  "available": false,
  "slug": "taken-slug",
  "suggestion": "taken-slug-1"
}
```

### Error Responses

#### Missing Slug Parameter (400 Bad Request)
```json
{
  "error": "Slug parameter is required"
}
```

#### Invalid Slug Format (400 Bad Request)
```json
{
  "available": false,
  "error": "Invalid slug format. Use only lowercase letters, numbers, and hyphens."
}
```

#### Server Error (500 Internal Server Error)
```json
{
  "error": "Failed to check slug availability",
  "available": false
}
```

## Suggestion Algorithm

When a slug is already taken, the API generates suggestions by:

1. Appending numbers 1-5 to the original slug (e.g., `slug-1`, `slug-2`, etc.)
2. Checking each suggestion for availability
3. If all numbered suggestions are taken, appending a timestamp (last 6 digits)

## Usage Examples

### JavaScript/TypeScript

```typescript
// Using the helper function from wizard-utils
import { checkSlugAvailability } from '@/lib/wizard-utils';

const result = await checkSlugAvailability('my-slug');
if (result.available) {
  console.log('Slug is available!');
} else {
  console.log(`Slug taken. Try: ${result.suggestion}`);
}
```

### Direct Fetch

```typescript
const response = await fetch('/api/messages/check-slug?slug=my-slug');
const data = await response.json();

if (data.available) {
  // Slug is available
} else {
  // Use data.suggestion for alternative
}
```

### React Component Example

```tsx
const [slug, setSlug] = useState('');
const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
const [suggestion, setSuggestion] = useState<string>('');

const checkSlug = async (slugToCheck: string) => {
  const result = await checkSlugAvailability(slugToCheck);
  setIsAvailable(result.available);
  setSuggestion(result.suggestion || '');
};

// Debounced check on input change
useEffect(() => {
  const timer = setTimeout(() => {
    if (slug) checkSlug(slug);
  }, 500);
  return () => clearTimeout(timer);
}, [slug]);
```

## Database Schema

The route queries the `messages` table:

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  -- other fields...
);

CREATE INDEX idx_messages_slug ON messages(slug);
```

## Related Files

- **Route Handler**: `src/app/api/messages/check-slug/route.ts`
- **Helper Function**: `src/lib/wizard-utils.ts` (`checkSlugAvailability`)
- **Slug Generator**: `src/lib/wizard-utils.ts` (`generateSlugFromTitle`)
- **Tests**: `src/app/api/messages/check-slug/__tests__/route.test.ts`
- **Integration Tests**: `src/app/api/messages/check-slug/__tests__/integration.test.ts`

## Requirements

**Validates**: Requirements 2.3 - Real-time URL slug availability check

## Performance Considerations

- Uses database index on `slug` column for fast lookups
- Single query for availability check
- Additional queries only when generating suggestions
- Suggestion generation limited to 5 attempts before using timestamp

## Error Handling

- Validates slug format before database query
- Returns 400 for invalid input
- Returns 500 for database errors
- Logs errors to console for debugging
- Always returns `available: false` on errors for safety
