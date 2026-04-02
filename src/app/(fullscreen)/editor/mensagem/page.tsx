'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WizardProvider } from '@/contexts/WizardContext';
import { InteractiveWizardProvider, useInteractiveWizardContext } from '@/contexts/InteractiveWizardContext';
import { DIGITAL_MESSAGE_CONFIG } from '@/types/interactive-wizard';
import { analytics } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Step components - New structure
import {
  Step1Recipient,
  Step2Message,
  Step3Date,
  Step4Photos,
  Step5MusicTheme,
  Step6Finalize,
} from './steps';

const STEP_NAMES = [
  'Para Quem?',
  'Sua Mensagem',
  'Data Especial',
  'Fotos',
  'Música e Tema',
  'Finalizar',
];

/**
 * Editor Content Component
 * Renders the step components with animated transitions
 * Uses InteractiveWizardContext for navigation state
 * Uses WizardContext for data management
 * 
 * @see Requirements 5.1, 5.3
 */
function EditorContent() {
  const { state } = useInteractiveWizardContext();
  const hasTrackedStart = useRef(false);
  const lastTrackedStep = useRef(-1);

  // Track: Início do editor
  useEffect(() => {
    if (!hasTrackedStart.current) {
      analytics.startEditor('message');
      hasTrackedStart.current = true;
    }
  }, []);

  // Track: Mudança de step
  useEffect(() => {
    if (state.currentStep !== lastTrackedStep.current) {
      analytics.editorStep(
        'message',
        state.currentStep + 1, // Convert to 1-based for analytics
        STEP_NAMES[state.currentStep] || `Step ${state.currentStep + 1}`
      );
      lastTrackedStep.current = state.currentStep;
    }
  }, [state.currentStep]);

  // Gradient background from config
  const gradientClass = `bg-gradient-to-br from-${DIGITAL_MESSAGE_CONFIG.gradientColors.from} ${
    DIGITAL_MESSAGE_CONFIG.gradientColors.via ? `via-${DIGITAL_MESSAGE_CONFIG.gradientColors.via}` : ''
  } to-${DIGITAL_MESSAGE_CONFIG.gradientColors.to}`;

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
            <Step1Recipient />
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
            <Step2Message />
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
            <Step3Date />
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
            <Step4Photos />
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
            <Step5MusicTheme />
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
            <Step6Finalize />
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
    <div className="min-h-[100dvh] bg-gradient-to-br from-rose-50 via-white to-amber-50 flex flex-col">
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
            Editor de Mensagem Digital
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
    <div className="min-h-[100dvh] bg-gradient-to-br from-rose-50 via-white to-amber-50 flex flex-col">
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
 * Editor Mensagem Digital Page - Fullscreen Interactive Wizard
 * 
 * Provides both:
 * - InteractiveWizardProvider for navigation and step management
 * - WizardProvider for data management (existing context)
 * 
 * @see Requirements 5.1, 5.3, 5.6, 5.8
 */
export default function EditorMensagemPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double execution in React 18 Strict Mode
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    // Simple initialization - no API call needed for digital message
    // The WizardProvider handles all state management
    const initializeEditor = async () => {
      try {
        // Small delay to show loading state and ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize editor:', err);
        setError(err instanceof Error ? err.message : 'Erro ao inicializar editor');
        setIsLoading(false);
      }
    };

    initializeEditor();
  }, []);

  // Handle step change for analytics
  const handleStepChange = (_step: number, _direction: 'forward' | 'backward') => {
    // Analytics tracking is handled in EditorContent
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <WizardProvider>
      <InteractiveWizardProvider
        config={DIGITAL_MESSAGE_CONFIG}
        onStepChange={handleStepChange}
      >
        <EditorContent />
      </InteractiveWizardProvider>
    </WizardProvider>
  );
}
