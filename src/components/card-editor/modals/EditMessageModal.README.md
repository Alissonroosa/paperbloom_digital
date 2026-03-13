# EditMessageModal Component

## Overview

Modal component for editing card title and message text with validation, character counting, and unsaved changes protection.

## Requirements

Implements the following requirements from the spec:
- **3.2**: Opens modal when user clicks "Editar Mensagem"
- **4.1**: Displays card title
- **4.2**: Displays editable text field with current content
- **4.3**: Allows free text editing
- **4.4**: Saves changes and closes modal on "Salvar"
- **4.5**: Discards changes and closes modal on "Cancelar"
- **4.6**: Confirms before closing with unsaved changes

## Features

### Input Fields
- **Title Field**: 200 character maximum
- **Message Field**: 500 character maximum
- Real-time character counter for both fields
- Visual feedback when limits are exceeded

### Validation
- Title cannot be empty
- Message cannot be empty
- Character limits enforced
- Error messages displayed inline
- Save button disabled when validation fails

### User Experience
- Unsaved changes detection
- Confirmation dialog before discarding changes
- Keyboard shortcuts (Ctrl+Enter to save, Escape to close)
- Prevents body scroll when open
- Responsive design (fullscreen on mobile)

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Props

```typescript
interface EditMessageModalProps {
  card: Card;                    // The card being edited
  isOpen: boolean;               // Controls modal visibility
  onClose: () => void;           // Called when modal should close
  onSave: (                      // Called when user saves changes
    cardId: string,
    data: { title: string; messageText: string }
  ) => Promise<void>;
}
```

## Usage Example

```tsx
import { EditMessageModal } from '@/components/card-editor/modals/EditMessageModal';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const { updateCard } = useCardCollectionEditor();

  const handleEditMessage = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleSave = async (cardId: string, data: { title: string; messageText: string }) => {
    await updateCard(cardId, data);
  };

  return (
    <>
      <button onClick={() => handleEditMessage(card)}>
        Editar Mensagem
      </button>

      {selectedCard && (
        <EditMessageModal
          card={selectedCard}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
```

## Character Limits

- **Title**: 200 characters maximum
- **Message**: 500 characters maximum

Both fields show a real-time character counter that turns red when the limit is exceeded.

## Validation Rules

1. **Title Validation**:
   - Cannot be empty
   - Cannot exceed 200 characters
   - Whitespace is trimmed before saving

2. **Message Validation**:
   - Cannot be empty
   - Cannot exceed 500 characters
   - Whitespace is trimmed before saving

## Keyboard Shortcuts

- **Escape**: Close modal (with confirmation if changes exist)
- **Ctrl+Enter** (or **Cmd+Enter** on Mac): Save changes

## Responsive Behavior

### Mobile (< 640px)
- Modal takes full viewport height
- Buttons stack vertically
- Fullscreen experience

### Tablet/Desktop (≥ 640px)
- Modal is centered with max-width
- Buttons arranged horizontally
- Padding and spacing optimized for larger screens

## Unsaved Changes Flow

1. User makes changes to title or message
2. User attempts to close modal (Cancel button, backdrop click, or Escape key)
3. If changes exist, confirmation dialog appears with 3 options:
   - **Descartar**: Close without saving
   - **Continuar Editando**: Return to editing
   - **Salvar**: Save changes and close

## Error Handling

### Validation Errors
- Displayed inline below each field
- Red border on invalid fields
- Save button disabled until errors are resolved

### Save Errors
- Error message displayed if save fails
- Modal remains open
- User can retry or cancel

## Styling

Uses Tailwind CSS with the following design tokens:
- Primary color: Blue (focus rings, buttons)
- Error color: Red (validation errors, exceeded limits)
- Gray scale: For text, borders, and backgrounds
- Responsive breakpoints: sm (640px), md (768px)

## Accessibility Features

- **ARIA Labels**: All interactive elements properly labeled
- **ARIA Roles**: Modal and dialog roles correctly applied
- **ARIA Descriptions**: Error messages linked to inputs
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Focus trapped within modal
- **Screen Reader**: Announces validation errors and state changes

## Testing

See `EditMessageModal.test.tsx` for unit tests covering:
- Rendering with card data
- Character counting
- Validation logic
- Save/cancel behavior
- Unsaved changes confirmation
- Keyboard shortcuts
- Responsive layout

## Related Components

- `CardPreviewCard`: Displays the "Editar Mensagem" button
- `CardGridView`: Contains multiple CardPreviewCard components
- `GroupedCardCollectionEditor`: Manages modal state

## Dependencies

- React (hooks: useState, useEffect, useCallback)
- `@/types/card`: Card type definition
- `@/components/ui/Button`: Button component
- Tailwind CSS: Styling
