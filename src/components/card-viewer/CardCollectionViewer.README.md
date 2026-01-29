# CardCollectionViewer Component

## Overview

The `CardCollectionViewer` component displays a grid of 12 cards with visual status indicators and handles the card opening flow with a confirmation modal.

## Features

- **Grid Layout**: Responsive grid displaying all 12 cards (Requirements 5.1, 5.2)
- **Visual Status**: Clear indicators for opened vs unopened cards (Requirement 5.2, 5.3)
- **Click Handling**: Interactive cards that trigger opening flow (Requirement 5.3)
- **Confirmation Modal**: Modal dialog before opening a card (Requirement 5.4)
- **Accessibility**: Full keyboard navigation and ARIA labels
- **Responsive Design**: Adapts from mobile to desktop

## Usage

```tsx
import { CardCollectionViewer } from '@/components/card-viewer';
import { Card } from '@/types/card';

function MyPage() {
  const [cards, setCards] = useState<Card[]>([]);

  const handleCardOpen = async (cardId: string) => {
    // Call API to open the card
    const response = await fetch(`/api/cards/${cardId}/open`, {
      method: 'POST',
    });
    
    if (response.ok) {
      const openedCard = await response.json();
      // Update local state or show card content
      setCards(prevCards => 
        prevCards.map(c => c.id === cardId ? openedCard : c)
      );
    }
  };

  return (
    <CardCollectionViewer
      cards={cards}
      onCardOpen={handleCardOpen}
      isLoading={false}
    />
  );
}
```

## Props

### `cards: Card[]` (required)
Array of 12 cards to display. Each card should have:
- `id`: Unique identifier
- `order`: Card number (1-12)
- `title`: Card title
- `status`: 'opened' | 'unopened'

### `onCardOpen: (cardId: string) => Promise<void>` (required)
Async callback function called when user confirms opening a card. Should:
1. Call the API to mark the card as opened
2. Update the card state
3. Show the card content (handled by parent component)

### `isLoading?: boolean` (optional)
When true, disables all card interactions. Default: `false`

## Visual States

### Unopened Card
- White background
- Gradient blue-purple icon
- "Fechada" badge in blue
- Hover effects (scale, shadow)
- Clickable

### Opened Card
- Gray background
- Gray unlock icon
- "Aberta" badge in gray
- Reduced opacity
- Not clickable

## Confirmation Modal

When a user clicks an unopened card, a modal appears with:
- Card number and title
- Warning about one-time opening
- Cancel and Confirm buttons
- Backdrop blur effect
- Keyboard accessible (ESC to close)

## Accessibility

- **Keyboard Navigation**: All cards are keyboard accessible
- **ARIA Labels**: Descriptive labels for screen readers
- **Focus Management**: Proper focus handling in modal
- **Role Attributes**: Correct semantic roles (dialog, button)
- **Visual Feedback**: Clear hover and focus states

## Grid Layout

The component uses a responsive grid:
- **Mobile (< 640px)**: 2 columns
- **Small (640px - 768px)**: 3 columns
- **Medium (768px - 1024px)**: 4 columns
- **Large (≥ 1024px)**: 6 columns

## Requirements Mapping

- **5.1**: Display interface with all 12 cards
- **5.2**: Show each card as a card with title
- **5.3**: Indicate visually which cards are opened/unopened
- **5.4**: Show confirmation modal before opening

## Integration Example

```tsx
// In a page component
'use client';

import { useState, useEffect } from 'react';
import { CardCollectionViewer } from '@/components/card-viewer';
import { Card, CardCollection } from '@/types/card';

export default function ViewCardsPage({ params }: { params: { slug: string } }) {
  const [collection, setCollection] = useState<CardCollection | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollection() {
      const response = await fetch(`/api/card-collections/slug/${params.slug}`);
      const data = await response.json();
      setCollection(data.collection);
      setCards(data.cards);
      setIsLoading(false);
    }
    loadCollection();
  }, [params.slug]);

  const handleCardOpen = async (cardId: string) => {
    const response = await fetch(`/api/cards/${cardId}/open`, {
      method: 'POST',
    });

    if (response.ok) {
      const { card: openedCard } = await response.json();
      
      // Update cards state
      setCards(prevCards =>
        prevCards.map(c => c.id === cardId ? openedCard : c)
      );

      // Show card content in a modal (implement CardModal component)
      // showCardModal(openedCard);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>12 Cartas de {collection?.senderName}</h1>
      <p>Para: {collection?.recipientName}</p>
      
      <CardCollectionViewer
        cards={cards}
        onCardOpen={handleCardOpen}
        isLoading={false}
      />
    </div>
  );
}
```

## Styling

The component uses Tailwind CSS with:
- Gradient backgrounds for unopened cards
- Smooth transitions and animations
- Backdrop blur for modal
- Responsive spacing and sizing
- Consistent with the Paper Bloom design system

## Testing

Key test scenarios:
1. Renders all 12 cards in correct order
2. Shows correct status for each card
3. Clicking unopened card opens confirmation modal
4. Clicking opened card does nothing
5. Confirming in modal calls onCardOpen
6. Canceling modal closes without action
7. Keyboard navigation works correctly
8. ARIA labels are present and correct

## Future Enhancements

- Animation when card is opened
- Sound effects for opening
- Confetti or celebration effect
- Card flip animation
- Filter/sort options
- Search functionality
