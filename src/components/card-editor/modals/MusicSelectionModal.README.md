# MusicSelectionModal Component

## Overview

Modal component for selecting and managing YouTube music for cards in the 12 Cards editor. Provides real-time URL validation, video preview, and intuitive controls for adding, editing, or removing music from cards.

## Requirements

This component implements the following requirements from the spec:

- **3.4**: Modal opens when user clicks "Adicionar Música" button
- **6.1**: Displays music selection options
- **6.2**: Real-time YouTube URL validation
- **6.3**: Video ID extraction and preview
- **6.4**: Save functionality to associate music with card
- **6.5**: Remove music functionality
- **6.6**: Cancel functionality with unsaved changes confirmation

## Features

### Core Functionality

1. **YouTube URL Input**
   - Text input for YouTube video URLs
   - Supports multiple URL formats (youtube.com/watch, youtu.be, youtube.com/embed)
   - Real-time validation with debouncing (500ms)
   - Visual feedback (loading, success, error icons)

2. **Video ID Extraction**
   - Automatically extracts video ID from URL
   - Validates video ID format
   - Fetches video title for better UX

3. **Video Preview**
   - Embedded YouTube player (iframe)
   - Responsive aspect ratio (16:9)
   - Link to open video on YouTube

4. **Action Buttons**
   - **Save**: Saves YouTube URL to card
   - **Remove Music**: Removes music from card (only shown if music exists)
   - **Cancel**: Closes modal with confirmation if changes exist

5. **Validation**
   - Real-time URL validation
   - Error messages for invalid URLs
   - Success indicator with video title
   - Prevents saving invalid URLs

6. **Responsive Design**
   - Fullscreen on mobile devices
   - Centered modal on tablet/desktop
   - Touch-friendly controls

7. **Accessibility**
   - Keyboard navigation support
   - ARIA labels and roles
   - Focus management
   - Screen reader friendly

## Props

```typescript
interface MusicSelectionModalProps {
  card: Card;              // The card being edited
  isOpen: boolean;         // Controls modal visibility
  onClose: () => void;     // Called when modal should close
  onSave: (cardId: string, youtubeUrl: string) => Promise<void>;  // Save handler
  onRemove: (cardId: string) => Promise<void>;                    // Remove handler
}
```

## Usage

```tsx
import { MusicSelectionModal } from '@/components/card-editor/modals/MusicSelectionModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [card, setCard] = useState<Card>({ /* ... */ });

  const handleSave = async (cardId: string, youtubeUrl: string) => {
    // Update card with YouTube URL
    await updateCard(cardId, { youtubeUrl });
    setIsOpen(false);
  };

  const handleRemove = async (cardId: string) => {
    // Remove YouTube URL from card
    await updateCard(cardId, { youtubeUrl: null });
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Add Music
      </button>
      
      <MusicSelectionModal
        card={card}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        onRemove={handleRemove}
      />
    </>
  );
}
```

## State Management

### Local State

- `youtubeUrl`: Current URL input value
- `videoId`: Extracted video ID (null if invalid)
- `videoTitle`: Fetched video title for display
- `isValidating`: Loading state during validation
- `isSaving`: Loading state during save
- `isRemoving`: Loading state during remove
- `error`: Validation or operation error message
- `hasChanges`: Tracks if user made changes
- `showConfirmation`: Controls confirmation dialog

### Effects

1. **Reset on Open**: Resets all state when modal opens
2. **Track Changes**: Monitors URL changes vs original
3. **Debounced Validation**: Validates URL after 500ms of no typing
4. **Keyboard Shortcuts**: Escape to close, Ctrl+Enter to save
5. **Body Scroll Lock**: Prevents background scrolling

## Validation

### YouTube URL Validation

The component uses `extractYouTubeVideoId` from `@/lib/youtube-utils` to validate URLs:

**Supported formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- Direct video ID (11 characters)

**Validation flow:**
1. User types URL
2. After 500ms debounce, validation runs
3. Extract video ID using regex patterns
4. If valid, fetch video title
5. Show success/error indicator

### Error Messages

- **Invalid URL**: "Deve ser uma URL do YouTube válida"
- **Save Error**: "Erro ao salvar. Tente novamente."
- **Remove Error**: "Erro ao remover música. Tente novamente."
- **Validation Error**: "Erro ao validar URL. Verifique se o vídeo existe."

## Keyboard Shortcuts

- **Escape**: Close modal (with confirmation if changes exist)
- **Ctrl+Enter** / **Cmd+Enter**: Save and close

## Responsive Behavior

### Mobile (< 768px)
- Fullscreen modal
- Full-width buttons
- Stacked button layout
- Touch-optimized controls

### Tablet/Desktop (≥ 768px)
- Centered modal with max-width
- Rounded corners
- Horizontal button layout
- Hover states

## Accessibility Features

1. **ARIA Attributes**
   - `role="dialog"`
   - `aria-modal="true"`
   - `aria-labelledby` for title
   - `aria-invalid` for error states
   - `aria-describedby` for error messages

2. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter to activate buttons
   - Escape to close

3. **Focus Management**
   - Focus trapped within modal
   - Returns focus on close

4. **Screen Reader Support**
   - Descriptive labels
   - Error announcements
   - Status updates

## Dependencies

- `@/types/card`: Card type definition
- `@/components/ui/Button`: Button component
- `@/lib/youtube-utils`: YouTube URL utilities
- `lucide-react`: Icons (Music, Loader2, XCircle, CheckCircle, ExternalLink)

## Related Components

- `EditMessageModal`: Modal for editing card text
- `PhotoUploadModal`: Modal for uploading card photos
- `CardPreviewCard`: Displays card with music indicator
- `CardGridView`: Grid of cards with action buttons

## Testing

### Unit Tests

Test the following scenarios:

1. **URL Validation**
   - Valid YouTube URLs are accepted
   - Invalid URLs show error
   - Video ID is extracted correctly

2. **Save/Remove**
   - Save calls onSave with correct parameters
   - Remove calls onRemove with card ID
   - Loading states are shown during operations

3. **Confirmation Dialog**
   - Shows when closing with unsaved changes
   - Doesn't show when no changes made
   - Discard button closes without saving

4. **Keyboard Shortcuts**
   - Escape closes modal
   - Ctrl+Enter saves

### Property-Based Tests

1. **URL Extraction**: For any valid YouTube URL format, video ID should be extracted
2. **Validation**: For any invalid URL, error should be shown
3. **State Consistency**: Changes should be tracked correctly

## Performance Considerations

1. **Debounced Validation**: 500ms debounce prevents excessive API calls
2. **Lazy Loading**: Modal content only rendered when open
3. **Memoization**: Consider memoizing validation function if performance issues arise

## Future Enhancements

1. **Playlist Support**: Allow selecting specific video from playlist
2. **Timestamp Support**: Allow specifying start time
3. **Multiple Music Options**: Support for Spotify, SoundCloud, etc.
4. **Music Library**: Pre-selected popular songs
5. **Search Functionality**: Search YouTube directly in modal

## Notes

- The component reuses YouTube validation logic from `@/lib/youtube-utils`
- Video preview uses YouTube's embed player
- The component follows the same patterns as EditMessageModal and PhotoUploadModal
- No backend changes required - uses existing card update API
