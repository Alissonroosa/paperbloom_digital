# CardEditorStep Component

## Overview

The `CardEditorStep` component is the individual card editor for the "12 Cartas" product. It provides a comprehensive interface for users to personalize each of the 12 cards with title, message, photo, and music.

## Features

### Core Functionality
- **Title Input**: Editable title field with 200 character limit
- **Message Textarea**: Main message field with 500 character limit
- **Photo Upload**: Drag-and-drop image upload with validation
- **YouTube Music**: Optional YouTube URL input with validation
- **Real-time Validation**: Immediate feedback on input errors
- **Auto-save**: Automatic saving via CardCollectionEditorContext
- **Progress Indicator**: Shows current card number (e.g., "Carta 1 de 12")

### Validation

#### Title Validation (Requirements 1.4, 3.1)
- Required field
- Maximum 200 characters
- Real-time character counter
- Error messages for invalid input

#### Message Validation (Requirements 1.5, 3.3)
- Required field
- Maximum 500 characters
- Color-coded character counter:
  - Gray: < 75% usage
  - Yellow: 75-90% usage
  - Orange: 90-100% usage
  - Red: 100% usage
- Warning messages at 90% and 100% usage

#### Photo Upload (Requirements 1.6, 3.4)
- Optional field
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 5MB
- Drag-and-drop support
- Upload progress indicator
- Error handling with retry option
- Image preview after upload
- Remove/replace functionality

#### YouTube URL Validation (Requirements 1.7, 3.5)
- Optional field
- Validates YouTube URL format
- Extracts video ID
- Shows video preview when valid
- Clear button to remove URL
- Supports multiple YouTube URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`

## Integration

### Context Integration

The component integrates with `CardCollectionEditorContext` to:
- Access current card data
- Update card fields locally (optimistic updates)
- Trigger auto-save
- Manage image upload state
- Track saving status

```typescript
const {
  currentCard,
  currentCardIndex,
  totalCards,
  updateCardLocal,
  saveCard,
  isSaving,
  imageUploadStates,
  setImageUploadState,
  resetImageUploadState,
} = useCardCollectionEditor();
```

### Image Service Integration

Uses the existing `ImageService` via the `/api/messages/upload-image` endpoint:
- Validates image type and size
- Uploads to Cloudflare R2
- Returns public URL
- Handles errors gracefully

### YouTube Utilities Integration

Uses `youtube-utils.ts` for:
- Extracting video ID from URLs
- Validating YouTube URL format

## Usage

```tsx
import { CardEditorStep } from '@/components/card-editor/CardEditorStep';
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';

function CardEditor() {
  return (
    <CardCollectionEditorProvider collectionId={collectionId}>
      <CardEditorStep />
    </CardCollectionEditorProvider>
  );
}
```

## Component Structure

```
CardEditorStep
├── Header (Card number, saving indicator)
├── Title Input
│   ├── Label with required indicator
│   ├── Input field
│   ├── Character counter
│   └── Error message
├── Message Textarea
│   ├── Label with required indicator
│   ├── Textarea field
│   ├── Character counter (color-coded)
│   ├── Warning messages
│   └── Error message
├── Photo Upload
│   ├── Label with optional indicator
│   ├── Upload area (drag-and-drop)
│   │   ├── Upload icon/progress
│   │   ├── Image preview
│   │   └── Remove/replace buttons
│   └── Error message
├── YouTube URL Input
│   ├── Label with optional indicator
│   ├── Input field with clear button
│   ├── Validation feedback
│   └── Video preview (when valid)
└── Information Box (tips)
```

## State Management

### Local State
- `titleError`: Title validation error message
- `messageError`: Message validation error message
- `youtubeError`: YouTube URL validation error message
- `dragOver`: Drag-and-drop hover state
- `youtubeVideoId`: Extracted video ID

### Context State
- `currentCard`: Current card being edited
- `currentCardIndex`: Index of current card (0-11)
- `totalCards`: Total number of cards (always 12)
- `isSaving`: Whether save is in progress
- `imageUploadStates`: Upload state for each card's image

## Validation Rules

### Title
- ✅ Required
- ✅ 1-200 characters
- ✅ Trimmed whitespace

### Message
- ✅ Required
- ✅ 1-500 characters
- ✅ Trimmed whitespace
- ✅ Color-coded feedback

### Photo
- ⚪ Optional
- ✅ JPEG, PNG, or WebP
- ✅ Maximum 5MB
- ✅ Uploaded to R2

### YouTube URL
- ⚪ Optional
- ✅ Valid YouTube URL format
- ✅ Extractable video ID
- ✅ Supports multiple URL formats

## Accessibility

- Proper ARIA labels and descriptions
- Error messages linked to inputs via `aria-describedby`
- Invalid state indicated with `aria-invalid`
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Error Handling

### Image Upload Errors
- File type validation errors
- File size validation errors
- Network/upload errors
- Retry functionality

### YouTube URL Errors
- Invalid URL format
- Non-YouTube URLs
- Unable to extract video ID
- Clear functionality to reset

### Validation Errors
- Real-time validation feedback
- Clear error messages
- Visual indicators (red borders, icons)
- Character count warnings

## Performance Considerations

- Debounced auto-save via context
- Optimistic updates for better UX
- Lazy loading of YouTube preview
- Efficient re-renders with proper dependencies

## Requirements Mapping

- **1.4**: Title input and editing
- **1.5**: Message textarea with 500 char limit
- **1.6**: Photo upload functionality
- **1.7**: YouTube URL input and validation
- **3.1**: Title validation and interface
- **3.3**: Message text validation (500 chars)
- **3.4**: Image upload and storage
- **3.5**: YouTube URL validation

## Future Enhancements

- Text suggestions panel (like Step3MainMessage)
- Image cropping/editing
- Multiple image support per card
- Music start time selection
- Preview mode toggle
- Undo/redo functionality
