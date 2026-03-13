# Step 4: Photo Upload Component

## Overview

The `Step4PhotoUpload` component is the fourth step in the multi-step wizard, allowing users to upload a main image and up to 7 gallery images for their message. It provides a user-friendly drag-and-drop interface with comprehensive validation and error handling.

## Features

### Core Functionality
- **Main Image Upload**: Single primary image upload area
- **Gallery Upload**: Up to 7 additional images for a photo gallery
- **Drag and Drop**: Intuitive drag-and-drop interface for all upload areas
- **Click to Upload**: Alternative click-to-select file upload method

### Validation (Requirements 5.2, 5.3)
- **Format Validation**: Only accepts JPEG, PNG, and WebP formats
- **Size Validation**: Maximum 5MB per image
- **Real-time Feedback**: Immediate validation feedback on file selection

### Upload Management (Requirements 5.4, 5.5)
- **Progress Indicators**: Visual loading states during upload
- **Error Handling**: Descriptive error messages for failed uploads
- **Image Removal**: Easy removal of uploaded images
- **Image Replacement**: Replace existing images with new ones

### User Experience
- **Visual Feedback**: Different states for empty, uploading, success, and error
- **Preview Display**: Shows uploaded images inline
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Requirements Mapping

| Requirement | Implementation |
|-------------|----------------|
| 5.1 | Upload areas for 1 main photo and up to 7 gallery photos |
| 5.2 | Validates image format (JPEG, PNG, WebP) |
| 5.3 | Validates file size (5MB maximum) |
| 5.4 | Displays upload progress indicators |
| 5.5 | Allows image removal and replacement |
| 5.6 | Updates preview with uploaded images |

## Usage

```tsx
import { Step4PhotoUpload } from '@/components/wizard/steps/Step4PhotoUpload';

// Used within WizardProvider context
<WizardProvider>
  <Step4PhotoUpload />
</WizardProvider>
```

## Component Structure

```
Step4PhotoUpload
├── Main Image Upload Area
│   ├── Drag & Drop Zone
│   ├── File Input (hidden)
│   ├── Upload Progress
│   ├── Image Preview
│   └── Remove/Replace Buttons
├── Gallery Upload Area
│   ├── 7 Upload Slots
│   │   ├── Drag & Drop Zone
│   │   ├── File Input (hidden)
│   │   ├── Upload Progress
│   │   ├── Image Preview
│   │   └── Remove Button
└── Information Box
    └── Upload Tips
```

## State Management

The component uses the `useWizard` hook to access and update:

### Data State
- `data.mainImage`: Main image File object
- `data.galleryImages`: Array of 7 File objects (or null)

### Upload State
- `uploads.mainImage`: Upload status for main image
  - `url`: Uploaded image URL
  - `isUploading`: Upload in progress flag
  - `error`: Error message if upload failed
- `uploads.galleryImages`: Array of upload statuses for gallery images

### Methods
- `updateField()`: Update form data
- `updateUploadState()`: Update upload progress/status

## Validation

### Client-Side Validation

```typescript
// Format validation
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Size validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const validateImage = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato inválido. Use JPEG, PNG ou WebP.' };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Arquivo muito grande. Máximo 5MB.' };
  }
  
  return { valid: true };
};
```

### Server-Side Validation

The component uploads to `/api/messages/upload-image` which performs additional validation:
- Image format verification
- File size limits
- Image processing (resize if needed)
- Upload to Cloudflare R2 storage

## Upload Flow

1. **File Selection**: User drags/drops or clicks to select file
2. **Client Validation**: Validate format and size
3. **Upload Start**: Set `isUploading` state, show progress indicator
4. **Server Upload**: POST to `/api/messages/upload-image`
5. **Success**: Store URL, update preview, show success state
6. **Error**: Display error message, allow retry

## Visual States

### Empty State
- Dashed border
- Upload icon
- "Drag or click" text
- Format and size information

### Uploading State
- Solid border
- Loading spinner
- "Enviando..." text

### Success State
- Green border
- Image preview
- Checkmark icon
- Remove/Replace buttons

### Error State
- Red border
- Error icon
- Error message
- "Try Again" button

## Drag and Drop

The component implements full drag-and-drop functionality:

```typescript
// Drag events
onDrop={handleImageDrop}
onDragOver={handleDragOver}
onDragEnter={handleDragEnter}
onDragLeave={handleDragLeave}
```

Visual feedback is provided during drag operations:
- Border color changes on drag enter
- Background color changes on drag over
- Returns to normal on drag leave

## Error Handling

### Validation Errors
- Invalid format: "Formato inválido. Use JPEG, PNG ou WebP."
- File too large: "Arquivo muito grande. Máximo 5MB. (X.XXmb)"

### Upload Errors
- Network error: "Erro ao fazer upload"
- Server error: Displays server error message
- Retry option available for all errors

## Accessibility

- Proper ARIA labels for all interactive elements
- Hidden file inputs with accessible labels
- Keyboard navigation support
- Screen reader friendly error messages
- Focus management for modal interactions

## Testing

Test page available at: `/editor/test-step4`

### Manual Testing Checklist
- [ ] Upload main image via drag and drop
- [ ] Upload main image via click
- [ ] Upload gallery images (all 7 slots)
- [ ] Test format validation (try .gif, .bmp)
- [ ] Test size validation (try >5MB file)
- [ ] Remove uploaded images
- [ ] Replace uploaded images
- [ ] Verify preview updates
- [ ] Test error states
- [ ] Test on mobile devices

### Automated Tests
Unit tests should cover:
- Image validation logic
- Upload state management
- Error handling
- File input interactions

## Integration

The component integrates with:
- **WizardContext**: State management
- **ImageService**: Server-side image processing
- **R2 Storage**: Cloud storage for uploaded images
- **Preview Components**: Real-time preview updates

## Future Enhancements

Potential improvements:
- Image cropping/editing before upload
- Multiple file selection at once
- Drag to reorder gallery images
- Image compression options
- Progress percentage display
- Batch upload for gallery
- Undo/redo functionality

## Related Components

- `Step1PageTitleURL`: Previous step
- `Step5ThemeCustomization`: Next step (to be implemented)
- `Preview`: Shows uploaded images
- `CinematicPreview`: Animated preview with images

## API Endpoints

- `POST /api/messages/upload-image`: Upload single image
- Returns: `{ url: string, message: string }`
- Errors: `{ error: { code: string, message: string } }`
