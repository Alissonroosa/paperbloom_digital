'use client';

import React from 'react';
import { Card } from '@/types/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Image as ImageIcon, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CardPreviewCard Component Props
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.5, 3.6
 */
export interface CardPreviewCardProps {
  card: Card;
  onEditMessage: () => void;
  onEditPhoto: () => void;
  className?: string;
}

/**
 * CardPreviewCard Component
 * 
 * Displays a preview card in the grouped editor view showing:
 * - Card title
 * - Message preview (first 100 characters)
 * - Media indicators (photo/music badges)
 * - Three action buttons with dynamic labels
 * 
 * Features:
 * - Responsive layout (mobile/tablet/desktop)
 * - Dynamic button labels based on media presence
 * - Visual indicators for photo and music
 * - Truncated message preview with ellipsis
 * - Optimized with React.memo to prevent unnecessary re-renders
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.5, 3.6
 */
export const CardPreviewCard = React.memo(function CardPreviewCard({
  card,
  onEditMessage,
  onEditPhoto,
  className,
}: CardPreviewCardProps) {
  // Determine button labels based on media presence
  const photoButtonLabel = card.imageUrl ? 'Editar Foto' : 'Adicionar Foto';

  // Check if card has required content
  const hasTitle = card.title.trim().length > 0;
  const hasMessage = card.messageText.trim().length > 0;
  const isComplete = hasTitle && hasMessage && card.messageText.length <= 500;

  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border-2 transition-all duration-200',
        isComplete
          ? 'border-green-200 hover:border-green-300 hover:shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md',
        className
      )}
      role="article"
      aria-labelledby={`card-title-${card.id}`}
      aria-describedby={`card-message-${card.id}`}
    >
      {/* Card Content */}
      <div className="p-3 space-y-3">
        {/* Header with Title and Badges */}
        <div className="space-y-2">
          {/* Title */}
          <h3 
            id={`card-title-${card.id}`}
            className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]"
          >
            {card.title || 'Sem título'}
          </h3>

          {/* Status and Media Indicators */}
          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Indicadores de conteúdo">
            {/* Message Completion Indicator - Requirement 9.2 */}
            {hasMessage && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 text-[10px] px-1.5 py-0.5"
                role="listitem"
              >
                <Edit3 className="w-2.5 h-2.5" aria-hidden="true" />
                <span>Mensagem</span>
              </Badge>
            )}
            
            {/* Photo Indicator - Requirement 9.3 */}
            {card.imageUrl && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1 text-[10px] px-1.5 py-0.5"
                role="listitem"
              >
                <ImageIcon className="w-2.5 h-2.5" aria-hidden="true" />
                <span>Foto</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons - Requirement 10.5: Touch targets min 44x44px */}
        <div className="flex gap-2" role="group" aria-label="Ações da carta">
          {/* Edit Message Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onEditMessage}
            className="flex-1 justify-center gap-1.5 text-xs min-h-[40px] touch-manipulation px-2"
            aria-label={`Editar mensagem da carta: ${card.title || 'sem título'}`}
          >
            <Edit3 className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">Mensagem</span>
          </Button>

          {/* Photo Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onEditPhoto}
            className="flex-1 justify-center gap-1.5 text-xs min-h-[40px] touch-manipulation px-2"
            aria-label={`${photoButtonLabel} da carta: ${card.title || 'sem título'}`}
          >
            <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">Foto</span>
          </Button>
        </div>
      </div>

      {/* Completion Indicator - Requirement 9.1, 9.2 */}
      {isComplete && (
        <div 
          className="absolute -top-3 -right-3 z-10"
          role="status"
          aria-label="Carta completa"
        >
          <div className="relative">
            {/* Checkmark Badge */}
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Pulse animation for emphasis */}
            <div className="absolute inset-0 w-8 h-8 bg-green-400 rounded-full animate-ping opacity-20" />
          </div>
        </div>
      )}
    </div>
  );
});
