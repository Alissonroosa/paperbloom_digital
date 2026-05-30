'use client';

import React from 'react';
import { Card } from '@/types/card';
import { Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardPreviewCardProps {
  card: Card;
  onEditMessage: () => void;
  onEditPhoto: () => void;
  className?: string;
}

export const CardPreviewCard = React.memo(function CardPreviewCard({
  card,
  onEditMessage,
  onEditPhoto,
  className,
}: CardPreviewCardProps) {
  const hasPhoto = !!card.imageUrl;
  const hasMessage = card.messageText.trim().length > 0;

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md p-4',
        className
      )}
      role="article"
      aria-labelledby={`card-title-${card.id}`}
    >
      {/* Edit message — pencil icon top-right */}
      <button
        type="button"
        onClick={onEditMessage}
        className="absolute top-2.5 right-2.5 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-purple-100 text-gray-500 hover:text-purple-600 transition-colors"
        aria-label={`Editar mensagem da carta ${card.order}: ${card.title || 'sem título'}`}
      >
        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      <div className="flex gap-3 pr-8">
        {/* Photo slot — clickable square */}
        <button
          type="button"
          onClick={onEditPhoto}
          className={cn(
            'flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all flex items-center justify-center',
            hasPhoto
              ? 'ring-1 ring-gray-200 hover:ring-purple-300'
              : 'border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/50 bg-gray-50'
          )}
          aria-label={
            hasPhoto
              ? `Trocar foto da carta ${card.order}`
              : `Adicionar foto à carta ${card.order}`
          }
        >
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.imageUrl ?? undefined}
              alt={`Foto da carta ${card.order}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <Plus className="w-5 h-5 text-gray-400" aria-hidden="true" />
          )}
        </button>

        {/* Title + message preview */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-purple-500 font-semibold mb-0.5">
            Carta {card.order}
          </p>
          <h3
            id={`card-title-${card.id}`}
            className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1.5"
          >
            {card.title || 'Sem título'}
          </h3>
          {hasMessage ? (
            <p className="text-xs text-gray-600 leading-snug line-clamp-3 whitespace-pre-line">
              {card.messageText}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Sem mensagem ainda
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
