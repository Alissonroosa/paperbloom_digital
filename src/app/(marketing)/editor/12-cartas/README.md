# 12 Cartas Editor Page

## Overview

This page provides the main editor interface for creating and customizing a collection of 12 personalized cards. It handles collection initialization, state management, auto-save, and checkout navigation.

## Features

### Collection Management
- **Auto-creation**: Creates a new card collection on first visit
- **Session persistence**: Saves collection ID in sessionStorage
- **State restoration**: Restores editing progress from localStorage
- **API synchronization**: Fetches existing collections from the server

### Editor Integration
- Integrates `CardCollectionEditor` component
- Wraps with `CardCollectionEditorProvider` for state management
- Enables auto-save with 2-second debounce
- Provides navigation between all 12 cards

### Checkout Flow
- Validates all cards before allowing checkout
- Creates Stripe checkout session
- Clears local storage before redirect
- Handles errors gracefully

## Requirements Validation

### Requirement 1.1: Collection Creation
✅ Creates new collection with 12 pre-filled cards on page load

### Requirement 8.1: Wizard Interface
✅ Displays wizard with navigation between 12 cards

### Requirement 8.4: Auto-save
✅ Automatically saves progress to localStorage

### Requirement 8.5: State Preservation
✅ Preserves state when browser is closed and reopened

## Usage

### Accessing the Editor
```typescript
// Navigate to the editor
router.push('/editor/12-cartas');
```

### Session Storage
The page uses sessionStorage to persist the collection ID:
```typescript
const COLLECTION_ID_KEY = 'paperbloom-12cartas-collection-id';
```

### Local Storage
Auto-save data is stored in localStorage with the key:
```typescript
`card-collection-editor-${collectionId}`
```

## Component Structure

```
CardCollectionEditorPage (Provider)
└── EditorContent
    ├── Header (with cancel button)
    ├── Error Display (conditional)
    └── CardCollectionEditor
        ├── Auto-save indicator
        ├── Progress indicator
        ├── WizardStepper (12 steps)
        ├── CardEditorStep (current card)
        └── Navigation buttons
```

## State Flow

### Initialization Flow
1. Check sessionStorage for existing collection ID
2. If found, try to restore from localStorage
3. If not in localStorage, fetch from API
4. If not found or no ID, create new collection
5. Save new collection ID to sessionStorage

### Edit Flow
1. User edits card content
2. Changes trigger local state update
3. Auto-save debounces for 2 seconds
4. Changes saved to localStorage
5. Changes synced to API on blur/navigation

### Checkout Flow
1. User clicks "Finalizar" button
2. Validate all cards are complete
3. Create Stripe checkout session
4. Clear localStorage
5. Redirect to Stripe

## Error Handling

### Initialization Errors
- Shows error message with retry option
- Provides link to return home
- Logs detailed error information

### Checkout Errors
- Displays error banner at top of page
- Scrolls to top to show error
- Preserves user's work
- Allows retry

## API Dependencies

### POST /api/card-collections/create
Creates new collection with 12 cards
```typescript
{
  recipientName: string;
  senderName: string;
  contactEmail: string;
}
```

### GET /api/card-collections/[id]
Fetches existing collection and cards
```typescript
{
  collection: CardCollection;
  cards: Card[];
}
```

### POST /api/checkout/card-collection
Creates Stripe checkout session (Task 17 - not yet implemented)
```typescript
{
  collectionId: string;
}
```

## Testing

### Manual Testing
1. Navigate to `/editor/12-cartas`
2. Verify new collection is created
3. Edit some cards
4. Close browser and reopen
5. Verify progress is restored
6. Complete all cards
7. Click "Finalizar"
8. Verify checkout flow (once Task 17 is complete)

### Test Scenarios
- [ ] New user creates collection
- [ ] Returning user restores progress
- [ ] Auto-save works correctly
- [ ] Navigation between cards
- [ ] Validation before checkout
- [ ] Error handling for API failures
- [ ] Cancel button preserves work

## Future Enhancements

### Planned (Task 17)
- Implement `/api/checkout/card-collection` route
- Add contact information collection
- Integrate with Stripe payment

### Potential
- Add preview mode before checkout
- Add ability to duplicate cards
- Add card templates selector
- Add bulk edit capabilities

## Related Files

- `src/components/card-editor/CardCollectionEditor.tsx` - Main editor component
- `src/contexts/CardCollectionEditorContext.tsx` - State management
- `src/components/card-editor/CardEditorStep.tsx` - Individual card editor
- `src/app/api/card-collections/create/route.ts` - Collection creation API
- `src/app/api/card-collections/[id]/route.ts` - Collection fetch API

## Notes

- The page uses `'use client'` directive for client-side state management
- SessionStorage is used for collection ID (cleared on browser close)
- LocalStorage is used for auto-save (persists across sessions)
- The checkout route will be implemented in Task 17
