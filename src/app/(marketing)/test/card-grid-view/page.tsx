'use client';

import React, { useState } from 'react';
import { CardGridView } from '@/components/card-editor/CardGridView';
import { Card } from '@/types/card';
import { Button } from '@/components/ui/Button';

/**
 * Test page for CardGridView component
 * Tests Requirements: 2.1, 2.6
 */
export default function CardGridViewTestPage() {
  const [selectedAction, setSelectedAction] = useState<string>('');

  // Mock cards for testing (first 4 cards of moment 1)
  const mockCards: Card[] = [
    {
      id: '1',
      collectionId: 'test-collection',
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
      collectionId: 'test-collection',
      order: 2,
      title: 'Abra quando... estiver se sentindo inseguro(a)',
      messageText: 'Você é incrível exatamente do jeito que é. Sua gentileza, sua inteligência, seu sorriso - tudo em você é especial.',
      imageUrl: 'https://example.com/photo.jpg',
      youtubeUrl: null,
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      collectionId: 'test-collection',
      order: 3,
      title: 'Abra quando... estivermos longe um do outro',
      messageText: 'A distância física não muda nada entre nós. Você está sempre no meu coração, não importa onde esteja.',
      imageUrl: null,
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      collectionId: 'test-collection',
      order: 4,
      title: 'Abra quando... estiver estressado(a) com o trabalho',
      messageText: 'Respire. Você está fazendo o seu melhor, e isso é mais do que suficiente. Lembre-se de fazer pausas, beber água, e não se cobrar tanto.',
      imageUrl: 'https://example.com/photo2.jpg',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleEditMessage = (cardId: string) => {
    const card = mockCards.find(c => c.id === cardId);
    setSelectedAction(`Edit Message: ${card?.title}`);
  };

  const handleEditPhoto = (cardId: string) => {
    const card = mockCards.find(c => c.id === cardId);
    setSelectedAction(`Edit Photo: ${card?.title}`);
  };

  const handleEditMusic = (cardId: string) => {
    const card = mockCards.find(c => c.id === cardId);
    setSelectedAction(`Edit Music: ${card?.title}`);
  };

  const handleReset = () => {
    setSelectedAction('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            CardGridView Test Page
          </h1>
          <p className="text-gray-600">
            Testing Requirements: 2.1 (Simultaneous Display), 2.6 (Visual Organization)
          </p>
        </div>

        {/* Action Feedback */}
        {selectedAction && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Action Triggered:</p>
              <p className="text-blue-700">{selectedAction}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Test Section 1: Normal Grid */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test 1: Normal Grid Display
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Should display 4 cards in a responsive grid (1 col mobile, 2 cols tablet/desktop)
            </p>
            <CardGridView
              cards={mockCards}
              onEditMessage={handleEditMessage}
              onEditPhoto={handleEditPhoto}
              onEditMusic={handleEditMusic}
            />
          </div>
        </div>

        {/* Test Section 2: With Custom ClassName */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test 2: Custom Styling
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Grid with custom background color
            </p>
            <CardGridView
              cards={mockCards}
              onEditMessage={handleEditMessage}
              onEditPhoto={handleEditPhoto}
              onEditMusic={handleEditMusic}
              className="bg-purple-50 p-4 rounded-lg"
            />
          </div>
        </div>

        {/* Test Section 3: Responsive Behavior */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test 3: Responsive Behavior
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Mobile View (max-width: 639px)
                </p>
                <div className="max-w-sm border-2 border-dashed border-gray-300 p-4">
                  <CardGridView
                    cards={mockCards}
                    onEditMessage={handleEditMessage}
                    onEditPhoto={handleEditPhoto}
                    onEditMusic={handleEditMusic}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Section 4: Animation Test */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test 4: Animation Test
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Reload the page to see fade-in and slide-in animations
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Reload Page to See Animations
            </Button>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            Test Instructions
          </h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>✓ Verify 4 cards are displayed in each grid</li>
            <li>✓ Check responsive layout: 1 column on mobile, 2 columns on tablet/desktop</li>
            <li>✓ Click action buttons to verify callbacks work</li>
            <li>✓ Verify cards show correct titles and message previews</li>
            <li>✓ Check media indicators (photo/music badges) display correctly</li>
            <li>✓ Verify button labels change based on media presence</li>
            <li>✓ Test keyboard navigation (Tab through cards and buttons)</li>
            <li>✓ Reload page to see fade-in and slide-in animations</li>
            <li>✓ Resize browser window to test responsive breakpoints</li>
          </ul>
        </div>

        {/* Requirements Validation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            Requirements Validation
          </h3>
          <div className="space-y-2 text-sm text-green-800">
            <div className="flex items-start gap-2">
              <span className="font-semibold">Req 2.1:</span>
              <span>All 4 cards of the moment are displayed simultaneously ✓</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">Req 2.6:</span>
              <span>Cards are visually organized in a responsive grid layout ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
