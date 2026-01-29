'use client';

import React, { useState } from 'react';
import { CardPreviewCard } from '@/components/card-editor/CardPreviewCard';
import { Card } from '@/types/card';

/**
 * Test page for progress indicators
 * Tests Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */
export default function ProgressIndicatorsTestPage() {
  // Test cards with different completion states
  const [testCards] = useState<Card[]>([
    {
      id: '1',
      collectionId: 'test',
      order: 1,
      title: 'Carta Vazia',
      messageText: '',
      imageUrl: null,
      youtubeUrl: null,
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      collectionId: 'test',
      order: 2,
      title: 'Carta com Mensagem',
      messageText: 'Esta carta tem uma mensagem personalizada que demonstra o indicador de mensagem completa.',
      imageUrl: null,
      youtubeUrl: null,
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      collectionId: 'test',
      order: 3,
      title: 'Carta com Foto',
      messageText: 'Esta carta tem mensagem e foto.',
      imageUrl: 'https://example.com/photo.jpg',
      youtubeUrl: null,
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      collectionId: 'test',
      order: 4,
      title: 'Carta com Música',
      messageText: 'Esta carta tem mensagem e música.',
      imageUrl: null,
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      collectionId: 'test',
      order: 5,
      title: 'Carta Completa',
      messageText: 'Esta carta está completa com mensagem, foto e música. Deve mostrar todos os indicadores e o checkmark de conclusão.',
      imageUrl: 'https://example.com/photo.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      collectionId: 'test',
      order: 6,
      title: 'Carta com Mensagem Longa',
      messageText: 'Esta é uma mensagem muito longa que será truncada no preview. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      imageUrl: null,
      youtubeUrl: null,
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const handleEditMessage = (cardId: string) => {
    console.log('Edit message:', cardId);
  };

  const handleEditPhoto = (cardId: string) => {
    console.log('Edit photo:', cardId);
  };

  const handleEditMusic = (cardId: string) => {
    console.log('Edit music:', cardId);
  };

  // Calculate progress stats
  const totalCards = testCards.length;
  const completedCards = testCards.filter(card => {
    return (
      card.title.trim().length > 0 &&
      card.messageText.trim().length > 0 &&
      card.messageText.length <= 500
    );
  }).length;
  const overallProgress = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste de Indicadores de Progresso
          </h1>
          <p className="text-gray-600">
            Testando Requirements 9.1, 9.2, 9.3, 9.4, 9.5
          </p>
        </div>

        {/* Overall Progress Indicator - Requirement 9.1 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Requirement 9.1: Indicador de Progresso Geral
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {completedCards} de {totalCards}
              </div>
              <div className="text-sm text-gray-500">
                cartas completas
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {overallProgress}%
            </div>
          </div>
          <div className="w-full">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Moment Indicator - Requirement 9.5 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Requirement 9.5: Indicador de Momento
          </h2>
          <div className="text-center">
            <div className="text-lg font-medium text-gray-900">
              Momento 1 de 3
            </div>
            <div className="text-sm text-gray-500 mt-1">
              2 de 4 cartas completas
            </div>
          </div>
        </div>

        {/* Card Examples */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Requirements 9.2, 9.3, 9.4: Indicadores nas Cartas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testCards.map((card) => (
              <div key={card.id}>
                <CardPreviewCard
                  card={card}
                  onEditMessage={() => handleEditMessage(card.id)}
                  onEditPhoto={() => handleEditPhoto(card.id)}
                  onEditMusic={() => handleEditMusic(card.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Legenda dos Indicadores
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-700">
                <strong>Checkmark verde:</strong> Carta completa (título + mensagem válida)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded text-xs">
                Mensagem
              </div>
              <span className="text-sm text-gray-700">
                <strong>Badge verde:</strong> Carta tem mensagem personalizada (Req 9.2)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs">
                Foto
              </div>
              <span className="text-sm text-gray-700">
                <strong>Badge azul:</strong> Carta tem foto adicionada (Req 9.3)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded text-xs">
                Música
              </div>
              <span className="text-sm text-gray-700">
                <strong>Badge roxo:</strong> Carta tem música adicionada (Req 9.4)
              </span>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Casos de Teste
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ <strong>Carta 1:</strong> Vazia - sem badges, sem checkmark</li>
            <li>✓ <strong>Carta 2:</strong> Apenas mensagem - badge verde "Mensagem" + checkmark</li>
            <li>✓ <strong>Carta 3:</strong> Mensagem + foto - badges verde e azul + checkmark</li>
            <li>✓ <strong>Carta 4:</strong> Mensagem + música - badges verde e roxo + checkmark</li>
            <li>✓ <strong>Carta 5:</strong> Completa - todos os badges + checkmark</li>
            <li>✓ <strong>Carta 6:</strong> Mensagem longa - badge verde + checkmark + preview truncado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
