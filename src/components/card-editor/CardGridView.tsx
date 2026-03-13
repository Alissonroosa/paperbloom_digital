'use client';

import React from 'react';
import { Card } from '@/types/card';
import { CardPreviewCard } from './CardPreviewCard';
import { cn } from '@/lib/utils';

/**
 * CardGridView Component Props
 * Requirements: 2.1, 2.6
 */
export interface CardGridViewProps {
  cards: Card[];
  onEditMessage: (cardId: string) => void;
  onEditPhoto: (cardId: string) => void;
  className?: string;
}

/**
 * CardGridView Component
 * 
 * Displays a responsive grid of card preview cards for a thematic moment.
 * Shows 4 cards simultaneously with action buttons for editing.
 * 
 * Features:
 * - Responsive grid layout (1 col mobile, 2 cols tablet/desktop)
 * - Renders 4 CardPreviewCard components
 * - Handles callbacks for message, photo, and music editing
 * - Smooth transition animations when switching moments
 * - Accessible keyboard navigation
 * - Optimized with React.memo to prevent unnecessary re-renders
 * 
 * Layout:
 * - Mobile (< 640px): 1 column
 * - Tablet/Desktop (>= 640px): 2 columns
 * 
 * Requirements: 2.1, 2.6
 */
export const CardGridView = React.memo(function CardGridView({
  cards,
  onEditMessage,
  onEditPhoto,
  className,
}: CardGridViewProps) {
  // Sort cards by order to ensure consistent display
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-6',
        'grid-cols-1 sm:grid-cols-2',
        'animate-in fade-in duration-300',
        className
      )}
      role="list"
      aria-label="Cards in current moment"
    >
      {sortedCards.map((card) => (
        <div
          key={card.id}
          role="listitem"
          className="animate-in slide-in-from-bottom-4 duration-300"
          style={{
            animationDelay: `${(card.order % 4) * 50}ms`,
          }}
        >
          <CardPreviewCard
            card={card}
            onEditMessage={() => onEditMessage(card.id)}
            onEditPhoto={() => onEditPhoto(card.id)}
          />
        </div>
      ))}
    </div>
  );
});
