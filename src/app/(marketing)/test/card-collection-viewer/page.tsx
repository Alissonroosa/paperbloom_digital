'use client';

import { useState } from 'react';
import { CardCollectionViewer } from '@/components/card-viewer';
import { Card } from '@/types/card';
import { CARD_TEMPLATES } from '@/types/card';
import { Button } from '@/components/ui/Button';

/**
 * Test page for CardCollectionViewer component
 * 
 * This page demonstrates:
 * - Grid display of 12 cards
 * - Visual status indicators
 * - Click handling for unopened cards
 * - Confirmation modal
 * - Card opening simulation
 */
export default function TestCardCollectionViewerPage() {
  // Create mock cards based on templates
  const [cards, setCards] = useState<Card[]>(
    CARD_TEMPLATES.map((template, index) => ({
      id: `card-${index + 1}`,
      collectionId: 'test-collection-id',
      order: template.order,
      title: template.title,
      messageText: template.defaultMessage,
      imageUrl: null,
      youtubeUrl: null,
      status: 'unopened' as const,
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [lastOpenedCard, setLastOpenedCard] = useState<Card | null>(null);

  /**
   * Simulate opening a card
   */
  const handleCardOpen = async (cardId: string) => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update card status
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId
          ? {
              ...card,
              status: 'opened' as const,
              openedAt: new Date(),
            }
          : card
      )
    );

    // Store last opened card for display
    const openedCard = cards.find(c => c.id === cardId);
    if (openedCard) {
      setLastOpenedCard({
        ...openedCard,
        status: 'opened',
        openedAt: new Date(),
      });
    }

    setIsLoading(false);
  };

  /**
   * Reset all cards to unopened
   */
  const handleReset = () => {
    setCards(prevCards =>
      prevCards.map(card => ({
        ...card,
        status: 'unopened' as const,
        openedAt: null,
      }))
    );
    setLastOpenedCard(null);
  };

  /**
   * Open random cards for testing
   */
  const handleOpenRandom = () => {
    const unopenedCards = cards.filter(c => c.status === 'unopened');
    if (unopenedCards.length === 0) return;

    const randomCard = unopenedCards[Math.floor(Math.random() * unopenedCards.length)];
    handleCardOpen(randomCard.id);
  };

  const openedCount = cards.filter(c => c.status === 'opened').length;
  const unopenedCount = cards.filter(c => c.status === 'unopened').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CardCollectionViewer Test
          </h1>
          <p className="text-gray-600">
            Test page for the card collection viewer component
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Cards */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {cards.length}
              </div>
              <div className="text-sm text-gray-600">Total de Cartas</div>
            </div>

            {/* Unopened Cards */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {unopenedCount}
              </div>
              <div className="text-sm text-gray-600">Cartas Fechadas</div>
            </div>

            {/* Opened Cards */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-600 mb-2">
                {openedCount}
              </div>
              <div className="text-sm text-gray-600">Cartas Abertas</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round((openedCount / cards.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(openedCount / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              onClick={handleOpenRandom}
              disabled={unopenedCount === 0 || isLoading}
            >
              Abrir Carta Aleatória
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={openedCount === 0}
            >
              Resetar Todas
            </Button>
          </div>
        </div>

        {/* Last Opened Card Info */}
        {lastOpenedCard && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-green-900 mb-2">
              ✅ Última Carta Aberta
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Carta {lastOpenedCard.order}:</strong> {lastOpenedCard.title}
              </p>
              <p className="text-green-800">
                Aberta em: {lastOpenedCard.openedAt?.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            📋 Instruções de Teste
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Clique em uma carta fechada</strong> para abrir o modal de confirmação</li>
            <li>• <strong>Confirme a abertura</strong> para marcar a carta como aberta</li>
            <li>• <strong>Cartas abertas</strong> ficam em cinza e não podem ser clicadas novamente</li>
            <li>• <strong>Use "Abrir Carta Aleatória"</strong> para testar rapidamente</li>
            <li>• <strong>Use "Resetar Todas"</strong> para voltar ao estado inicial</li>
            <li>• <strong>Teste a navegação por teclado</strong> usando Tab e Enter</li>
          </ul>
        </div>

        {/* Component Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-purple-900 mb-3">
            🎨 Recursos do Componente
          </h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li>✅ Grid responsivo (2-6 colunas)</li>
            <li>✅ Indicadores visuais de status</li>
            <li>✅ Modal de confirmação</li>
            <li>✅ Animações suaves</li>
            <li>✅ Acessibilidade completa</li>
            <li>✅ Navegação por teclado</li>
            <li>✅ ARIA labels</li>
          </ul>
        </div>
      </div>

      {/* Card Viewer */}
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              12 Cartas - Jornada Emocional
            </h2>
            <p className="text-blue-100">
              De: Remetente Teste • Para: Destinatário Teste
            </p>
          </div>

          <CardCollectionViewer
            cards={cards}
            onCardOpen={handleCardOpen}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
