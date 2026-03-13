'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CardCollection, Card } from '@/types/card';
import { CardCollectionViewer } from '@/components/card-viewer/CardCollectionViewer';
import { CardModal } from '@/components/card-viewer/CardModal';
import { Heart, Loader2 } from 'lucide-react';

/**
 * Card Collection Visualization Page
 * 
 * This page displays a card collection to the recipient, allowing them to view
 * and open the 12 cards. Each card can only be opened once.
 * 
 * Requirements: 5.1, 5.5
 * 
 * Features:
 * - Fetch collection by slug
 * - Display sender information
 * - Integrate CardCollectionViewer for grid display
 * - Handle card opening logic
 * - Show CardModal when a card is opened
 * - Error handling and loading states
 */
export default function CardCollectionPage() {
  const params = useParams();
  const slug = params.slug as string;

  // State management
  const [collection, setCollection] = useState<CardCollection | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isFirstOpen, setIsFirstOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  /**
   * Fetch collection and cards on mount
   * Requirement: 5.1 - Fetch collection by slug
   */
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/card-collections/slug/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Conjunto de cartas não encontrado');
          }
          throw new Error('Erro ao carregar conjunto de cartas');
        }

        const data = await response.json();
        setCollection(data.collection);
        setCards(data.cards);
      } catch (err) {
        console.error('Error fetching collection:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchCollection();
    }
  }, [slug]);

  /**
   * Handle card opening
   * Requirement: 5.5 - Implement card opening logic
   */
  const handleCardOpen = async (cardId: string) => {
    try {
      setIsOpening(true);

      // Call API to open the card
      const response = await fetch(`/api/cards/${cardId}/open`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao abrir carta');
      }

      const data = await response.json();
      
      // Update the card in local state
      setCards(prevCards =>
        prevCards.map(card =>
          card.id === cardId
            ? { ...card, ...data.card, status: 'opened' as const }
            : card
        )
      );

      // Show the modal with the opened card
      const openedCard = data.card;
      setSelectedCard(openedCard);
      setIsFirstOpen(!data.alreadyOpened);
    } catch (err) {
      console.error('Error opening card:', err);
      alert('Erro ao abrir carta. Por favor, tente novamente.');
    } finally {
      setIsOpening(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setSelectedCard(null);
    setIsFirstOpen(false);
  };

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" aria-hidden="true" />
          <p className="text-lg text-gray-700 font-medium">
            Carregando suas cartas especiais...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-red-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Oops!
          </h1>
          <p className="text-gray-600">
            {error || 'Conjunto de cartas não encontrado'}
          </p>
          <p className="text-sm text-gray-500">
            Verifique se o link está correto ou entre em contato com quem enviou as cartas.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Main content
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header with sender information - Requirement: 5.1 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            {/* Decorative element */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
            </div>

            {/* Sender information */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              12 Cartas Especiais
            </h1>
            <p className="text-lg text-gray-700">
              De <span className="font-semibold text-blue-600">{collection.senderName}</span>
              {' '}para{' '}
              <span className="font-semibold text-purple-600">{collection.recipientName}</span>
            </p>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Cada carta pode ser aberta apenas uma vez. Escolha o momento certo para abrir cada uma delas. 💌
            </p>
          </div>
        </div>
      </header>

      {/* Card Collection Viewer - Requirement: 5.1 */}
      <main className="max-w-7xl mx-auto py-8">
        <CardCollectionViewer
          cards={cards}
          onCardOpen={handleCardOpen}
          isLoading={isOpening}
        />
      </main>

      {/* Card Modal - Requirement: 5.5 */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          isFirstOpen={isFirstOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            Feito com ❤️ por Paper Bloom Digital
          </p>
        </div>
      </footer>
    </div>
  );
}
