'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CardCollectionEditorProvider, useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { InteractiveWizardProvider, useInteractiveWizardContext } from '@/contexts/InteractiveWizardContext';
import { CARD_COLLECTION_CONFIG } from '@/types/interactive-wizard';
import { analytics } from '@/lib/analytics';
import { captureUtmsFromUrl } from '@/lib/utm';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const SUPPORT_WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '5551992698003';
const SUPPORT_WHATSAPP_MESSAGE =
  'Olá! Estou criando minhas 12 cartas no editor da Paper Bloom e tenho uma dúvida.';
const LOGO_WHATSAPP = 'https://imagem.paperbloom.com.br/loja/assets/whatsapp.svg';

/**
 * Botão de ajuda no WhatsApp.
 *
 * Aparece só depois de 30s no editor — pra não competir com o CTA principal
 * e não convidar o usuário a sair do funil cedo. Quem fica 30s+ tem dúvida
 * real. Em mobile fica como ícone compacto (sem texto) pra não obstruir
 * inputs e o CTA do step.
 */
function WhatsAppHelpButton() {
  const url = `https://wa.me/${SUPPORT_WHATSAPP_PHONE}?text=${encodeURIComponent(SUPPORT_WHATSAPP_MESSAGE)}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Dúvidas? Chama no WhatsApp"
      title="Dúvidas? Chama no WhatsApp"
      className="fixed bottom-4 left-4 z-50 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] h-12 w-12 sm:w-auto sm:px-4 sm:py-3 text-sm font-medium text-white shadow-lg ring-1 ring-black/5 transition-all hover:scale-105 hover:bg-[#1FB855] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_WHATSAPP}
        alt=""
        className="h-5 w-5"
        style={{ filter: 'brightness(0) invert(1)' }}
        aria-hidden="true"
      />
      <span className="hidden sm:inline">Dúvidas?</span>
    </a>
  );
}

/**
 * Error Boundary to catch runtime errors in the editor
 */
class EditorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[EditorErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center p-8 bg-red-50">
          <div className="max-w-lg bg-white rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-red-800">Erro no Editor</h2>
            <pre className="text-xs text-red-700 bg-red-50 p-4 rounded overflow-auto max-h-60 whitespace-pre-wrap">
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Step components
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2Intro } from './steps/Step2Intro';
import { Step3AllCards } from './steps/Step3AllCards';
import { Step4Preview } from './steps/Step4Preview';
import { Step5Checkout } from './steps/Step5Checkout';

const STEP_NAMES = [
  'Informações Básicas',
  'Suas 12 Cartas',
  'Capa, Mensagem e Música',
  'Pré-visualização',
  'Finalizar',
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
  const lastTrackedStep = useRef<number | null>(null);
  const stepStartTime = useRef<number>(Date.now());
  const editorStartTime = useRef<number>(Date.now());

  // Track: Início do editor
  useEffect(() => {
    if (!hasTrackedStart.current) {
      analytics.startEditor('card-collection');
      hasTrackedStart.current = true;
      editorStartTime.current = Date.now();
      stepStartTime.current = Date.now();
    }
  }, []);

  // Track: Mudança real de step + tempo gasto no step anterior
  useEffect(() => {
    if (lastTrackedStep.current === null) {
      lastTrackedStep.current = state.currentStep;
      stepStartTime.current = Date.now();
      return;
    }
    if (state.currentStep !== lastTrackedStep.current) {
      const previousStep = lastTrackedStep.current;
      const secondsOnPreviousStep = (Date.now() - stepStartTime.current) / 1000;

      analytics.editorTimeOnStep(
        'card-collection',
        previousStep + 1,
        STEP_NAMES[previousStep] || `Step ${previousStep + 1}`,
        secondsOnPreviousStep,
      );

      analytics.editorStep(
        'card-collection',
        state.currentStep + 1,
        STEP_NAMES[state.currentStep] || `Step ${state.currentStep + 1}`
      );

      // Sinal de back navigation. Se outro componente (modal de "ajustar antes"
      // ou "voltar pra editar") já registrou com source específico, suprime aqui.
      if (state.currentStep < previousStep) {
        const suppressed = typeof window !== 'undefined'
          && sessionStorage.getItem('pb_suppress_next_back_nav') === '1';
        if (suppressed) {
          sessionStorage.removeItem('pb_suppress_next_back_nav');
        } else {
          analytics.editorBackNavigation(
            'card-collection',
            previousStep + 1,
            state.currentStep + 1,
            'wizard_back',
          );
        }
      }

      lastTrackedStep.current = state.currentStep;
      stepStartTime.current = Date.now();
    }
  }, [state.currentStep]);

  // Track: abandono (fechar aba / navegar pra fora antes de finalizar).
  // Lê os campos preenchidos da própria sessionStorage (mesma usada pelo shouldTrack)
  // — evita acoplar com o estado dos steps individuais.
  useEffect(() => {
    const handleBeforeUnload = () => {
      const totalSeconds = (Date.now() - editorStartTime.current) / 1000;
      const lastStep = lastTrackedStep.current ?? state.currentStep;
      const stepName = STEP_NAMES[lastStep] || `Step ${lastStep + 1}`;
      const fields: string[] = [];
      if (typeof window !== 'undefined') {
        try {
          for (const key of ['recipientName', 'senderName', 'introMessage', 'coverImageUrl', 'youtubeVideoId', 'card_message_edited', 'card_photo_added']) {
            if (sessionStorage.getItem(`tracked_editor_field_card-collection_${key}`)) {
              fields.push(key);
            }
          }
        } catch { /* ignore */ }
      }
      analytics.editorAbandon('card-collection', lastStep + 1, stepName, totalSeconds, fields);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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
            <Step3AllCards />
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
            <Step2Intro />
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
            <Step4Preview />
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
            <Step5Checkout />
          </motion.div>
        )}
      </AnimatePresence>
      <WhatsAppHelpButton />
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
const ACTIVE_KEY = 'paperbloom-active-card-collection-id';
const STEP_KEY_PREFIX = 'paperbloom-active-card-collection-step:';

export default function Editor12CartasPage() {
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [initialStep, setInitialStep] = useState(0);
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

    const readSavedStep = (id: string): number => {
      try {
        const raw = localStorage.getItem(STEP_KEY_PREFIX + id);
        if (!raw) return 0;
        const n = parseInt(raw, 10);
        return Number.isFinite(n) && n >= 0 ? n : 0;
      } catch {
        return 0;
      }
    };

    const initializeCollection = async () => {
      try {
        // 1. Tenta retomar uma collection draft anterior persistida no localStorage.
        //    Evita que voltar do navegador / do Mercado Pago zere o trabalho.
        const savedId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_KEY) : null;
        if (savedId) {
          const existing = await fetch(`/api/card-collections/${savedId}`).catch(() => null);
          if (existing?.ok) {
            const { collection } = await existing.json();
            if (collection && collection.status === 'pending') {
              setCollectionId(collection.id);
              setInitialStep(readSavedStep(collection.id));
              setIsLoading(false);
              return;
            }
          }
          // collection paga, removida, ou erro de fetch → começa nova
          localStorage.removeItem(ACTIVE_KEY);
          localStorage.removeItem(STEP_KEY_PREFIX + savedId);
        }

        // 2. Não há draft válida — cria collection nova.
        // Captura UTMs (first-touch) e persiste junto com a coleção pra atribuir
        // cada venda ao criativo/campanha de origem.
        const utms = captureUtmsFromUrl();
        const response = await fetch('/api/card-collections/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientName: 'Destinatário',
            senderName: 'Remetente',
            ...(utms ?? {}),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Falha ao criar coleção');
        }

        const { collection } = await response.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACTIVE_KEY, collection.id);
        }
        setCollectionId(collection.id);
        setInitialStep(0);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to create collection:', err);
        setError(err instanceof Error ? err.message : 'Erro ao criar coleção');
        setIsLoading(false);
      }
    };

    initializeCollection();
  }, []);

  // Persiste o step atual no localStorage por collectionId.
  // Permite retomar onde parou ao voltar do Mercado Pago / aba do navegador.
  const handleStepChange = (step: number, _direction: 'forward' | 'backward') => {
    if (typeof window === 'undefined' || !collectionId) return;
    try {
      localStorage.setItem(STEP_KEY_PREFIX + collectionId, String(step));
    } catch { /* localStorage indisponível — ignora */ }
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
      initialStep={initialStep}
      onStepChange={handleStepChange}
    >
      {collectionId && (
        <CardCollectionEditorProvider
          collectionId={collectionId}
          autoSaveEnabled={true}
        >
          <EditorErrorBoundary>
            <EditorContent />
          </EditorErrorBoundary>
        </CardCollectionEditorProvider>
      )}
    </InteractiveWizardProvider>
  );
}
