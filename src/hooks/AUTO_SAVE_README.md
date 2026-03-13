# Auto-Save Feature Documentation

## Overview

The auto-save feature automatically saves the user's editor progress to browser localStorage, preventing data loss if the user accidentally closes the browser or navigates away. The saved draft is automatically restored when the user returns to the editor.

## Components

### 1. useAutoSave Hook (`src/hooks/useAutoSave.ts`)

A custom React hook that handles automatic saving of data to localStorage with debouncing.

**Features:**
- Debounced saving (default: 2 seconds after last change)
- Automatic restoration of saved data
- Manual clear functionality
- Error handling for localStorage failures
- TypeScript generic support for type-safe data

**Usage:**
```typescript
const { isSaving, lastSaved, restore, clear } = useAutoSave({
  key: 'my-form-draft',
  data: formData,
  debounceMs: 2000,
  enabled: true,
});
```

**API:**

**Options:**
- `key: string` - localStorage key for storing data
- `data: T` - Data to save (any serializable object)
- `debounceMs?: number` - Debounce delay in milliseconds (default: 2000)
- `enabled?: boolean` - Enable/disable auto-save (default: true)

**Returns:**
- `isSaving: boolean` - Whether data is currently being saved
- `lastSaved: Date | null` - Timestamp of last successful save
- `restore: () => T | null` - Function to restore saved data
- `clear: () => void` - Function to clear saved data

### 2. AutoSaveIndicator Component (`src/components/editor/AutoSaveIndicator.tsx`)

A visual indicator that shows the auto-save status to the user.

**Features:**
- Shows "Salvando..." while saving
- Shows "Salvo X tempo atrás" after successful save
- Shows "Não salvo" when no data is saved
- Includes "Limpar rascunho" button
- Uses date-fns for Portuguese time formatting

**Props:**
```typescript
interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  onClearDraft?: () => void;
}
```

## Implementation in Editor

The auto-save feature is integrated into the editor page (`src/app/(marketing)/editor/page.tsx`):

### 1. Data Saved

The following data is automatically saved:
- Title
- Special date (as ISO string)
- Message text
- Signature
- Closing message
- From/To names
- YouTube link
- Uploaded image URLs (main and gallery)

### 2. Restoration on Mount

When the user returns to the editor, the saved data is automatically restored using a `useEffect` hook that runs once on mount.

### 3. Clear on Payment

The saved draft is automatically cleared when the user successfully proceeds to payment, preventing the draft from being restored after purchase.

### 4. Manual Clear

Users can manually clear their saved draft by clicking the "Limpar rascunho" button, which shows a confirmation dialog before clearing.

## Data Structure

Data is saved to localStorage in the following format:

```json
{
  "data": {
    "title": "string",
    "specialDate": "ISO date string or null",
    "message": "string",
    "signature": "string",
    "closing": "string",
    "from": "string",
    "to": "string",
    "youtubeLink": "string",
    "uploadedImageUrl": "string or null",
    "uploadedGalleryUrls": ["string or null", "string or null", "string or null"]
  },
  "savedAt": "ISO timestamp"
}
```

## Requirements Validation

This implementation satisfies the following requirements:

- **12.1**: ✓ Save editor state to localStorage after 2 seconds of inactivity
- **12.2**: ✓ Restore saved state when user returns to editor
- **12.3**: ✓ Display auto-save indicator
- **12.4**: ✓ Clear saved draft after payment completion
- **12.5**: ✓ Manual "Clear Draft" button

## Testing

### Unit Tests

Located at `src/hooks/__tests__/useAutoSave.test.ts`

Tests cover:
- Saving and restoring data
- Clearing data
- Handling non-existent data
- JSON serialization
- Multiple independent keys

Run tests:
```bash
npm test -- src/hooks/__tests__/useAutoSave.test.ts
```

### Manual Testing

1. Start development server: `npm run dev`
2. Navigate to `/editor`
3. Fill in form fields
4. Wait 2 seconds and observe "Salvo" indicator
5. Refresh the page
6. Verify data is restored
7. Click "Limpar rascunho"
8. Refresh and verify form is empty

## Error Handling

The auto-save feature handles errors gracefully:

- **localStorage unavailable**: Fails silently without disrupting user experience
- **Storage quota exceeded**: Logs error but doesn't crash
- **Invalid JSON**: Returns null when restoring corrupted data
- **Missing data**: Returns null for non-existent keys

## Browser Compatibility

The feature uses standard Web Storage API (localStorage) which is supported in:
- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)
- IE 8+

## Privacy Considerations

- Data is stored locally in the user's browser only
- No data is sent to servers until payment
- Users can clear their draft at any time
- Data persists across browser sessions until cleared

## Future Enhancements

Potential improvements:
- Add encryption for sensitive data
- Implement versioning for draft history
- Add conflict resolution for multiple tabs
- Sync drafts across devices (requires backend)
- Add expiration time for old drafts
