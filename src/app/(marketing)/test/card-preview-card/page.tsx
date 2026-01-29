'use client';

import React, { useState } from 'react';
import { CardPreviewCard } from '@/components/card-editor/CardPreviewCard';
import { Card } from '@/types/card';

/**
 * Test page for CardPreviewCard component
 * Demonstrates different states and configurations
 */
export default function CardPreviewCardTestPage() {
  const [modalState, setModalState] = useState<string | null>(null);

  // Sample cards with different states
  const cards: Card[] = [
    {
      id: '1',
      collectionId: 'test',
      order: 1,
      title: 'Abra quando... estiver tendo um dia difícil',
      messageText: 'Sei que hoje não está sendo fácil, mas quero que saiba que você é mais forte do que imagina. Cada desafio que você enfrenta te torna mais resiliente.',
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
      title: 'Abra quando... quiser saber o quanto eu te amo',
      messageText: 'Te amo mais do que as palavras podem expressar. Você ilumina meus dias, me faz querer ser uma pessoa melhor, e torna minha vida infinitamente mais feliz.',
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
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
      title: 'Abra quando... for uma noite de chuva e tédio',
      messageText: 'Que tal preparar um chocolate quente, colocar aquele filme que a gente ama, e se aconchegar no sofá? Ou podemos fazer aquela receita nova que você queria tentar.',
      imageUrl: null,
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      collectionId: 'test',
      order: 4,
      title: 'Abra quando... você precisar dar uma risada',
      messageText: 'Lembra daquela vez que a gente se perdeu no shopping e acabou encontrando aquela loja incrível? Eu rio até hoje quando penso nisso! Você tem o dom de transformar momentos simples em memórias inesquecíveis.',
      imageUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400',
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
      title: '',
      messageText: '',
      imageUrl: null,
      youtubeUrl: null,
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      collectionId: 'test',
      order: 6,
      title: 'Carta com mensagem muito longa para testar truncamento',
      messageText: 'Esta é uma mensagem extremamente longa que vai ultrapassar os 100 caracteres permitidos para o preview. O objetivo é testar se o componente está truncando corretamente a mensagem e adicionando os três pontos no final para indicar que há mais conteúdo. Vamos ver se funciona!',
      imageUrl: null,
      youtubeUrl: null,
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleAction = (cardId: string, action: string) => {
    setModalState(`${action} - Card ${cardId}`);
    setTimeout(() => setModalState(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CardPreviewCard Component Test
          </h1>
          <p className="text-gray-600">
            Testing different states and configurations of the CardPreviewCard component
          </p>
        </div>

        {/* Modal State Indicator */}
        {modalState && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            Action triggered: {modalState}
          </div>
        )}

        {/* Test Cases */}
        <div className="space-y-12">
          {/* Complete Card */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. Complete Card (No Media)
            </h2>
            <div className="max-w-md">
              <CardPreviewCard
                card={cards[0]}
                onEditMessage={() => handleAction(cards[0].id, 'Edit Message')}
                onEditPhoto={() => handleAction(cards[0].id, 'Add Photo')}
                onEditMusic={() => handleAction(cards[0].id, 'Add Music')}
              />
            </div>
          </section>

          {/* Card with Photo */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. Card with Photo
            </h2>
            <div className="max-w-md">
              <CardPreviewCard
                card={cards[1]}
                onEditMessage={() => handleAction(cards[1].id, 'Edit Message')}
                onEditPhoto={() => handleAction(cards[1].id, 'Edit Photo')}
                onEditMusic={() => handleAction(cards[1].id, 'Add Music')}
              />
            </div>
          </section>

          {/* Card with Music */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. Card with Music
            </h2>
            <div className="max-w-md">
              <CardPreviewCard
                card={cards[2]}
                onEditMessage={() => handleAction(cards[2].id, 'Edit Message')}
                onEditPhoto={() => handleAction(cards[2].id, 'Add Photo')}
                onEditMusic={() => handleAction(cards[2].id, 'Edit Music')}
              />
            </div>
          </section>

          {/* Card with Both Media */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              4. Card with Photo and Music
            </h2>
            <div className="max-w-md">
              <CardPreviewCard
                card={cards[3]}
                onEditMessage={() => handleAction(cards[3].id, 'Edit Message')}
                onEditPhoto={() => handleAction(cards[3].id, 'Edit Photo')}
                onEditMusic={() => handleAction(cards[3].id, 'Edit Music')}
              />
            </div>
          </section>

          {/* Empty Card */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              5. Empty Card (Incomplete)
            </h2>
            <div className="max-w-md">
              <CardPreviewCard
                card={cards[4]}
                onEditMessage={() => handleAction(cards[4].id, 'Edit Message')}
                onEditPhoto={() => handleAction(cards[4].id, 'Add Photo')}
                onEditMusic={() => handleAction(cards[4].id, 'Add Music')}
              />
            </div>
          </section>

          {/* Long Message Card */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              6. Card with Long Message (Truncation Test)
            </h2>
            <div className="max-w-md">
              <CardPreviewCard
                card={cards[5]}
                onEditMessage={() => handleAction(cards[5].id, 'Edit Message')}
                onEditPhoto={() => handleAction(cards[5].id, 'Add Photo')}
                onEditMusic={() => handleAction(cards[5].id, 'Add Music')}
              />
            </div>
          </section>

          {/* Grid Layout Test */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              7. Grid Layout (Responsive Test)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.slice(0, 4).map((card) => (
                <CardPreviewCard
                  key={card.id}
                  card={card}
                  onEditMessage={() => handleAction(card.id, 'Edit Message')}
                  onEditPhoto={() => handleAction(card.id, 'Add/Edit Photo')}
                  onEditMusic={() => handleAction(card.id, 'Add/Edit Music')}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Test Instructions
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click any button to see the action feedback</li>
            <li>• Resize the window to test responsive behavior</li>
            <li>• Check that badges appear for cards with media</li>
            <li>• Verify button labels change (Add vs Edit)</li>
            <li>• Confirm completion indicator appears on complete cards</li>
            <li>• Test keyboard navigation (Tab, Enter)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
