'use client';

import React, { useState, useEffect } from 'react';
import { GroupedCardCollectionEditor } from '@/components/card-editor/GroupedCardCollectionEditor';
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';
import { MomentNavigation } from '@/components/card-editor/MomentNavigation';
import { CardGridView } from '@/components/card-editor/CardGridView';
import { CardPreviewCard } from '@/components/card-editor/CardPreviewCard';
import { EditMessageModal } from '@/components/card-editor/modals/EditMessageModal';
import { PhotoUploadModal } from '@/components/card-editor/modals/PhotoUploadModal';
import { MusicSelectionModal } from '@/components/card-editor/modals/MusicSelectionModal';
import { Card, CardCollection } from '@/types/card';

type TestMode = 'full' | 'moment-nav' | 'card-grid' | 'card-preview' | 'edit-modal' | 'photo-modal' | 'music-modal';

/**
 * Comprehensive Test Page for Grouped Card Collection Editor
 * 
 * This page allows testing all components individually and together:
 * - Full GroupedCardCollectionEditor
 * - MomentNavigation component
 * - CardGridView component
 * - CardPreviewCard component
 * - EditMessageModal component
 * - PhotoUploadModal component
 * - MusicSelectionModal component
 * 
 * Features:
 * - Switch between test modes
 * - Test responsiveness at different screen sizes
 * - Test keyboard accessibility
 * - Test modal open/close behavior
 * - Visual indicators for testing
 */
export default function GroupedEditorTestPage() {
  const [testMode, setTestMode] = useState<TestMode>('full');
  const [collection, setCollection] = useState<CardCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Individual component test states
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Create mock collection and cards
  useEffect(() => {
    const mockCollection: CardCollection = {
      id: 'test-collection-1',
      recipientName: 'João',
      senderName: 'Maria',
      slug: null,
      qrCodeUrl: null,
      status: 'pending',
      stripeSessionId: null,
      contactEmail: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCollection(mockCollection);
    setIsLoading(false);
  }, []);

  const handleFinalize = async () => {
    console.log('✅ Finalize clicked!');
    alert('✅ Teste: Finalizando e indo para checkout...');
  };

  // Mock cards for individual component testing
  const mockCards: Card[] = Array.from({ length: 12 }, (_, i) => ({
    id: `test-card-${i + 1}`,
    collectionId: 'test-collection-1',
    order: i + 1,
    title: `Abra quando... ${['você estiver triste', 'precisar de motivação', 'quiser rir', 'sentir saudade'][i % 4]}`,
    messageText: i < 6 ? `Esta é a mensagem da carta ${i + 1}. Aqui você pode escrever algo especial e personalizado para a pessoa que você ama. Pode ser uma lembrança, uma palavra de apoio, ou simplesmente algo que faça ela sorrir.` : '',
    imageUrl: i % 3 === 0 ? 'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Foto+' + (i + 1) : null,
    youtubeUrl: i % 4 === 1 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null,
    status: 'unopened',
    openedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const THEMATIC_MOMENTS = [
    {
      index: 0,
      title: 'Momentos Emocionais e de Apoio',
      description: 'Cartas para momentos difíceis e de vulnerabilidade',
      cardIndices: [0, 1, 2, 3],
    },
    {
      index: 1,
      title: 'Momentos de Celebração e Romance',
      description: 'Cartas para celebrar amor e conquistas',
      cardIndices: [4, 5, 6, 7],
    },
    {
      index: 2,
      title: 'Momentos para Resolver Conflitos e Rir',
      description: 'Cartas para superar desafios e relaxar',
      cardIndices: [8, 9, 10, 11],
    },
  ];

  const getCurrentMomentCards = () => {
    const moment = THEMATIC_MOMENTS[currentMomentIndex];
    return moment.cardIndices.map(i => mockCards[i]);
  };

  const getMomentCompletionStatus = (momentIndex: number) => {
    const moment = THEMATIC_MOMENTS[momentIndex];
    const momentCards = moment.cardIndices.map(i => mockCards[i]);
    const completedCards = momentCards.filter(card => card.messageText.length > 0).length;
    return {
      totalCards: 4,
      completedCards,
      percentage: (completedCards / 4) * 100,
    };
  };

  const completionStatus = THEMATIC_MOMENTS.reduce((acc, moment) => {
    acc[moment.index] = getMomentCompletionStatus(moment.index);
    return acc;
  }, {} as Record<number, { totalCards: number; completedCards: number; percentage: number }>);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando editor de teste...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar coleção de teste</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Control Panel */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">🧪 Grouped Editor Test Suite</h1>
              <p className="text-sm text-purple-100 mt-1">
                Teste todos os componentes individualmente ou em conjunto
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTestMode('full')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  testMode === 'full'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-purple-500 hover:bg-purple-400'
                }`}
                aria-label="Testar editor completo"
              >
                Editor Completo
              </button>
              <button
                onClick={() => setTestMode('moment-nav')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  testMode === 'moment-nav'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-purple-500 hover:bg-purple-400'
                }`}
                aria-label="Testar navegação de momentos"
              >
                Navegação
              </button>
              <button
                onClick={() => setTestMode('card-grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  testMode === 'card-grid'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-purple-500 hover:bg-purple-400'
                }`}
                aria-label="Testar grid de cartas"
              >
                Grid
              </button>
              <button
                onClick={() => setTestMode('card-preview')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  testMode === 'card-preview'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-purple-500 hover:bg-purple-400'
                }`}
                aria-label="Testar preview de carta"
              >
                Preview
              </button>
              <button
                onClick={() => setTestMode('edit-modal')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  testMode === 'edit-modal'
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-purple-500 hover:bg-purple-400'
                }`}
                aria-label="Testar modal de edição"
              >
                Modais
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium mb-1">
                Instruções de Teste:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                {testMode === 'full' && (
                  <>
                    <li>✓ Navegue entre os 3 momentos temáticos</li>
                    <li>✓ Edite mensagens, adicione fotos e músicas</li>
                    <li>✓ Teste responsividade redimensionando a janela</li>
                    <li>✓ Use Tab para navegar via teclado</li>
                    <li>✓ Pressione Escape para fechar modais</li>
                  </>
                )}
                {testMode === 'moment-nav' && (
                  <>
                    <li>✓ Clique nos 3 botões de navegação</li>
                    <li>✓ Verifique o indicador de momento ativo</li>
                    <li>✓ Observe o progresso de cada momento</li>
                    <li>✓ Teste navegação via teclado (Tab + Enter)</li>
                  </>
                )}
                {testMode === 'card-grid' && (
                  <>
                    <li>✓ Visualize as 4 cartas do momento atual</li>
                    <li>✓ Clique nos botões de ação de cada carta</li>
                    <li>✓ Teste responsividade (1 col mobile, 2 cols desktop)</li>
                    <li>✓ Navegue entre momentos para ver diferentes cartas</li>
                  </>
                )}
                {testMode === 'card-preview' && (
                  <>
                    <li>✓ Observe título, mensagem e indicadores de mídia</li>
                    <li>✓ Verifique labels dinâmicos dos botões</li>
                    <li>✓ Teste todos os 3 botões de ação</li>
                    <li>✓ Redimensione para testar responsividade</li>
                  </>
                )}
                {testMode === 'edit-modal' && (
                  <>
                    <li>✓ Abra cada tipo de modal (Mensagem, Foto, Música)</li>
                    <li>✓ Teste salvamento e cancelamento</li>
                    <li>✓ Pressione Escape para fechar</li>
                    <li>✓ Clique fora do modal para testar confirmação</li>
                    <li>✓ Teste em mobile (modais fullscreen)</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Test Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {testMode === 'full' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <CardCollectionEditorProvider
              collectionId={collection.id}
              autoSaveEnabled={true}
            >
              <GroupedCardCollectionEditor
                onFinalize={handleFinalize}
                isProcessing={false}
              />
            </CardCollectionEditorProvider>
          </div>
        )}

        {testMode === 'moment-nav' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Teste: MomentNavigation</h2>
              <p className="text-gray-600 mb-6">
                Componente de navegação entre os 3 momentos temáticos
              </p>
              <MomentNavigation
                moments={THEMATIC_MOMENTS}
                currentMomentIndex={currentMomentIndex}
                onMomentChange={setCurrentMomentIndex}
                completionStatus={completionStatus}
              />
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Momento Atual:</strong> {currentMomentIndex + 1} - {THEMATIC_MOMENTS[currentMomentIndex].title}
                </p>
              </div>
            </div>
          </div>
        )}

        {testMode === 'card-grid' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Teste: CardGridView</h2>
              <p className="text-gray-600 mb-4">
                Grid de 4 cartas do momento atual
              </p>
              
              {/* Moment selector for testing */}
              <div className="mb-6">
                <MomentNavigation
                  moments={THEMATIC_MOMENTS}
                  currentMomentIndex={currentMomentIndex}
                  onMomentChange={setCurrentMomentIndex}
                  completionStatus={completionStatus}
                />
              </div>

              <CardGridView
                cards={getCurrentMomentCards()}
                onEditMessage={(cardId) => {
                  console.log('Edit message:', cardId);
                  alert(`Editar mensagem da carta: ${cardId}`);
                }}
                onEditPhoto={(cardId) => {
                  console.log('Edit photo:', cardId);
                  alert(`Editar foto da carta: ${cardId}`);
                }}
                onEditMusic={(cardId) => {
                  console.log('Edit music:', cardId);
                  alert(`Editar música da carta: ${cardId}`);
                }}
              />
            </div>
          </div>
        )}

        {testMode === 'card-preview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Teste: CardPreviewCard</h2>
              <p className="text-gray-600 mb-6">
                Componente individual de preview de carta
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card with message only */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Carta com mensagem apenas</h3>
                  <CardPreviewCard
                    card={mockCards[2]}
                    onEditMessage={() => alert('Editar mensagem')}
                    onEditPhoto={() => alert('Adicionar foto')}
                    onEditMusic={() => alert('Adicionar música')}
                  />
                </div>

                {/* Card with photo */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Carta com foto</h3>
                  <CardPreviewCard
                    card={mockCards[0]}
                    onEditMessage={() => alert('Editar mensagem')}
                    onEditPhoto={() => alert('Editar foto')}
                    onEditMusic={() => alert('Adicionar música')}
                  />
                </div>

                {/* Card with music */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Carta com música</h3>
                  <CardPreviewCard
                    card={mockCards[1]}
                    onEditMessage={() => alert('Editar mensagem')}
                    onEditPhoto={() => alert('Adicionar foto')}
                    onEditMusic={() => alert('Editar música')}
                  />
                </div>

                {/* Empty card */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Carta vazia</h3>
                  <CardPreviewCard
                    card={mockCards[11]}
                    onEditMessage={() => alert('Editar mensagem')}
                    onEditPhoto={() => alert('Adicionar foto')}
                    onEditMusic={() => alert('Adicionar música')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {testMode === 'edit-modal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Teste: Modais de Edição</h2>
              <p className="text-gray-600 mb-6">
                Teste todos os modais de edição
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setSelectedCard(mockCards[0]);
                    setShowEditModal(true);
                  }}
                  className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  aria-label="Abrir modal de edição de mensagem"
                >
                  📝 Abrir Modal de Mensagem
                </button>
                
                <button
                  onClick={() => {
                    setSelectedCard(mockCards[0]);
                    setShowPhotoModal(true);
                  }}
                  className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  aria-label="Abrir modal de foto"
                >
                  📷 Abrir Modal de Foto
                </button>
                
                <button
                  onClick={() => {
                    setSelectedCard(mockCards[0]);
                    setShowMusicModal(true);
                  }}
                  className="px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  aria-label="Abrir modal de música"
                >
                  🎵 Abrir Modal de Música
                </button>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Dica:</strong> Teste pressionar Escape para fechar os modais, 
                  clique fora do modal, e teste a navegação via teclado (Tab).
                </p>
              </div>
            </div>

            {/* Modals */}
            {selectedCard && (
              <>
                <EditMessageModal
                  card={selectedCard}
                  isOpen={showEditModal}
                  onClose={() => setShowEditModal(false)}
                  onSave={async (cardId, data) => {
                    console.log('Save message:', cardId, data);
                    alert(`✅ Mensagem salva!\nTítulo: ${data.title}\nMensagem: ${data.messageText.substring(0, 50)}...`);
                    setShowEditModal(false);
                  }}
                />

                <PhotoUploadModal
                  card={selectedCard}
                  isOpen={showPhotoModal}
                  onClose={() => setShowPhotoModal(false)}
                  onSave={async (cardId, imageUrl) => {
                    console.log('Save photo:', cardId, imageUrl);
                    alert(`✅ Foto salva!\nURL: ${imageUrl}`);
                    setShowPhotoModal(false);
                  }}
                  onRemove={async (cardId) => {
                    console.log('Remove photo:', cardId);
                    alert(`✅ Foto removida da carta: ${cardId}`);
                    setShowPhotoModal(false);
                  }}
                />

                <MusicSelectionModal
                  card={selectedCard}
                  isOpen={showMusicModal}
                  onClose={() => setShowMusicModal(false)}
                  onSave={async (cardId, youtubeUrl) => {
                    console.log('Save music:', cardId, youtubeUrl);
                    alert(`✅ Música salva!\nURL: ${youtubeUrl}`);
                    setShowMusicModal(false);
                  }}
                  onRemove={async (cardId) => {
                    console.log('Remove music:', cardId);
                    alert(`✅ Música removida da carta: ${cardId}`);
                    setShowMusicModal(false);
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Accessibility Testing Guide */}
      <div className="bg-gray-800 text-white px-4 py-6 mt-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg font-bold mb-3">⌨️ Guia de Teste de Acessibilidade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Navegação por Teclado:</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• <kbd className="px-2 py-1 bg-gray-700 rounded">Tab</kbd> - Navegar entre elementos</li>
                <li>• <kbd className="px-2 py-1 bg-gray-700 rounded">Shift + Tab</kbd> - Navegar para trás</li>
                <li>• <kbd className="px-2 py-1 bg-gray-700 rounded">Enter</kbd> ou <kbd className="px-2 py-1 bg-gray-700 rounded">Space</kbd> - Ativar botão</li>
                <li>• <kbd className="px-2 py-1 bg-gray-700 rounded">Escape</kbd> - Fechar modal</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Teste de Responsividade:</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Mobile: &lt; 768px (1 coluna)</li>
                <li>• Tablet: 768px - 1024px (2 colunas)</li>
                <li>• Desktop: &gt; 1024px (2 colunas)</li>
                <li>• Modais: Fullscreen em mobile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
