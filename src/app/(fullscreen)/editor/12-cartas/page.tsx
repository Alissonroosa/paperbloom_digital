'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CardCollectionEditorProvider, useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { InteractiveWizardProvider, useInteractiveWizardContext } from '@/contexts/InteractiveWizardContext';
import { CARD_COLLECTION_CONFIG } from '@/types/interactive-wizard';
import { analytics } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Step components
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2Intro } from './steps/Step2Intro';
import { Step3Cards1to4 } from './steps/Step3Cards1to4';
import { Step4Cards5to8 } from './steps/Step4Cards5to8';
import { Step5Cards9to12 } from './steps/Step5Cards9to12';
import { Step6Contact } from './steps/Step6Contact';

const STEP_NAMES = [
  'Informações Básicas',
  'Mensagem e Música',
  'Momentos Difíceis',
  'Momentos de Amor',
  'Momentos Especiais',
  'Dados para Envio',
];

/**
 * Editor Content Component
 * Renders the step components with animated transitions
 * Uses InteractiveWizardContext for navigation state
 */
function EditorContent() {
  const { state } = useInteractiveWizardContext();
  const { collection } = useCardCollectionEditor();
  const hasTrackedStart = useRef(false);
  const lastTrackedStep = useRef(-1);

  // Track: Início do editor
  useEffect(() => {
    if (!hasTrackedStart.current) {
      analytics.startEditor('card-collection');
      hasTrackedStart.current = true;
    }
  }, []);

  // Track: Mudança de step
  useEffect(() => {
    if (state.currentStep !== lastTrackedStep.current) {
      analytics.editorStep(
        'card-collection',
        state.currentStep + 1, // Convert to 1-based for analytics
        STEP_NAMES[state.currentStep] || `Step ${state.currentStep + 1}`
      );
      lastTrackedStep.current = state.currentStep;
    }
  }, [state.currentStep]);

  // Gradient background from config
  const gradientClass = `bg-gradient-to-br from-${CARD_COLLECTION_CONFIG.gradientColors.from} ${
    CARD_COLLECTION_CONFIG.gradientColors.via ? `via-${CARD_COLLECTION_CONFIG.gradientColors.via}` : ''
  } to-${CARD_COLLECTION_CONFIG.gradientColors.to}`;

  return (
    <div className={`min-h-[100dvh] ${gradientClass}`}>
      <AnimatePresence mode="wait">
        {state.currentStep === 0 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step1BasicInfo />
          </motion.div>
        )}
        {state.currentStep === 1 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step2Intro />
          </motion.div>
        )}
        {state.currentStep === 2 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step3Cards1to4 />
          </motion.div>
        )}
        {state.currentStep === 3 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step4Cards5to8 />
          </motion.div>
        )}
        {state.currentStep === 4 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step5Cards9to12 />
          </motion.div>
        )}
        {state.currentStep === 5 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step6Contact />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Loading State Component
 */
function LoadingState() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
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

/**
 * Error State Component
 */
function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
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
            <Button onClick={() => window.location.reload()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Editor 12 Cartas Page - Fullscreen Interactive Wizard
 * 
 * Creates a collection on mount and provides both:
 * - InteractiveWizardProvider for navigation and step management
 * - CardCollectionEditorProvider for data management
 * 
 * @see Requirements 4.1, 4.3, 4.6, 4.8
 */
export default function Editor12CartasPage() {
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create collection on mount (only once)
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double execution in React 18 Strict Mode
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
            senderName: 'Remetente',
          }),
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
  }, []);

  // Handle step change for analytics
  const handleStepChange = (step: number, direction: 'forward' | 'backward') => {
    // Analytics tracking is handled in EditorContent
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <InteractiveWizardProvider
      config={CARD_COLLECTION_CONFIG}
      onStepChange={handleStepChange}
    >
      {collectionId && (
        <CardCollectionEditorProvider
          collectionId={collectionId}
          autoSaveEnabled={true}
        >
          <EditorContent />
        </CardCollectionEditorProvider>
      )}
    </InteractiveWizardProvider>
  );
}
