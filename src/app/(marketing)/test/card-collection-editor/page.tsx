'use client';

import { useState, useEffect } from 'react';
import { CardCollectionEditor } from '@/components/card-editor';
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';

/**
 * Test page for CardCollectionEditor component
 * Tests the full 12-card wizard with navigation and progress
 */
export default function TestCardCollectionEditorPage() {
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a test collection on mount
  useEffect(() => {
    const createTestCollection = async () => {
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
          throw new Error('Failed to create collection');
        }

        const { collection } = await response.json();
        setCollectionId(collection.id);
        setIsLoading(false);
      } catch (err) {
        console.error('Error creating collection:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    createTestCollection();
  }, []);

  const handleFinalize = async () => {
    console.log('Finalize clicked!');
    setIsCreatingCheckout(true);
    
    // Simulate checkout creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Checkout would be created here. Collection ID: ' + collectionId);
    setIsCreatingCheckout(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Criando conjunto de cartas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-gray-900 font-semibold mb-2">Erro ao criar conjunto</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!collectionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Nenhum conjunto disponível</p>
      </div>
    );
  }

  return (
    <div>
      {/* Test Header */}
      <div className="bg-yellow-50 border-b border-yellow-200 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-yellow-800">
            <strong>🧪 Página de Teste:</strong> CardCollectionEditor Component
            {' • '}
            <span className="font-mono text-xs">Collection ID: {collectionId}</span>
          </p>
        </div>
      </div>

      {/* Editor */}
      <CardCollectionEditorProvider 
        collectionId={collectionId}
        autoSaveEnabled={true}
        autoSaveDebounceMs={2000}
      >
        <CardCollectionEditor 
          onFinalize={handleFinalize}
          isProcessing={isCreatingCheckout}
        />
      </CardCollectionEditorProvider>
    </div>
  );
}
