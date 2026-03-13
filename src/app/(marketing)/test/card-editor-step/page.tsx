'use client';

/**
 * Test page for CardEditorStep component
 * 
 * This page allows testing the CardEditorStep component with mock data.
 * 
 * To test properly:
 * 1. First create a card collection via the API
 * 2. Update the COLLECTION_ID below with the actual ID
 * 3. Navigate to /test/card-editor-step
 * 4. Test all functionality
 */

import React, { useEffect, useState } from 'react';
import { CardEditorStep } from '@/components/card-editor/CardEditorStep';
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';
import { Button } from '@/components/ui/Button';
import { Card, CardCollection } from '@/types/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

export default function TestCardEditorStepPage() {
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a test card collection
   */
  const createTestCollection = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/card-collections/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName: 'Teste Destinatário',
          senderName: 'Teste Remetente',
          contactEmail: 'teste@example.com',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create collection');
      }

      const data = await response.json();
      setCollectionId(data.collection.id);
      
      // Store in localStorage for persistence
      localStorage.setItem('test-card-collection-id', data.collection.id);
    } catch (err) {
      console.error('Error creating collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Load collection ID from localStorage on mount
   */
  useEffect(() => {
    const savedId = localStorage.getItem('test-card-collection-id');
    if (savedId) {
      setCollectionId(savedId);
    }
  }, []);

  /**
   * Clear test collection
   */
  const clearTestCollection = () => {
    localStorage.removeItem('test-card-collection-id');
    setCollectionId(null);
    setError(null);
  };

  if (!collectionId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Test: CardEditorStep Component
            </h1>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-sm font-semibold text-blue-900 mb-2">
                Setup Required
              </h2>
              <p className="text-sm text-blue-800">
                You need to create a test card collection first. Click the button below 
                to create a new collection with 12 pre-filled cards.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-sm font-semibold text-red-900 mb-2">
                  Error
                </h2>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              onClick={createTestCollection}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Collection...
                </>
              ) : (
                'Create Test Collection'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Test: CardEditorStep Component
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={clearTestCollection}
              >
                Clear Test Data
              </Button>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-sm font-semibold text-green-900 mb-2">
                ✓ Collection Created
              </h2>
              <p className="text-sm text-green-800 mb-2">
                Collection ID: <code className="bg-green-100 px-2 py-1 rounded">{collectionId}</code>
              </p>
              <p className="text-sm text-green-800">
                You can now test the CardEditorStep component. Use the navigation buttons 
                to move between cards.
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">
              Test Checklist
            </h2>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Edit the title (max 200 characters)</li>
              <li>Edit the message (max 500 characters, watch color changes)</li>
              <li>Upload a photo (drag-and-drop or click)</li>
              <li>Add a YouTube URL and see the preview</li>
              <li>Verify auto-save indicator appears</li>
              <li>Navigate between cards and verify data persists</li>
              <li>Test validation errors (empty fields, too long text)</li>
              <li>Test image upload errors (wrong format, too large)</li>
              <li>Test YouTube URL errors (invalid format)</li>
            </ol>
          </div>

          <CardCollectionEditorProvider 
            collectionId={collectionId}
            autoSaveEnabled={true}
            autoSaveDebounceMs={2000}
          >
            <TestCardEditorStepWrapper />
          </CardCollectionEditorProvider>
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component to access context and provide navigation
 */
function TestCardEditorStepWrapper() {
  const [collection, setCollection] = useState<CardCollection | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load collection and cards
   */
  useEffect(() => {
    const loadData = async () => {
      const collectionId = localStorage.getItem('test-card-collection-id');
      if (!collectionId) return;

      try {
        const response = await fetch(`/api/card-collections/${collectionId}`);
        if (!response.ok) throw new Error('Failed to load collection');

        const data = await response.json();
        setCollection(data.collection);
        setCards(data.cards);
      } catch (error) {
        console.error('Error loading collection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardEditorStep />

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Carta Anterior
        </Button>

        <div className="text-sm text-gray-600">
          Carta {currentIndex + 1} de {cards.length}
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1))}
          disabled={currentIndex === cards.length - 1}
        >
          Próxima Carta
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Debug Info */}
      <details className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <summary className="text-sm font-semibold text-gray-900 cursor-pointer">
          Debug Info
        </summary>
        <div className="mt-4 space-y-2">
          <div className="text-sm">
            <strong>Collection:</strong>
            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
              {JSON.stringify(collection, null, 2)}
            </pre>
          </div>
          <div className="text-sm">
            <strong>Current Card:</strong>
            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
              {JSON.stringify(cards[currentIndex], null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
