# Card Collection Visualization Page

## Overview

This page displays a card collection to the recipient, allowing them to view and open the 12 cards. Each card can only be opened once, creating a unique and special experience.

## Location

`src/app/(fullscreen)/cartas/[slug]/page.tsx`

## Requirements

- **5.1**: Display card collection by slug with sender information
- **5.5**: Implement card opening logic

## Features

### 1. Collection Fetching
- Fetches collection and cards by slug from API
- Handles loading and error states
- Displays appropriate messages for not found collections

### 2. Sender Information Display
- Shows sender name and recipient name
- Displays decorative header with branding
- Provides context about the one-time opening feature

### 3. Card Grid Display
- Integrates `CardCollectionViewer` component
- Shows all 12 cards in a responsive grid
- Visual indicators for opened/unopened status

### 4. Card Opening Logic
- Calls `/api/cards/[id]/open` endpoint
- Updates local state after opening
- Handles first-time vs. already-opened scenarios
- Shows appropriate modal with card content

### 5. Modal Display
- Integrates `CardModal` component
- Shows full card content (text, photo, music)
- Special animation for first opening
- Prevents re-viewing of opened cards

## API Integration

### GET /api/card-collections/slug/[slug]
Fetches the collection and all cards by slug.

**Response:**
```typescript
{
  collection: CardCollection,
  cards: Card[] // Filtered based on status
}
```

### POST /api/cards/[id]/open
Opens a card for the first time.

**Response:**
```typescript
{
  message: string,
  card: Card,
  alreadyOpened: boolean
}
```

## State Management

```typescript
const [collection, setCollection] = useState<CardCollection | null>(null);
const [cards, setCards] = useState<Card[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [selectedCard, setSelectedCard] = useState<Card | null>(null);
const [isFirstOpen, setIsFirstOpen] = useState(false);
const [isOpening, setIsOpening] = useState(false);
```

## User Flow

1. **Page Load**
   - URL: `/cartas/[slug]`
   - Fetch collection by slug
   - Display loading state

2. **Collection Display**
   - Show sender and recipient information
   - Display grid of 12 cards
   - Visual status indicators

3. **Card Selection**
   - User clicks on unopened card
   - Confirmation modal appears
   - User confirms opening

4. **Card Opening**
   - API call to open card
   - Update card status locally
   - Show CardModal with content

5. **Content Viewing**
   - Display full card content
   - Play music automatically (if first open)
   - Show special animation (if first open)
   - User closes modal

## Error Handling

### Collection Not Found
- Displays friendly error message
- Suggests checking the link
- Provides contact information

### Card Opening Error
- Shows alert with error message
- Allows user to retry
- Maintains current state

### Network Errors
- Graceful degradation
- Clear error messages
- Retry capability

## Styling

### Layout
- Fullscreen layout (no sidebar)
- Gradient background (blue → purple → pink)
- Sticky header with sender info
- Responsive grid for cards

### Colors
- Primary: Blue (#3B82F6)
- Secondary: Purple (#9333EA)
- Accent: Pink (#EC4899)
- Background: Gradient pastels

### Responsive Design
- Mobile: 2 columns
- Tablet: 3-4 columns
- Desktop: 6 columns

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management in modals

## Performance

- Client-side rendering for interactivity
- Lazy loading of images
- Optimized API calls
- Local state updates for instant feedback

## Testing

### Manual Testing
1. Access page with valid slug
2. Verify collection information displays
3. Click on unopened card
4. Confirm opening
5. Verify modal shows content
6. Close modal
7. Verify card shows as opened
8. Try to open same card again
9. Verify limited content shown

### Edge Cases
- Invalid slug
- Collection not found
- Network errors
- Already opened cards
- Missing photos/music

## Future Enhancements

- [ ] Share functionality
- [ ] Download QR code
- [ ] Print-friendly view
- [ ] Card opening history
- [ ] Notification when all cards opened
- [ ] Custom themes per collection

## Related Components

- `CardCollectionViewer` - Grid display of cards
- `CardModal` - Full card content display
- `YouTubePlayer` - Music playback
- `FallingEmojis` - Visual effects

## Related API Routes

- `/api/card-collections/slug/[slug]` - Fetch collection
- `/api/cards/[id]/open` - Open card

## Notes

- This page is in the `(fullscreen)` layout group, meaning it doesn't have the marketing layout wrapper
- Cards can only be opened once - this is enforced at the API level
- The page handles both first-time and subsequent openings gracefully
- All state is managed locally for optimal performance
