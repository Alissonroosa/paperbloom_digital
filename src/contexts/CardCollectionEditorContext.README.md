# CardCollectionEditorContext

## Overview

The `CardCollectionEditorContext` provides state management for the 12 Cartas editor. It manages the card collection, all 12 cards, navigation between cards, auto-save functionality, and image upload states.

## Requirements

This context implements the following requirements:
- **8.3**: Navigation between cards and progress tracking
- **8.4**: Auto-save of alterations
- **8.5**: State preservation when browser is closed

## Features

### State Management
- **Collection State**: Manages the CardCollection entity
- **Cards State**: Manages all 12 Card entities
- **Navigation State**: Tracks current card index
- **Save State**: Tracks saving status and last saved time
- **Upload State**: Tracks image upload progress for each card

### Auto-Save
- Automatically saves to localStorage after 2 seconds of inactivity (configurable)
- Preserves collection, cards, and current card index
- Restores state on page reload
- Tracks unsaved changes

### Navigation
- Navigate to next/previous card
- Jump to specific card by index
- Boundary checks (first/last card)
- Current card computed property

### Server Synchronization
- Optimistic updates for better UX
- Individual card save
- Batch save all cards
- Error handling and retry logic

## Usage

### Basic Setup

```tsx
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';

function EditorPage() {
  return (
    <CardCollectionEditorProvider collectionId="uuid-here">
      <CardEditor />
    </CardCollectionEditorProvider>
  );
}
```

### Using the Context

```tsx
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';

function CardEditor() {
  const {
    collection,
    cards,
    currentCard,
    currentCardIndex,
    isSaving,
    updateCard,
    nextCard,
    previousCard,
  } = useCardCollectionEditor();

  const handleSave = async () => {
    await updateCard(currentCard.id, {
      title: 'New Title',
      messageText: 'New message',
    });
  };

  return (
    <div>
      <h2>Card {currentCardIndex + 1} of {cards.length}</h2>
      <p>{currentCard?.title}</p>
      <button onClick={previousCard}>Previous</button>
      <button onClick={nextCard}>Next</button>
      <button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
```

### Specialized Hooks

#### useCardCollectionEditorState (Read-Only)
```tsx
import { useCardCollectionEditorState } from '@/contexts/CardCollectionEditorContext';

function StatusIndicator() {
  const { isSaving, lastSaved, hasUnsavedChanges } = useCardCollectionEditorState();
  
  return (
    <div>
      {isSaving && <span>Saving...</span>}
      {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
      {hasUnsavedChanges && <span>Unsaved changes</span>}
    </div>
  );
}
```

#### useCardCollectionEditorActions (Actions Only)
```tsx
import { useCardCollectionEditorActions } from '@/contexts/CardCollectionEditorContext';

function SaveButton() {
  const { saveAllCards, canProceedToCheckout } = useCardCollectionEditorActions();
  
  const handleSaveAll = async () => {
    await saveAllCards();
  };
  
  return (
    <button onClick={handleSaveAll} disabled={!canProceedToCheckout()}>
      Save All Cards
    </button>
  );
}
```

#### useCurrentCard
```tsx
import { useCurrentCard } from '@/contexts/CardCollectionEditorContext';

function CardDisplay() {
  const { card, index, totalCards } = useCurrentCard();
  
  return (
    <div>
      <h3>Card {index + 1} of {totalCards}</h3>
      <p>{card?.title}</p>
      <p>{card?.messageText}</p>
    </div>
  );
}
```

#### useCardNavigation
```tsx
import { useCardNavigation } from '@/contexts/CardCollectionEditorContext';

function NavigationButtons() {
  const {
    nextCard,
    previousCard,
    goToCard,
    isFirstCard,
    isLastCard,
  } = useCardNavigation();
  
  return (
    <div>
      <button onClick={previousCard} disabled={isFirstCard}>
        Previous
      </button>
      <button onClick={() => goToCard(5)}>
        Go to Card 6
      </button>
      <button onClick={nextCard} disabled={isLastCard}>
        Next
      </button>
    </div>
  );
}
```

## API Reference

### Context Provider Props

```typescript
interface CardCollectionEditorProviderProps {
  children: ReactNode;
  collectionId?: string;              // Collection ID for localStorage key
  autoSaveEnabled?: boolean;          // Enable/disable auto-save (default: true)
  autoSaveDebounceMs?: number;        // Auto-save delay in ms (default: 2000)
}
```

### Context State

```typescript
interface CardCollectionEditorContextType {
  // State
  collection: CardCollection | null;
  cards: Card[];
  currentCardIndex: number;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  imageUploadStates: Record<string, CardImageUploadState>;

  // Computed
  currentCard: Card | null;
  totalCards: number;
  isFirstCard: boolean;
  isLastCard: boolean;

  // Actions
  setCollection: (collection: CardCollection) => void;
  setCards: (cards: Card[]) => void;
  setCurrentCardIndex: (index: number) => void;
  updateCard: (cardId: string, data: Partial<UpdateCardInput>) => Promise<void>;
  updateCardLocal: (cardId: string, data: Partial<UpdateCardInput>) => void;
  saveCard: (cardId: string) => Promise<void>;
  saveAllCards: () => Promise<void>;
  nextCard: () => void;
  previousCard: () => void;
  goToCard: (index: number) => void;
  setImageUploadState: (cardId: string, state: Partial<CardImageUploadState>) => void;
  resetImageUploadState: (cardId: string) => void;
  canProceedToCheckout: () => boolean;
  restoreFromLocalStorage: () => boolean;
  clearLocalStorage: () => void;
}
```

### Image Upload State

```typescript
interface CardImageUploadState {
  isUploading: boolean;
  progress: number;      // 0-100
  error: string | null;
}
```

## Auto-Save Behavior

1. **Trigger**: Auto-save triggers after 2 seconds (configurable) of inactivity
2. **Storage**: Data is saved to localStorage with key `card-collection-editor-{collectionId}`
3. **Data Saved**:
   - Complete collection object
   - All 12 cards with current state
   - Current card index
   - Timestamp of save
4. **Restoration**: Call `restoreFromLocalStorage()` on mount to restore previous session
5. **Cleanup**: Call `clearLocalStorage()` after successful checkout

## Server Synchronization

### Optimistic Updates
```tsx
// Updates local state immediately, then syncs with server
await updateCard(cardId, { title: 'New Title' });
```

### Manual Save
```tsx
// Save without updating local state first
await saveCard(cardId);
```

### Batch Save
```tsx
// Save all 12 cards at once
await saveAllCards();
```

## Validation

### Checkout Validation
```tsx
const { canProceedToCheckout } = useCardCollectionEditor();

if (canProceedToCheckout()) {
  // All cards have valid data
  // Proceed to checkout
} else {
  // Show validation errors
}
```

The `canProceedToCheckout()` function validates:
- Collection exists
- Exactly 12 cards exist
- All cards have non-empty title
- All cards have non-empty message text
- All message texts are ≤500 characters

## Error Handling

All async operations (updateCard, saveCard, saveAllCards) throw errors that should be caught:

```tsx
try {
  await updateCard(cardId, data);
} catch (error) {
  console.error('Failed to save card:', error);
  // Show error message to user
}
```

## Performance Considerations

- **Debounced Auto-Save**: Prevents excessive localStorage writes
- **Optimistic Updates**: Immediate UI feedback without waiting for server
- **Selective Re-renders**: Use specialized hooks to prevent unnecessary re-renders
- **Batch Operations**: `saveAllCards()` uses Promise.all for parallel saves

## Integration with Components

### Editor Page
```tsx
function CardCollectionEditorPage() {
  const [collectionId, setCollectionId] = useState<string | null>(null);

  useEffect(() => {
    // Create or load collection
    const loadCollection = async () => {
      const response = await fetch('/api/card-collections/create', {
        method: 'POST',
        body: JSON.stringify({ recipientName: 'John', senderName: 'Jane' }),
      });
      const { collection } = await response.json();
      setCollectionId(collection.id);
    };
    loadCollection();
  }, []);

  if (!collectionId) return <div>Loading...</div>;

  return (
    <CardCollectionEditorProvider collectionId={collectionId}>
      <CardEditor />
    </CardCollectionEditorProvider>
  );
}
```

### Card Editor Component
```tsx
function CardEditor() {
  const {
    currentCard,
    updateCardLocal,
    saveCard,
    nextCard,
    previousCard,
  } = useCardCollectionEditor();

  const handleFieldChange = (field: string, value: string) => {
    updateCardLocal(currentCard.id, { [field]: value });
  };

  const handleSave = async () => {
    await saveCard(currentCard.id);
  };

  return (
    <form>
      <input
        value={currentCard?.title || ''}
        onChange={(e) => handleFieldChange('title', e.target.value)}
      />
      <textarea
        value={currentCard?.messageText || ''}
        onChange={(e) => handleFieldChange('messageText', e.target.value)}
      />
      <button type="button" onClick={handleSave}>Save</button>
      <button type="button" onClick={previousCard}>Previous</button>
      <button type="button" onClick={nextCard}>Next</button>
    </form>
  );
}
```

## Testing

### Unit Tests
```tsx
import { renderHook, act } from '@testing-library/react';
import { CardCollectionEditorProvider, useCardCollectionEditor } from './CardCollectionEditorContext';

test('navigates between cards', () => {
  const wrapper = ({ children }) => (
    <CardCollectionEditorProvider>{children}</CardCollectionEditorProvider>
  );
  
  const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });
  
  act(() => {
    result.current.setCards(mockCards);
  });
  
  expect(result.current.currentCardIndex).toBe(0);
  
  act(() => {
    result.current.nextCard();
  });
  
  expect(result.current.currentCardIndex).toBe(1);
});
```

## Related Files

- `src/types/card.ts` - Card and CardCollection type definitions
- `src/services/CardService.ts` - Card CRUD operations
- `src/services/CardCollectionService.ts` - Collection CRUD operations
- `src/contexts/WizardContext.tsx` - Similar pattern for message editor
