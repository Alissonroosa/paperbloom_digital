'use client';

import { Card } from '@/types/card';
import { Lock, Check } from 'lucide-react';

interface CardMapProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
}

/**
 * Grid of 12 cards showing open/closed status.
 * 4 columns on mobile, 6 columns on desktop.
 */
export function CardMap({ cards, onCardClick }: CardMapProps) {
  const sorted = [...cards].sort((a, b) => a.order - b.order);

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
      {sorted.map(card => {
        const isOpened = card.status === 'opened';

        return (
          <button
            key={card.id}
            onClick={() => onCardClick(card)}
            className={`
              aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-1 p-2
              border-2 transition-all duration-200 hover:scale-105 hover:shadow-md
              ${isOpened
                ? 'bg-[#E6C2C2] border-[#D4A5A5] text-[#8B5F5F]'
                : 'bg-white border-[#E6C2C2] text-[#4A4A4A]'
              }
            `}
            aria-label={`Carta ${card.order}: ${card.title}`}
          >
            {isOpened ? (
              <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span className="text-[10px] font-bold leading-none">{card.order}</span>
            <span className="text-[9px] leading-tight text-center line-clamp-2 w-full px-0.5">
              {card.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
