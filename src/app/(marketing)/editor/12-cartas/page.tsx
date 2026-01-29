'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiveStepCardCollectionEditor } from '@/components/card-editor/FiveStepCardCollectionEditor';
import { CardCollectionEditorProvider } from '@/contexts/CardCollectionEditorContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

/**
 * Editor de 12 Cartas
 * Permite criar uma coleção personalizada de 12 cartas
 */
export default function Editor12CartasPage() {
  const router = useRouter();
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criar coleção automaticamente ao carregar (apenas uma vez)
  // Usa useRef para garantir execução única mesmo com React 18 Strict Mode
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Evitar execução dupla no React 18 Strict Mode
    if (hasInitialized.current) {
      return;
    }
    
    hasInitialized.current = true;
    
    const initializeCollection = async () => {
      try {
        const response = await fetch('/api/card-collections/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientName: 'Destinatário',
            senderName: 'Remetente'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Falha ao criar coleção');
        }

        const { collection } = await response.json();
        setCollectionId(collection.id);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to create collection:', err);
        setError(err instanceof Error ? err.message : 'Erro ao criar coleção');
        setIsLoading(false);
      }
    };

    initializeCollection();
  }, []); // Array vazio garante que só executa uma vez

  const handleFinalize = async () => {
    if (!collectionId) return;

    try {
      // Criar checkout session
      const response = await fetch('/api/checkout/card-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId })
      });

      if (!response.ok) {
        throw new Error('Falha ao criar checkout');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create checkout:', err);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-screen-2xl mx-auto">
            <Link 
              href="/" 
              className="font-serif text-xl font-bold tracking-tight text-text-main"
            >
              Paper Bloom
            </Link>
            <div className="text-sm text-muted-foreground hidden md:block">
              Editor de 12 Cartas
            </div>
          </div>
        </header>

        {/* Loading */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Preparando seu editor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-screen-2xl mx-auto">
            <Link 
              href="/" 
              className="font-serif text-xl font-bold tracking-tight text-text-main"
            >
              Paper Bloom
            </Link>
          </div>
        </header>

        {/* Error */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Erro ao Carregar Editor
              </h2>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-screen-2xl mx-auto">
          <Link 
            href="/" 
            className="font-serif text-xl font-bold tracking-tight text-text-main"
          >
            Paper Bloom
          </Link>
          <div className="text-sm text-muted-foreground hidden md:block">
            Editor de 12 Cartas
          </div>
          <Link href="/">
            <Button size="sm" variant="ghost">
              Cancelar
            </Button>
          </Link>
        </div>
      </header>

      {/* Editor */}
      {collectionId && (
        <CardCollectionEditorProvider
          collectionId={collectionId}
          autoSaveEnabled={true}
        >
          <FiveStepCardCollectionEditor
            onFinalize={handleFinalize}
          />
        </CardCollectionEditorProvider>
      )}
    </div>
  );
}
