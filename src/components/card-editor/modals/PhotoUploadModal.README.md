# PhotoUploadModal Component

## Overview

The `PhotoUploadModal` component provides a user-friendly interface for uploading and managing photos for individual cards in the 12 Cartas product. It features drag-and-drop support, real-time validation, upload progress tracking, and responsive design.

## Requirements

This component implements the following requirements from the specification:

- **3.3**: Modal opens when user clicks "Adicionar Foto" button
- **5.1**: Displays image upload area with drag-and-drop support
- **5.2**: Shows current photo preview if one exists
- **5.3**: Validates image format (JPEG, PNG, WebP)
- **5.4**: Validates image size (maximum 5MB)
- **5.5**: Shows upload progress indicator
- **5.6**: Provides "Remove Photo" button for existing photos
- **5.7**: Handles cancel action and unsaved changes confirmation

## Features

### Core Functionality

1. **Drag-and-Drop Upload**
   - Visual feedback when dragging files over the drop zone
   - Supports single file upload
   - Validates file on drop

2. **File Selection**
   - Click to open file picker
   - Accepts JPEG, PNG, and WebP formats
   - Maximum file size: 5MB

3. **Photo Preview**
   - Shows current photo if one exists
   - Displays preview of newly selected photo before upload
   - Allows removing selection before saving

4. **Upload Progress**
   - Real-time progress bar during upload
   - Percentage indicator
   - Loading state with spinner

5. **Validation**
   - Format validation (JPEG, PNG, WebP only)
   - Size validation (max 5MB)
   - Clear error messages for validation failures

6. **Photo Management**
   - Save new photo
   - Remove existing photo
   - Cancel without saving

### Responsive Design

- **Mobile**: Fullscreen modal for better usability
- **Tablet/Desktop**: Centered modal with max-width
- **All Devices**: Touch-friendly buttons and controls

## Props

```typescript
interface PhotoUploadModalProps {
  card: Card;              // The card being edited
  isOpen: boolean;         // Controls modal visibility
  onClose: () => void;     // Called when modal should close
  onSave: (cardId: string, imageUrl: string) => Promise<void>;  // Called to save photo
  onRemove: (cardId: string) => Promise<void>;                   // Called to remove photo
}
```

## Usage Example

```tsx
import { PhotoUploadModal } from '@/components/card-editor/modals/PhotoUploadModal';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';

function MyComponent() {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const { currentCard, updateCard } = useCardCollectionEditor();

  const handleSavePhoto = async (cardId: string, imageUrl: string) => {
    await updateCard(cardId, { imageUrl });
  };

  const handleRemovePhoto = async (cardId: string) => {
    await updateCard(cardId, { imageUrl: null });
  };

  return (
    <>
      <button onClick={() => setIsPhotoModalOpen(true)}>
        Add Photo
      </button>

      <PhotoUploadModal
        card={currentCard}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSave={handleSavePhoto}
        onRemove={handleRemovePhoto}
      />
    </>
  );
}
```

## State Management

The component manages the following internal state:

- `selectedFile`: Currently selected file (before upload)
- `previewUrl`: URL for preview (object URL or existing image URL)
- `isUploading`: Upload in progress flag
- `uploadProgress`: Upload progress percentage (0-100)
- `error`: Current error message (if any)
- `dragOver`: Drag-over state for visual feedback
- `hasChanges`: Tracks if user has made changes
- `showConfirmation`: Controls confirmation dialog visibility
- `isRemoving`: Remove operation in progress flag

## Validation Rules

### File Type Validation

Allowed formats:
- `image/jpeg`
- `image/png`
- `image/webp`

Error message: "Formato inválido. Use JPEG, PNG ou WebP"

### File Size Validation

Maximum size: 5MB (5,242,880 bytes)

Error message: "Arquivo muito grande. Máximo 5MB. (X.XX MB)"

## Upload Flow

1. User selects or drops a file
2. File is validated (format and size)
3. If valid, preview is generated using `URL.createObjectURL()`
4. User clicks "Salvar"
5. File is uploaded to `/api/messages/upload-image`
6. Progress is tracked and displayed
7. On success, `onSave` callback is called with the image URL
8. Modal closes

## Error Handling

The component handles the following error scenarios:

1. **Invalid Format**: Shows error message and allows retry
2. **File Too Large**: Shows error with actual file size
3. **Upload Failure**: Shows error message with retry button
4. **Network Error**: Displays generic error message

## Accessibility

- **ARIA Labels**: All interactive elements have proper labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Focus is managed when modal opens/closes
- **Screen Reader**: Proper role and aria attributes for modal
- **Error Announcements**: Validation errors are announced

## Keyboard Shortcuts

- **Escape**: Close modal (with confirmation if changes exist)

## Styling

The component uses Tailwind CSS classes and follows the design system:

- Consistent spacing and typography
- Proper color contrast for accessibility
- Smooth transitions and animations
- Responsive breakpoints

## Integration with ImageService

The component integrates with the existing `ImageService` through the API route:

```typescript
POST /api/messages/upload-image
Content-Type: multipart/form-data

Body: FormData with 'image' field
```

Response:
```json
{
  "url": "https://...",
  "message": "Image uploaded successfully"
}
```

## Best Practices

1. **Always validate files** before attempting upload
2. **Show clear error messages** to guide users
3. **Provide visual feedback** during upload
4. **Confirm destructive actions** (remove photo)
5. **Handle edge cases** (network errors, large files)
6. **Clean up object URLs** to prevent memory leaks

## Testing Considerations

When testing this component:

1. Test file validation (format and size)
2. Test drag-and-drop functionality
3. Test upload progress tracking
4. Test error handling and retry
5. Test remove photo functionality
6. Test cancel with/without changes
7. Test responsive behavior
8. Test keyboard navigation
9. Test accessibility with screen readers

## Related Components

- `EditMessageModal`: Modal for editing card text
- `MusicSelectionModal`: Modal for selecting YouTube music
- `CardPreviewCard`: Displays card with photo indicator
- `CardEditorStep`: Original step-by-step editor with photo upload

## API Dependencies

- `/api/messages/upload-image`: Image upload endpoint
- `ImageService`: Server-side image processing and storage

## Future Enhancements

Potential improvements for future iterations:

1. Image cropping/editing before upload
2. Multiple photo upload for gallery
3. Photo filters or effects
4. Compression options
5. Batch upload support
6. Undo/redo functionality
