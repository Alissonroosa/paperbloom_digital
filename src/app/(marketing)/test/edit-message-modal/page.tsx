'use client';

import React, { useState } from 'react';
import { EditMessageModal } from '@/components/card-editor/modals/EditMessageModal';
import { Card } from '@/types/card';
import { Button } from '@/components/ui/Button';

/**
 * Test page for EditMessageModal component
 * 
 * Tests:
 * - Modal opening and closing
 * - Title and message editing
 * - Character counting
 * - Validation
 * - Save functionality
 * - Cancel functionality
 * - Unsaved changes confirmation
 * - Responsive design
 */
export default function EditMessageModalTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedData, setSavedData] = useState<{ title: string; messageText: string } | null>(null);
  const [saveCount, setSaveCount] = useState(0);

  // Mock card data
  const [mockCard, setMockCard] = useState<Card>({
    id: 'test-card-1',
    collectionId: 'test-collection-1',
    order: 1,
    title: 'Abra quando... estiver tendo um dia difícil',
    messageText: 'Sei que hoje não está sendo fácil, mas quero que saiba que você é mais forte do que imagina. Cada desafio que você enfrenta te torna mais resiliente.',
    imageUrl: null,
    youtubeUrl: null,
    status: 'unopened',
    openedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const handleSave = async (cardId: string, data: { title: string; messageText: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update mock card
    setMockCard(prev => ({
      ...prev,
      title: data.title,
      messageText: data.messageText,
      updatedAt: new Date(),
    }));

    // Save for display
    setSavedData(data);
    setSaveCount(prev => prev + 1);
  };

  const resetCard = () => {
    setMockCard({
      id: 'test-card-1',
      collectionId: 'test-collection-1',
      order: 1,
      title: 'Abra quando... estiver tendo um dia difícil',
      messageText: 'Sei que hoje não está sendo fácil, mas quero que saiba que você é mais forte do que imagina.',
      imageUrl: null,
      youtubeUrl: null,
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setSavedData(null);
    setSaveCount(0);
  };

  const setLongContent = () => {
    setMockCard(prev => ({
      ...prev,
      title: 'A'.repeat(180) + ' - Título longo para testar limite',
      messageText: 'B'.repeat(450) + ' - Mensagem longa para testar limite de caracteres.',
    }));
  };

  const setEmptyContent = () => {
    setMockCard(prev => ({
      ...prev,
      title: '',
      messageText: '',
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          EditMessageModal Test Page
        </h1>
        <p className="text-gray-600 mb-8">
          Test the EditMessageModal component with various scenarios
        </p>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
              <Button variant="outline" onClick={resetCard}>
                Reset Card
              </Button>
              <Button variant="outline" onClick={setLongContent}>
                Set Long Content
              </Button>
              <Button variant="outline" onClick={setEmptyContent}>
                Set Empty Content
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Test Scenarios:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Open modal and edit content</li>
                <li>Test character counting (200 for title, 500 for message)</li>
                <li>Try to save with empty fields (should show validation errors)</li>
                <li>Try to exceed character limits (counter turns red)</li>
                <li>Make changes and click Cancel (should show confirmation)</li>
                <li>Make changes and click outside modal (should show confirmation)</li>
                <li>Press Escape to close (should show confirmation if changes exist)</li>
                <li>Press Ctrl+Enter to save quickly</li>
                <li>Test on mobile viewport (should be fullscreen)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Card State */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Card State</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title ({mockCard.title.length}/200 characters)
              </label>
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-900">{mockCard.title || '(empty)'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message ({mockCard.messageText.length}/500 characters)
              </label>
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {mockCard.messageText || '(empty)'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Card ID:</strong> {mockCard.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Order:</strong> {mockCard.order} of 12
              </p>
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> {mockCard.updatedAt.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Save History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Save History ({saveCount} saves)
          </h2>
          
          {savedData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Saved Title
                </label>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-gray-900">{savedData.title}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Saved Message
                </label>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{savedData.messageText}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No saves yet. Open the modal and save some changes.</p>
          )}
        </div>

        {/* Responsive Testing Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📱 Responsive Testing
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            Test the modal at different viewport sizes:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>Mobile (&lt; 640px):</strong> Modal should be fullscreen, buttons stack vertically</li>
            <li><strong>Tablet (640px - 768px):</strong> Modal centered with padding, buttons horizontal</li>
            <li><strong>Desktop (&gt; 768px):</strong> Modal centered with max-width, optimal spacing</li>
          </ul>
        </div>

        {/* Accessibility Testing Guide */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            ♿ Accessibility Testing
          </h3>
          <p className="text-sm text-purple-800 mb-3">
            Test keyboard navigation and screen reader support:
          </p>
          <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
            <li><strong>Tab:</strong> Navigate between fields and buttons</li>
            <li><strong>Escape:</strong> Close modal (with confirmation if changes exist)</li>
            <li><strong>Ctrl+Enter:</strong> Save changes quickly</li>
            <li><strong>Screen Reader:</strong> All elements should have proper labels</li>
            <li><strong>Focus:</strong> Focus should be trapped within modal</li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      <EditMessageModal
        card={mockCard}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
