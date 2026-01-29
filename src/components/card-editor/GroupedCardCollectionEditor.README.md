# GroupedCardCollectionEditor Component

## Overview

The `GroupedCardCollectionEditor` is the main orchestrator component for the grouped card collection editing experience. It replaces the traditional step-by-step wizard with a moment-based approach, allowing users to view and edit multiple cards simultaneously.

## Features

### Header Section
- **Overall Progress Indicator**: Shows X of 12 cards completed with percentage
- **Progress Bar**: Visual representation of overall completion
- **Auto-save Indicator**: Real-time save status with "Clear Draft" option

### Main Content
- **Moment Navigation**: 3 buttons for navigating between thematic moments
- **Current Moment Title**: Displays the active moment's title and description
- **Card Grid**: Shows 4 cards from the current moment in a responsive grid

### Footer Section
- **Previous Button**: Navigate to previous moment (hidden on first moment)
- **Moment Indicator**: Shows current moment (X of 3) and completion status
- **Next/Finalize Button**: Navigate to next moment or finalize when on last moment

### Modal Management
- **Edit Message Modal**: Opens when user clicks "Editar Mensagem"
- **Photo Upload Modal**: Opens when user clicks "Adicionar/Editar Foto"
- **Music Selection Modal**: Opens when user clicks "Adicionar/Editar Música"

## Props

```typescript
interface GroupedCardCollectionEditorProps {
  onFinalize: () => Promise<void>;  // Callback when user clicks "Finalizar e Comprar"
  isProcessing?: boolean;            // Disables navigation during processing
}
```

## Context Integration

The component uses multiple context hooks:

- `useCardCollectionEditorState()`: Read-only state (cards, saving status, etc.)
- `useCardCollectionEditorActions()`: Actions (updateCard, clearLocalStorage, etc.)
- `useThematicMoments()`: Moment-specific state and navigation

## Modal State Management

The component manages which modal is open and which card is being edited:

```typescript
type ModalType = 'message' | 'photo' | 'music' | null;

const [activeModal, setActiveModal] = useState<ModalType>(null);
const [activeCardId, setActiveCardId] = useState<string | null>(null);
```

## Progress Calculation

### Overall Progress
- Counts cards with valid title and message (non-empty, within limits)
- Displays as "X of 12" and percentage

### Moment Progress
- Each moment shows "X/4 cartas completas"
- Calculated by `getMomentCompletionStatus()`

## Navigation Flow

1. **First Moment**: Only "Próximo" button visible
2. **Middle Moment**: Both "Anterior" and "Próximo" buttons visible
3. **Last Moment**: "Anterior" and "Finalizar e Comprar" buttons visible

## Finalization

The "Finalizar e Comprar" button:
- Only enabled when `canProceedToCheckout()` returns true
- Requires all 12 cards to have valid title and message
- Calls `onFinalize()` callback
- Clears localStorage after successful finalization

## Responsive Design

- **Mobile**: Stacked layout, full-width buttons
- **Tablet**: Horizontal layout, auto-width buttons
- **Desktop**: Optimized spacing and layout

## Accessibility

- Proper ARIA labels on progress indicators
- Keyboard navigation support
- Focus management in modals
- Screen reader announcements for progress changes

## Requirements Mapping

- **7.3**: Preserves edits when navigating between moments
- **7.5**: Displays Previous/Next/Finalize buttons based on current moment
- **7.6**: Finalize button only on last moment
- **7.7**: Previous/Next buttons on appropriate moments
- **9.1**: Overall progress indicator in header

## Usage Example

```tsx
import { GroupedCardCollectionEditor } from '@/components/card-editor/GroupedCardCollectionEditor';
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';

function EditorPage() {
  const handleFinalize = async () => {
    // Navigate to checkout
    router.push('/checkout');
  };

  return (
    <CardCollectionEditorProvider collectionId={collectionId}>
      <GroupedCardCollectionEditor
        onFinalize={handleFinalize}
        isProcessing={false}
      />
    </CardCollectionEditorProvider>
  );
}
```

## Component Structure

```
GroupedCardCollectionEditor
├── Header
│   ├── Title & Description
│   ├── Overall Progress Badge
│   ├── Progress Bar
│   └── Auto-save Indicator
├── Main Content
│   ├── MomentNavigation
│   ├── Current Moment Title
│   └── CardGridView
│       └── CardPreviewCard (x4)
├── Footer
│   ├── Previous Button
│   ├── Moment Indicator
│   └── Next/Finalize Button
└── Modals
    ├── EditMessageModal
    ├── PhotoUploadModal
    └── MusicSelectionModal
```

## State Flow

1. User clicks action button on a card
2. `handleEditMessage/Photo/Music` sets `activeCardId` and `activeModal`
3. Appropriate modal opens with the active card
4. User makes changes and saves
5. Modal calls `handleSave*` callback
6. Callback calls `updateCard()` from context
7. Context updates card and triggers auto-save
8. Modal closes, grid updates with new data

## Auto-save Behavior

- Debounced auto-save to localStorage (2 seconds)
- Shows "Salvando..." during save
- Shows "Salvo X tempo atrás" after save
- "Clear Draft" button available when changes exist

## Error Handling

- Modal save errors are handled within each modal
- Network errors show toast notifications
- Failed saves maintain local state for retry
- Auto-save failures are logged but don't block UI

## Performance Considerations

- Cards are memoized to prevent unnecessary re-renders
- Modals are conditionally rendered (only when open)
- Progress calculations are memoized
- Context selectors prevent over-rendering

## Testing

See `GroupedCardCollectionEditor.test.tsx` for unit tests covering:
- Modal opening/closing
- Navigation between moments
- Progress calculation
- Finalization logic
- Auto-save integration

## Related Components

- `MomentNavigation`: Moment selection buttons
- `CardGridView`: Grid of card previews
- `CardPreviewCard`: Individual card preview
- `EditMessageModal`: Message editing modal
- `PhotoUploadModal`: Photo upload modal
- `MusicSelectionModal`: Music selection modal
- `AutoSaveIndicator`: Save status indicator
