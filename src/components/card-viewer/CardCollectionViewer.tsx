'use client';

import { useState } from 'react';
import { Card as CardType } from '@/types/card';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lock, Unlock, X } from 'lucide-react';

interface CardCollectionViewerProps {
  cards: CardType[];
  onCardOpen: (cardId: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * CardCollectionViewer Component
 * Displays a grid of 12 cards with visual status indicators
 * 
 * Features:
 * - Grid layout with 12 cards
 * - Visual status indicators (opened/unopened)
 * - Click handler for opening cards
 * - Confirmation modal before opening
 * - Responsive design
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export function CardCollectionViewer({ 
  cards, 
  onCardOpen, 
  isLoading = false 
}: CardCollectionViewerProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  /**
   * Handle card click
   * Requirement: 5.3 - Indicate visually which cards are opened/unopened
   */
  const handleCardClick = (card: CardType) => {
    if (card.status === 'unopened') {
      setSelectedCard(card);
    }
  };

  /**
   * Handle confirmation to open card
   * Requirement: 5.4 - Show confirmation modal before opening
   */
  const handleConfirmOpen = async () => {
    if (!selectedCard) return;

    setIsOpening(true);
    try {
      await onCardOpen(selectedCard.id);
      setSelectedCard(null);
    } catch (error) {
      console.error('Error opening card:', error);
    } finally {
      setIsOpening(false);
    }
  };

  /**
   * Handle cancel confirmation
   */
  const handleCancelOpen = () => {
    setSelectedCard(null);
  };

  /**
   * Sort cards by order
   */
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Card Grid - Requirement: 5.1, 5.2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
        {sortedCards.map((card) => {
          const isOpened = card.status === 'opened';
          
          return (
            <Card
              key={card.id}
              className={`
                relative cursor-pointer transition-all duration-300
                ${isOpened 
                  ? 'opacity-60 hover:opacity-70 bg-gray-100' 
                  : 'hover:shadow-lg hover:scale-105 bg-white'
                }
                ${isLoading ? 'pointer-events-none' : ''}
              `}
              onClick={() => handleCardClick(card)}
              role="button"
              tabIndex={isOpened ? -1 : 0}
              aria-label={`${card.title} - ${isOpened ? 'Já aberta' : 'Clique para abrir'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card);
                }
              }}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center min-h-[160px] space-y-3">
                {/* Status Icon - Requirement: 5.2 */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${isOpened 
                    ? 'bg-gray-300 text-gray-600' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                  }
                `}>
                  {isOpened ? (
                    <Unlock className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Lock className="w-6 h-6" aria-hidden="true" />
                  )}
                </div>

                {/* Card Number */}
                <div className={`
                  text-2xl font-bold
                  ${isOpened ? 'text-gray-500' : 'text-gray-900'}
                `}>
                  Carta {card.order}
                </div>

                {/* Card Title */}
                <div className={`
                  text-xs text-center line-clamp-2
                  ${isOpened ? 'text-gray-500' : 'text-gray-700'}
                `}>
                  {card.title}
                </div>

                {/* Status Badge */}
                <div className={`
                  text-xs font-semibold px-2 py-1 rounded-full
                  ${isOpened 
                    ? 'bg-gray-200 text-gray-600' 
                    : 'bg-blue-100 text-blue-700'
                  }
                `}>
                  {isOpened ? 'Aberta' : 'Fechada'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Modal - Requirement: 5.4 */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-open-title"
          onClick={handleCancelOpen}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCancelOpen}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 
                id="confirm-open-title"
                className="text-2xl font-bold text-gray-900"
              >
                Abrir esta carta?
              </h2>
              <p className="text-sm text-gray-600">
                Carta {selectedCard.order}
              </p>
            </div>

            {/* Card Title */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 text-center">
                {selectedCard.title}
              </p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900 text-center">
                ⚠️ <strong>Atenção:</strong> Esta carta só pode ser aberta uma única vez. 
                Depois de aberta, você não poderá ver seu conteúdo novamente.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelOpen}
                disabled={isOpening}
                className="flex-1"
                aria-label="Cancelar abertura"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmOpen}
                disabled={isOpening}
                className="flex-1"
                aria-label="Confirmar abertura da carta"
              >
                {isOpening ? 'Abrindo...' : 'Abrir Carta'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
