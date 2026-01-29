'use client';

import { useState } from 'react';
import { Card as CardType } from '@/types/card';
import { CardModal } from '@/components/card-viewer/CardModal';
import { Button } from '@/components/ui/Button';

/**
 * Test page for CardModal component
 * Tests all features: photo, music, animations, first open vs subsequent opens
 */
export default function CardModalTestPage() {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isFirstOpen, setIsFirstOpen] = useState(true);

  // Test cards with different content combinations
  const testCards: CardType[] = [
    {
      id: '1',
      collectionId: 'test-collection',
      order: 1,
      title: 'Abra quando... estiver tendo um dia difícil',
      messageText: 'Sei que hoje não está sendo fácil, mas quero que saiba que você é mais forte do que imagina. Cada desafio que você enfrenta te torna mais resiliente. Lembre-se: eu acredito em você, sempre. Respire fundo, você vai superar isso. ❤️',
      imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
      youtubeUrl: 'https://www.youtube.com/watch?v=nSDgHBxUbVQ',
      status: 'opened',
      openedAt: new Date('2024-01-15T10:30:00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      collectionId: 'test-collection',
      order: 2,
      title: 'Abra quando... quiser saber o quanto eu te amo',
      messageText: 'Te amo mais do que as palavras podem expressar. Você ilumina meus dias, me faz querer ser uma pessoa melhor, e torna minha vida infinitamente mais feliz. Cada momento ao seu lado é um presente. Te amo hoje, amanhã e sempre. 💕',
      imageUrl: null,
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      status: 'opened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      collectionId: 'test-collection',
      order: 3,
      title: 'Abra quando... você precisar dar uma risada',
      messageText: 'Lembra daquela vez que a gente se perdeu no shopping e acabamos no estacionamento errado? Eu rio até hoje quando penso nisso! Você tem o dom de transformar momentos simples em memórias inesquecíveis. Obrigado por todas as risadas! 😂',
      imageUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167',
      youtubeUrl: null,
      status: 'opened',
      openedAt: new Date('2024-01-10T14:20:00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      collectionId: 'test-collection',
      order: 4,
      title: 'Abra quando... você não conseguir dormir',
      messageText: 'Feche os olhos e respire devagar. Pense em um lugar tranquilo, onde você se sente seguro(a) e em paz. Lembre-se de que amanhã é um novo dia, cheio de possibilidades. Você está seguro(a), você está amado(a). Boa noite. 🌙',
      imageUrl: null,
      youtubeUrl: null,
      status: 'opened',
      openedAt: new Date('2024-01-20T22:45:00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleOpenCard = (card: CardType, firstOpen: boolean) => {
    setSelectedCard(card);
    setIsFirstOpen(firstOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            CardModal Component Test
          </h1>
          <p className="text-lg text-gray-600">
            Test different card content combinations and opening states
          </p>
        </div>

        {/* Test Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Full content (photo + music) - First Open */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                Card 1: Full Content
              </h3>
              <p className="text-sm text-gray-600">
                Photo + Music + First Open Animation
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✅ Photo: Yes</p>
              <p>✅ Music: Yes</p>
              <p>✅ First Open: Yes</p>
              <p>✨ Falling Emojis: Yes</p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenCard(testCards[0], true)}
              className="w-full"
            >
              Open Card (First Time)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenCard(testCards[0], false)}
              className="w-full"
            >
              Open Card (Already Opened)
            </Button>
          </div>

          {/* Card 2: Music only - First Open */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                Card 2: Music Only
              </h3>
              <p className="text-sm text-gray-600">
                No Photo + Music + First Open
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>❌ Photo: No</p>
              <p>✅ Music: Yes</p>
              <p>✅ First Open: Yes</p>
              <p>✨ Falling Emojis: Yes</p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenCard(testCards[1], true)}
              className="w-full"
            >
              Open Card (First Time)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenCard(testCards[1], false)}
              className="w-full"
            >
              Open Card (Already Opened)
            </Button>
          </div>

          {/* Card 3: Photo only - Already Opened */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                Card 3: Photo Only
              </h3>
              <p className="text-sm text-gray-600">
                Photo + No Music + Already Opened
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✅ Photo: Yes</p>
              <p>❌ Music: No</p>
              <p>❌ First Open: No</p>
              <p>❌ Falling Emojis: No</p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenCard(testCards[2], false)}
              className="w-full"
            >
              Open Card (Already Opened)
            </Button>
          </div>

          {/* Card 4: Text only - Already Opened */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                Card 4: Text Only
              </h3>
              <p className="text-sm text-gray-600">
                No Photo + No Music + Already Opened
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>❌ Photo: No</p>
              <p>❌ Music: No</p>
              <p>❌ First Open: No</p>
              <p>❌ Falling Emojis: No</p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenCard(testCards[3], false)}
              className="w-full"
            >
              Open Card (Already Opened)
            </Button>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Testing Instructions
          </h2>
          <div className="space-y-3 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">First Open Animation:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Modal should zoom in with 700ms animation</li>
                <li>Falling emojis should appear for 8 seconds</li>
                <li>Content should fade in after 800ms delay</li>
                <li>Music should start playing automatically</li>
                <li>Special "first time" message should appear</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Already Opened:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Modal should appear instantly (300ms fade)</li>
                <li>No falling emojis</li>
                <li>Content visible immediately</li>
                <li>Music should NOT autoplay</li>
                <li>Should show opening date/time</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Keyboard Navigation:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Press ESC to close modal</li>
                <li>Tab through interactive elements</li>
                <li>Close button should be focusable</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Responsive Design:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Test on mobile viewport (375px)</li>
                <li>Test on tablet viewport (768px)</li>
                <li>Test on desktop viewport (1920px)</li>
                <li>Modal should be scrollable on small screens</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Requirements Validation */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 space-y-3">
          <h2 className="text-2xl font-bold text-green-900">
            Requirements Validation
          </h2>
          <div className="space-y-2 text-green-800">
            <p>✅ <strong>Requirement 5.5:</strong> Display full card content (title, message)</p>
            <p>✅ <strong>Requirement 5.6:</strong> Display photo if available</p>
            <p>✅ <strong>Requirement 5.7:</strong> Automatic music playback and special animation</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          isFirstOpen={isFirstOpen}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
