# CardGridView Component

## Overview

The `CardGridView` component displays a responsive grid of card preview cards for a thematic moment in the grouped 12-card editor. It shows 4 cards simultaneously with action buttons for editing messages, photos, and music.

## Requirements

**Validates Requirements:**
- 2.1: Display all cards of a thematic moment simultaneously
- 2.6: Visually organized and legible card display

## Features

- **Responsive Grid Layout**: Adapts to different screen sizes
  - Mobile (< 640px): 1 column
  - Tablet/Desktop (≥ 640px): 2 columns
- **4 Card Display**: Shows exactly 4 cards per thematic moment
- **Action Callbacks**: Handles editing actions for message, photo, and music
- **Smooth Animations**: Fade-in and slide-in transitions when switching moments
- **Staggered Animation**: Cards animate in with slight delays for visual appeal
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Props

```typescript
interface CardGridViewProps {
  cards: Card[];                          // Array of 4 cards to display
  onEditMessage: (cardId: string) => void; // Callback for editing message
  onEditPhoto: (cardId: string) => void;   // Callback for editing photo
  onEditMusic: (cardId: string) => void;   // Callback for editing music
  className?: string;                      // Optional additional CSS classes
}
```

## Usage

```tsx
import { CardGridView } from '@/components/card-editor/CardGridView';

function MomentEditor() {
  const currentMomentCards = [card1, card2, card3, card4];

  const handleEditMessage = (cardId: string) => {
    // Open message editing modal
  };

  const handleEditPhoto = (cardId: string) => {
    // Open photo upload modal
  };

  const handleEditMusic = (cardId: string) => {
    // Open music selection modal
  };

  return (
    <CardGridView
      cards={currentMomentCards}
      onEditMessage={handleEditMessage}
      onEditPhoto={handleEditPhoto}
      onEditMusic={handleEditMusic}
    />
  );
}
```

## Layout Behavior

### Mobile (< 640px)
```
┌─────────────────┐
│     Card 1      │
├─────────────────┤
│     Card 2      │
├─────────────────┤
│     Card 3      │
├─────────────────┤
│     Card 4      │
└─────────────────┘
```

### Tablet/Desktop (≥ 640px)
```
┌─────────┬─────────┐
│ Card 1  │ Card 2  │
├─────────┼─────────┤
│ Card 3  │ Card 4  │
└─────────┴─────────┘
```

## Animation Details

- **Grid Fade-in**: The entire grid fades in when rendered (300ms)
- **Card Slide-in**: Each card slides in from bottom with staggered timing
  - Card 1: 0ms delay
  - Card 2: 50ms delay
  - Card 3: 100ms delay
  - Card 4: 150ms delay

## Accessibility

- **Role**: Grid container has `role="list"` for screen readers
- **List Items**: Each card wrapper has `role="listitem"`
- **ARIA Label**: Grid labeled as "Cards in current moment"
- **Keyboard Navigation**: All interactive elements are keyboard accessible through CardPreviewCard

## Integration with CardPreviewCard

The CardGridView renders 4 `CardPreviewCard` components, passing through:
- Card data
- Individual callback handlers for each card
- Proper event handling for all actions

## Styling

- Uses Tailwind CSS for responsive grid layout
- Leverages `cn()` utility for conditional class merging
- Supports custom className prop for additional styling
- Consistent spacing: 4 units (1rem) on mobile, 6 units (1.5rem) on larger screens

## Performance Considerations

- Cards are sorted by order to ensure consistent display
- Shallow copy of cards array prevents mutation
- Staggered animations improve perceived performance
- Minimal re-renders through proper key usage

## Testing

See `__tests__/CardGridView.test.tsx` for:
- Rendering 4 cards correctly
- Responsive layout behavior
- Callback invocation
- Animation presence
- Accessibility attributes

## Related Components

- **CardPreviewCard**: Individual card preview component
- **GroupedCardCollectionEditor**: Parent component that uses CardGridView
- **MomentNavigation**: Sibling component for moment navigation

## Design Decisions

1. **Fixed 4-Card Display**: Each moment always shows exactly 4 cards
2. **Responsive Breakpoint**: 640px (sm) chosen to match Tailwind's standard breakpoints
3. **Animation Timing**: 300ms duration with 50ms stagger provides smooth visual feedback
4. **Grid vs Flex**: Grid chosen for consistent card sizing and alignment
5. **Sort by Order**: Ensures cards always display in correct sequence regardless of data order
