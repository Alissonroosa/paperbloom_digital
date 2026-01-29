'use client';

import React, { useState } from 'react';
import { MusicSelectionModal } from '@/components/card-editor/modals/MusicSelectionModal';
import { Card } from '@/types/card';
import { Button } from '@/components/ui/Button';
import { Music, CheckCircle } from 'lucide-react';

/**
 * Test page for MusicSelectionModal component
 * 
 * This page allows testing the modal in isolation with different scenarios:
 * - Card without music
 * - Card with existing music
 * - Save functionality
 * - Remove functionality
 * - Cancel functionality
 */
export default function MusicSelectionModalTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testCard, setTestCard] = useState<Card>({
    id: 'test-card-1',
    collectionId: 'test-collection-1',
    order: 5,
    title: 'Abra quando... quiser saber o quanto eu te amo',
    messageText: 'Te amo mais do que as palavras podem expressar. Você ilumina meus dias...',
    imageUrl: null,
    youtubeUrl: null,
    status: 'unopened',
    openedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>('');

  // Simulate save
  const handleSave = async (cardId: string, youtubeUrl: string) => {
    console.log('Save called:', { cardId, youtubeUrl });
    setLastAction(`Saved: ${youtubeUrl}`);
    setSavedUrl(youtubeUrl);
    
    // Update test card
    setTestCard(prev => ({
      ...prev,
      youtubeUrl,
      updatedAt: new Date(),
    }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // Simulate remove
  const handleRemove = async (cardId: string) => {
    console.log('Remove called:', { cardId });
    setLastAction('Removed music');
    setSavedUrl(null);
    
    // Update test card
    setTestCard(prev => ({
      ...prev,
      youtubeUrl: null,
      updatedAt: new Date(),
    }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // Reset to card without music
  const resetToNoMusic = () => {
    setTestCard(prev => ({
      ...prev,
      youtubeUrl: null,
      updatedAt: new Date(),
    }));
    setSavedUrl(null);
    setLastAction('Reset to no music');
  };

  // Set example music
  const setExampleMusic = () => {
    const exampleUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    setTestCard(prev => ({
      ...prev,
      youtubeUrl: exampleUrl,
      updatedAt: new Date(),
    }));
    setSavedUrl(exampleUrl);
    setLastAction('Set example music');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MusicSelectionModal Test Page
          </h1>
          <p className="text-gray-600">
            Test the music selection modal with different scenarios
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Controls
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Music className="w-4 h-4" />
              Open Modal
            </Button>
            <Button
              variant="outline"
              onClick={resetToNoMusic}
            >
              Reset to No Music
            </Button>
            <Button
              variant="outline"
              onClick={setExampleMusic}
            >
              Set Example Music
            </Button>
          </div>
        </div>

        {/* Current State */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Card State
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Card ID:</span>
              <span className="ml-2 text-sm text-gray-900">{testCard.id}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Order:</span>
              <span className="ml-2 text-sm text-gray-900">{testCard.order} of 12</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Title:</span>
              <span className="ml-2 text-sm text-gray-900">{testCard.title}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">YouTube URL:</span>
              <span className="ml-2 text-sm text-gray-900">
                {testCard.youtubeUrl || '(none)'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Has Music:</span>
              <span className="ml-2 text-sm text-gray-900">
                {testCard.youtubeUrl ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Yes
                  </span>
                ) : (
                  'No'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Last Action */}
        {lastAction && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Last Action
            </h3>
            <p className="text-sm text-blue-800">{lastAction}</p>
          </div>
        )}

        {/* Test Scenarios */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Scenarios
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                1. Add Music to Card Without Music
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Click "Reset to No Music", then "Open Modal". Add a YouTube URL and save.
              </p>
              <p className="text-xs text-gray-500">
                Expected: Modal shows "Adicionar Música", no current music displayed
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                2. Edit Existing Music
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Click "Set Example Music", then "Open Modal". Change the URL and save.
              </p>
              <p className="text-xs text-gray-500">
                Expected: Modal shows "Editar Música", current music displayed, "Remover Música" button visible
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                3. Remove Music
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Click "Set Example Music", then "Open Modal". Click "Remover Música".
              </p>
              <p className="text-xs text-gray-500">
                Expected: Music is removed, card state updates to show no music
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                4. Invalid URL Validation
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Open modal and enter an invalid URL (e.g., "not-a-url" or "https://google.com").
              </p>
              <p className="text-xs text-gray-500">
                Expected: Error message shown, save button disabled
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                5. Valid URL Validation
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Open modal and enter a valid YouTube URL. Wait for validation.
              </p>
              <p className="text-xs text-gray-500">
                Expected: Green checkmark shown, video preview appears, video title displayed
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                6. Cancel with Changes
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Open modal, enter a URL, then click "Cancelar".
              </p>
              <p className="text-xs text-gray-500">
                Expected: Confirmation dialog appears asking to discard changes
              </p>
            </div>

            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                7. Cancel without Changes
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Open modal, don't make any changes, then click "Cancelar".
              </p>
              <p className="text-xs text-gray-500">
                Expected: Modal closes immediately without confirmation
              </p>
            </div>

            <div className="border-l-4 border-gray-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                8. Keyboard Shortcuts
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Open modal, enter a valid URL, press Ctrl+Enter (or Cmd+Enter on Mac).
              </p>
              <p className="text-xs text-gray-500">
                Expected: Music is saved and modal closes
              </p>
            </div>

            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                9. Different URL Formats
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Test with different YouTube URL formats:
              </p>
              <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                <li>https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
                <li>https://youtu.be/dQw4w9WgXcQ</li>
                <li>https://www.youtube.com/embed/dQw4w9WgXcQ</li>
              </ul>
              <p className="text-xs text-gray-500 mt-1">
                Expected: All formats should be validated and work correctly
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-medium text-gray-900 mb-1">
                10. Responsive Design
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Open modal and resize browser window to mobile size (&lt; 768px).
              </p>
              <p className="text-xs text-gray-500">
                Expected: Modal becomes fullscreen, buttons stack vertically
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            💡 Testing Instructions
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Open browser console to see save/remove logs</li>
            <li>Test all scenarios listed above</li>
            <li>Verify validation works in real-time</li>
            <li>Check that video preview loads correctly</li>
            <li>Test keyboard shortcuts (Escape, Ctrl+Enter)</li>
            <li>Test responsive behavior on different screen sizes</li>
            <li>Verify accessibility with keyboard navigation</li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      <MusicSelectionModal
        card={testCard}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onRemove={handleRemove}
      />
    </div>
  );
}
