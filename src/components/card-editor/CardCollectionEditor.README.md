# CardCollectionEditor Component

## Overview

The `CardCollectionEditor` is the main wizard component for editing the 12 cards in the "12 Cartas" product. It provides a comprehensive interface for users to navigate through and personalize all 12 cards with messages, photos, and music.

## Features

### 1. Adapted WizardStepper for 12 Steps (Requirement 8.1)
- Displays a horizontal stepper showing all 12 cards
- Visual indicators for completed, current, and pending cards
- Clickable navigation to any card
- Compact design optimized for 12 steps

### 2. Progress Indicator (Requirement 8.2)
- Real-time progress bar showing completion percentage
- Card counter (e.g., "8 de 12 cartas")
- Visual feedback on overall progress
- Color-coded progress bar (blue to purple gradient)

### 3. Card Navigation (Requirement 8.3)
- Previous/Next buttons for sequential navigation
- Direct navigation via stepper clicks
- Grid view of all 12 cards in sidebar
- Keyboard-friendly navigation
- Disabled states for boundary conditions

### 4. CardEditorStep Integration (Requirement 8.3)
- Seamlessly integrates the CardEditorStep component
- Passes context data automatically
- Handles all card editing functionality
- Real-time validation and feedback

### 5. Finalization Button (Requirement 8.6)
- "Finalizar" button appears on the last card
- Validates all cards before allowing finalization
- Disabled state when cards are incomplete
- Loading state during processing
- Tooltip feedback for validation status

### 6. Auto-save Indicator
- Shows current save status (Saving, Saved, Unsaved changes)
- Displays last saved timestamp
- Visual icons for different states
- Automatic saving via context

## Usage

```tsx
import { CardCollectionEditor } from '@/components/card-editor';
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';

function MyPage() {
  const handleFinalize = async () => {
    // Navigate to checkout or perform finalization logic
    console.log('Finalizing card collection...');
  };

  return (
    <CardCollectionEditorProvider collectionId="some-uuid">
      <CardCollectionEditor 
        onFinalize={handleFinalize}
        isProcessing={false}
      />
    </CardCollectionEditorProvider>
  );
}
```

## Props

### CardCollectionEditorProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onFinalize` | `() => Promise<void>` | Yes | Callback function called when user clicks "Finalizar" button |
| `isProcessing` | `boolean` | No | Whether finalization is in progress (default: false) |

## Component Structure

```
CardCollectionEditor
├── Auto-save Indicator
│   ├── Save status icon
│   ├── Status text
│   └── Progress bar (cards completed)
│
├── Main Grid Layout
│   ├── Left Column (Editor)
│   │   ├── WizardStepper (12 steps)
│   │   ├── CardEditorStep (current card)
│   │   └── Navigation Buttons
│   │       ├── Previous Button
│   │       └── Next/Finalize Button
│   │
│   └── Right Column (Info Panel)
│       ├── About Section
│       ├── Progress Summary (12-card grid)
│       ├── Current Card Info
│       ├── Tips Section
│       └── Finalize Ready Message
```

## Card Labels

The component uses predefined labels for each of the 12 cards:

1. Dia Difícil
2. Insegurança
3. Distância
4. Estresse
5. Amor
6. Aniversário
7. Conquista
8. Chuva
9. Briga
10. Risada
11. Irritação
12. Insônia

## State Management

The component relies on the `CardCollectionEditorContext` for state management:

- **cards**: Array of all 12 cards
- **currentCardIndex**: Index of the currently displayed card (0-11)
- **completedCards**: Set of completed card numbers (1-12)
- **isSaving**: Whether a save operation is in progress
- **lastSaved**: Timestamp of last successful save
- **hasUnsavedChanges**: Whether there are unsaved changes

## Navigation Logic

### Step Click Navigation
- Users can click on any step in the stepper to navigate directly to that card
- All cards are accessible at any time (no linear progression required)

### Sequential Navigation
- "Anterior" button: Goes to previous card (disabled on first card)
- "Próxima" button: Goes to next card (disabled on last card)
- "Finalizar" button: Appears only on the last card

### Grid Navigation
- Sidebar displays a 6x2 grid of all 12 cards
- Each card shows its number and completion status
- Clicking a grid item navigates to that card
- Current card is highlighted with blue background
- Completed cards show green background
- Incomplete cards show gray background

## Progress Calculation

Progress is calculated based on completed cards:

```typescript
const completedCards = cards.filter(card => 
  card.title.trim().length > 0 && 
  card.messageText.trim().length > 0 && 
  card.messageText.length <= 500
);

const progressPercentage = (completedCards.length / 12) * 100;
```

## Finalization Logic

The "Finalizar" button is:
- **Visible**: Only on the last card (card 12)
- **Enabled**: When `canProceedToCheckout()` returns true (all cards valid)
- **Disabled**: When cards are incomplete or processing is in progress
- **Tooltip**: Shows reason when disabled

## Auto-save Behavior

The component displays auto-save status but doesn't handle saving directly:
- Saving is managed by `CardCollectionEditorContext`
- Auto-save triggers after 2 seconds of inactivity (configurable)
- Saves to both localStorage and server
- Visual feedback for all save states

## Accessibility

- **ARIA labels**: All interactive elements have descriptive labels
- **Keyboard navigation**: Full keyboard support for all controls
- **Progress bar**: Proper ARIA attributes for screen readers
- **Button states**: Clear disabled and loading states
- **Focus management**: Logical tab order

## Responsive Design

- **Desktop**: Two-column layout (editor + info panel)
- **Tablet**: Stacked layout with sticky info panel
- **Mobile**: Single column, optimized touch targets

## Related Components

- `CardEditorStep`: Individual card editor
- `WizardStepper`: Step indicator component
- `CardCollectionEditorContext`: State management context

## Requirements Mapping

- **8.1**: Wizard de criação com navegação entre as 12 Cartas
- **8.2**: Indicador de progresso mostrando quantas Cartas foram personalizadas
- **8.3**: Permitir que o usuário pule Cartas e volte depois
- **8.6**: Exibir um preview de cada Carta durante a edição (via CardEditorStep)

## Example: Complete Integration

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardCollectionEditor } from '@/components/card-editor';
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';

export default function CardEditorPage() {
  const router = useRouter();
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  // Load or create collection
  useEffect(() => {
    const loadCollection = async () => {
      // Check sessionStorage for existing collection
      const savedId = sessionStorage.getItem('cardCollectionId');
      
      if (savedId) {
        setCollectionId(savedId);
      } else {
        // Create new collection
        const response = await fetch('/api/card-collections/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientName: 'Destinatário',
            senderName: 'Remetente',
          }),
        });
        
        const { collection } = await response.json();
        sessionStorage.setItem('cardCollectionId', collection.id);
        setCollectionId(collection.id);
      }
    };

    loadCollection();
  }, []);

  const handleFinalize = async () => {
    if (!collectionId) return;

    setIsCreatingCheckout(true);
    try {
      // Create checkout session
      const response = await fetch('/api/checkout/card-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId }),
      });

      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      setIsCreatingCheckout(false);
    }
  };

  if (!collectionId) {
    return <div>Carregando...</div>;
  }

  return (
    <CardCollectionEditorProvider collectionId={collectionId}>
      <CardCollectionEditor 
        onFinalize={handleFinalize}
        isProcessing={isCreatingCheckout}
      />
    </CardCollectionEditorProvider>
  );
}
```

## Testing

The component should be tested for:

1. **Navigation**: All navigation methods work correctly
2. **Progress**: Progress indicator updates accurately
3. **Validation**: Finalize button enables/disables correctly
4. **Auto-save**: Save status displays correctly
5. **Accessibility**: All ARIA attributes are correct
6. **Responsive**: Layout adapts to different screen sizes

## Future Enhancements

- Preview panel showing card visualization
- Bulk operations (copy message to multiple cards)
- Template suggestions for each card
- Export/import functionality
- Undo/redo support
