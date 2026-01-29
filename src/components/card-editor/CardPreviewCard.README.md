# CardPreviewCard Component

## Overview

The `CardPreviewCard` component displays a preview of a card in the grouped editor view. It shows the card's title, a truncated message preview, media indicators, and three action buttons for editing different aspects of the card.

## Features

- **Title Display**: Shows the card title with line clamping for long titles
- **Message Preview**: Displays first 100 characters of the message with ellipsis
- **Progress Indicators**: Visual badges showing completion status
  - Green "Mensagem" badge when card has message (Requirement 9.2)
  - Blue "Foto" badge when card has photo (Requirement 9.3)
  - Purple "Música" badge when card has music (Requirement 9.4)
- **Dynamic Button Labels**: Button text changes based on media presence (Add vs Edit)
- **Completion Indicator**: Enhanced visual checkmark with pulse animation when card is complete (Requirement 9.1, 9.2)
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Requirements Validation

This component validates the following requirements:

- **2.1**: Displays all cards of a moment simultaneously
- **2.2**: Shows card title
- **2.3**: Shows card message content (preview)
- **2.4**: Displays visual indicator when photo is present
- **2.5**: Displays visual indicator when music is present
- **3.1**: Shows 3 action buttons (Edit Message, Add/Edit Photo, Add/Edit Music)
- **3.5**: Button label changes to "Editar Foto" when photo exists
- **3.6**: Button label changes to "Editar Música" when music exists
- **9.1**: Displays completion indicator for complete cards
- **9.2**: Shows message completion badge when card has personalized message
- **9.3**: Shows photo indicator badge when card has photo
- **9.4**: Shows music indicator badge when card has music

## Props

```typescript
interface CardPreviewCardProps {
  card: Card;                    // The card to display
  onEditMessage: () => void;     // Callback when Edit Message is clicked
  onEditPhoto: () => void;       // Callback when photo button is clicked
  onEditMusic: () => void;       // Callback when music button is clicked
  className?: string;            // Optional additional CSS classes
}
```

## Usage Example

```tsx
import { CardPreviewCard } from '@/components/card-editor/CardPreviewCard';
import { Card } from '@/types/card';

function MyComponent() {
  const card: Card = {
    id: '123',
    collectionId: 'abc',
    order: 1,
    title: 'Abra quando... estiver tendo um dia difícil',
    messageText: 'Sei que hoje não está sendo fácil...',
    imageUrl: 'https://example.com/photo.jpg',
    youtubeUrl: null,
    status: 'unopened',
    openedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <CardPreviewCard
      card={card}
      onEditMessage={() => console.log('Edit message')}
      onEditPhoto={() => console.log('Edit photo')}
      onEditMusic={() => console.log('Edit music')}
    />
  );
}
```

## Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Smaller padding (p-4)
- Compact button spacing
- Full-width buttons

### Tablet (640px - 1024px)
- Increased padding (p-5)
- Larger text sizes
- Better spacing between elements

### Desktop (> 1024px)
- Maximum visual clarity
- Optimal spacing
- Hover effects more prominent

## Visual States

### Default State
- Gray border (border-gray-200)
- White background
- Subtle hover effect
- No completion indicator

### Complete State
- Green border (border-green-200)
- Enhanced green checkmark indicator (8x8 size)
- Pulse animation on checkmark for emphasis
- Enhanced hover effect
- White border around checkmark for contrast

### Progress Badges
- **Message Badge**: Green background (bg-green-100) with green text and Edit3 icon
- **Photo Badge**: Blue background (bg-blue-100) with blue text and ImageIcon
- **Music Badge**: Purple background (bg-purple-100) with purple text and Music icon
- All badges appear in a flex-wrap row below the title
- Badges only show when corresponding content exists

## Accessibility

- All buttons have descriptive `aria-label` attributes
- Completion indicator has `role="status"` and `aria-label="Carta completa"`
- Proper semantic HTML structure
- Keyboard navigation support
- Focus visible states
- Screen reader friendly
- Color is not the only indicator (icons + text labels)

## Styling

The component uses Tailwind CSS with the following key classes:

- `rounded-lg`: Rounded corners
- `border-2`: Prominent border
- `hover:shadow-md`: Elevation on hover
- `line-clamp-2`: Title truncation
- `line-clamp-3`: Message truncation
- `transition-all`: Smooth animations

## Integration with Context

This component is designed to work with the `CardCollectionEditorContext`:

```tsx
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { CardPreviewCard } from '@/components/card-editor/CardPreviewCard';

function CardGrid() {
  const { getCurrentMomentCards } = useCardCollectionEditor();
  const cards = getCurrentMomentCards();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map(card => (
        <CardPreviewCard
          key={card.id}
          card={card}
          onEditMessage={() => openMessageModal(card.id)}
          onEditPhoto={() => openPhotoModal(card.id)}
          onEditMusic={() => openMusicModal(card.id)}
        />
      ))}
    </div>
  );
}
```

## Testing

The component should be tested for:

1. **Rendering**: Displays title, message preview, and buttons
2. **Progress Indicators**: 
   - Message badge appears when card has message (Requirement 9.2)
   - Photo badge appears when card has photo (Requirement 9.3)
   - Music badge appears when card has music (Requirement 9.4)
   - All badges can appear simultaneously
3. **Dynamic Labels**: Button text changes based on media presence
4. **Callbacks**: All three buttons trigger correct callbacks
5. **Truncation**: Long titles and messages are properly truncated
6. **Completion**: 
   - Checkmark appears when card is complete (Requirement 9.1)
   - Pulse animation works correctly
   - Checkmark has proper accessibility attributes
7. **Responsive**: Layout adapts to different screen sizes
8. **Badge Wrapping**: Badges wrap correctly on small screens

### Test Cases

```typescript
// Test Case 1: Empty card - no badges
const emptyCard = { title: '', messageText: '', imageUrl: null, youtubeUrl: null };
// Expected: No badges, no checkmark

// Test Case 2: Message only
const messageCard = { title: 'Title', messageText: 'Message', imageUrl: null, youtubeUrl: null };
// Expected: Green "Mensagem" badge + checkmark

// Test Case 3: Message + Photo
const photoCard = { title: 'Title', messageText: 'Message', imageUrl: 'url', youtubeUrl: null };
// Expected: Green + Blue badges + checkmark

// Test Case 4: Message + Music
const musicCard = { title: 'Title', messageText: 'Message', imageUrl: null, youtubeUrl: 'url' };
// Expected: Green + Purple badges + checkmark

// Test Case 5: Complete card
const completeCard = { title: 'Title', messageText: 'Message', imageUrl: 'url', youtubeUrl: 'url' };
// Expected: All three badges + checkmark
```

## Related Components

- `CardGridView`: Parent component that renders multiple CardPreviewCards
- `EditMessageModal`: Modal opened by Edit Message button
- `PhotoUploadModal`: Modal opened by photo button
- `MusicSelectionModal`: Modal opened by music button
