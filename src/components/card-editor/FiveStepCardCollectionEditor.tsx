'use client';

import React, { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AutoSaveIndicator } from '@/components/editor/AutoSaveIndicator';
import { CardGridView } from './CardGridView';
import { CardCollectionPreview } from './CardCollectionPreview';
import {
  useCardCollectionEditorState,
  useCardCollectionEditorActions,
} from '@/contexts/CardCollectionEditorContext';
import { ArrowLeft, ArrowRight, ShoppingCart, Loader2, Play, AlertCircle, CheckCircle, X } from 'lucide-react';

// Lazy load modals for better performance
const EditMessageModal = lazy(() => import('./modals/EditMessageModal').then(m => ({ default: m.EditMessageModal })));
const PhotoUploadModal = lazy(() => import('./modals/PhotoUploadModal').then(m => ({ default: m.PhotoUploadModal })));

/**
 * FiveStepCardCollectionEditor Props
 */
export interface FiveStepCardCollectionEditorProps {
  onFinalize: () => Promise<void>;
  isProcessing?: boolean;
}

/**
 * Modal state type
 */
type ModalType = 'message' | 'photo' | null;

/**
 * Step configuration
 */
const STEPS = [
  { index: 0, title: 'Mensagem Inicial', type: 'intro' as const },
  { index: 1, title: 'Momentos Difíceis', subtitle: 'Cartas 1-4', type: 'cards' as const, cardIndices: [0, 1, 2, 3] },
  { index: 2, title: 'Momentos de Amor', subtitle: 'Cartas 5-8', type: 'cards' as const, cardIndices: [4, 5, 6, 7] },
  { index: 3, title: 'Momentos Especiais', subtitle: 'Cartas 9-12', type: 'cards' as const, cardIndices: [8, 9, 10, 11] },
  { index: 4, title: 'Dados para Envio', type: 'delivery' as const },
];

/**
 * FiveStepCardCollectionEditor Component
 * 
 * Editor with 5 steps:
 * 1. Initial message (From/To)
 * 2-4. Card blocks (4 cards each)
 * 5. Delivery data (name, phone, email)
 */
export function FiveStepCardCollectionEditor({
  onFinalize,
  isProcessing = false,
}: FiveStepCardCollectionEditorProps) {
  // Context hooks
  const { cards, collection, isSaving, lastSaved, hasUnsavedChanges } = useCardCollectionEditorState();
  const {
    updateCard,
    updateCollection,
    canProceedToCheckout,
    clearLocalStorage,
  } = useCardCollectionEditorActions();

  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  
  // Track which steps have been completed (user clicked "Next")
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isFinalizingState, setIsFinalizingState] = useState(false);

  // Preview state
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Intro form state
  const [senderName, setSenderName] = useState(collection?.senderName || '');
  const [recipientName, setRecipientName] = useState(collection?.recipientName || '');
  const [youtubeUrl, setYoutubeUrl] = useState(collection?.youtubeVideoId ? `https://www.youtube.com/watch?v=${collection.youtubeVideoId}` : '');
  const [musicStartTime, setMusicStartTime] = useState(0);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(collection?.youtubeVideoId || null);
  const [isValidUrl, setIsValidUrl] = useState(!!collection?.youtubeVideoId);

  // Delivery form state (contact info of the buyer)
  const [deliveryName, setDeliveryName] = useState(collection?.contactName || '');
  const [deliveryPhone, setDeliveryPhone] = useState(collection?.contactPhone || '');
  const [deliveryEmail, setDeliveryEmail] = useState(collection?.contactEmail || '');

  // Get current step config
  const currentStepConfig = STEPS[currentStep];
  
  // Get cards for current step
  const currentStepCards = useMemo(() => {
    if (currentStepConfig.type === 'cards') {
      return currentStepConfig.cardIndices.map(idx => cards[idx]).filter(Boolean);
    }
    return [];
  }, [currentStep, cards, currentStepConfig]);

  // Get active card for modals
  const activeCard = useMemo(() => 
    activeCardId ? cards.find(c => c.id === activeCardId) : null,
    [activeCardId, cards]
  );

  // Calculate overall progress based on completed steps
  const { totalCards, completedCards, overallProgress } = useMemo(() => {
    // Always count all 12 cards for the total
    const total = 12;
    
    // Determine which cards should be counted as "completed" based on completed steps
    let cardsToCount: typeof cards = [];
    
    // Step 0 (intro) doesn't have cards
    // Step 1 = cards 0-3
    // Step 2 = cards 4-7
    // Step 3 = cards 8-11
    
    if (completedSteps.has(1)) {
      cardsToCount = [...cardsToCount, ...cards.slice(0, 4)];
    }
    if (completedSteps.has(2)) {
      cardsToCount = [...cardsToCount, ...cards.slice(4, 8)];
    }
    if (completedSteps.has(3)) {
      cardsToCount = [...cardsToCount, ...cards.slice(8, 12)];
    }
    
    // Count completed cards only from the steps that were completed
    const completed = cardsToCount.filter(card => {
      return (
        card.title.trim().length > 0 &&
        card.messageText.trim().length > 0 &&
        card.messageText.length <= 500
      );
    }).length;
    
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Only show progress if we're past the intro step
    const shouldShowProgress = currentStep > 0;
    
    return {
      totalCards: shouldShowProgress ? total : 0,
      completedCards: completed,
      overallProgress: progress,
    };
  }, [cards, currentStep, completedSteps]);

  /**
   * Navigation handlers
   */
  const goToNextStep = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      // Mark current step as completed when moving forward
      if (currentStep > 0 && currentStep <= 3) {
        setCompletedSteps(prev => new Set(prev).add(currentStep));
      }
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  /**
   * Extract YouTube video ID from URL
   */
  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  /**
   * Format time in MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Validate YouTube URL and extract video ID
  useEffect(() => {
    if (!youtubeUrl || youtubeUrl.trim() === '') {
      setUrlError(null);
      setVideoId(null);
      setIsValidUrl(false);
      return;
    }

    // Check if URL matches YouTube domain pattern
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
    if (!youtubePattern.test(youtubeUrl)) {
      setUrlError('Deve ser uma URL do YouTube válida');
      setVideoId(null);
      setIsValidUrl(false);
      return;
    }

    // Extract video ID
    const extractedId = extractYouTubeVideoId(youtubeUrl);
    if (!extractedId) {
      setUrlError('Não foi possível extrair o ID do vídeo. Verifique a URL.');
      setVideoId(null);
      setIsValidUrl(false);
      return;
    }

    // Valid URL with extracted video ID
    setUrlError(null);
    setVideoId(extractedId);
    setIsValidUrl(true);
  }, [youtubeUrl]);

  /**
   * Save intro message
   */
  const handleSaveIntro = useCallback(async () => {
    if (collection) {
      const videoId = extractYouTubeVideoId(youtubeUrl);
      
      console.log('[Editor] Salvando intro:', {
        senderName,
        recipientName,
        youtubeUrl,
        extractedVideoId: videoId,
        collectionId: collection.id,
      });
      
      await updateCollection(collection.id, {
        senderName,
        recipientName,
        youtubeVideoId: videoId,
      });
      
      console.log('[Editor] Intro salvo com sucesso!');
    }
    goToNextStep();
  }, [collection, senderName, recipientName, youtubeUrl, updateCollection, goToNextStep]);

  /**
   * Modal handlers
   */
  const handleEditMessage = useCallback((cardId: string) => {
    setActiveCardId(cardId);
    setActiveModal('message');
  }, []);

  const handleEditPhoto = useCallback((cardId: string) => {
    setActiveCardId(cardId);
    setActiveModal('photo');
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
    setActiveCardId(null);
  }, []);

  const handleSaveMessage = useCallback(async (cardId: string, data: { title: string; messageText: string }) => {
    await updateCard(cardId, data);
  }, [updateCard]);

  const handleSavePhoto = useCallback(async (cardId: string, imageUrl: string) => {
    await updateCard(cardId, { imageUrl });
  }, [updateCard]);

  const handleRemovePhoto = useCallback(async (cardId: string) => {
    await updateCard(cardId, { imageUrl: null });
  }, [updateCard]);

  /**
   * Handle finalize
   */
  const handleFinalize = useCallback(async () => {
    // Save delivery data first (contact info of the buyer, not the recipient)
    if (collection) {
      await updateCollection(collection.id, {
        contactName: deliveryName,
        contactPhone: deliveryPhone,
        contactEmail: deliveryEmail,
      });
    }

    if (!canProceedToCheckout()) {
      return;
    }

    setIsFinalizingState(true);
    try {
      await onFinalize();
      clearLocalStorage();
    } catch (error) {
      console.error('Error finalizing:', error);
    } finally {
      setIsFinalizingState(false);
    }
  }, [collection, deliveryName, deliveryPhone, deliveryEmail, updateCollection, canProceedToCheckout, onFinalize, clearLocalStorage]);

  // Validation for intro step
  const canProceedFromIntro = senderName.trim().length > 0 && 
                               recipientName.trim().length > 0;

  // Validation for delivery step
  const canProceedFromDelivery = deliveryName.trim().length > 0 && 
                                  deliveryPhone.trim().length > 0 && 
                                  deliveryEmail.trim().length > 0 &&
                                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container px-4 md:px-8 py-6 md:py-8 max-w-screen-2xl mx-auto">
        {/* Auto-save indicator */}
        <div className="mb-4 md:mb-6">
          <AutoSaveIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            onClearDraft={hasUnsavedChanges ? () => {
              if (confirm('Tem certeza que deseja limpar o rascunho salvo?')) {
                clearLocalStorage();
              }
            } : undefined}
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: Editor Steps */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 space-y-6">
              {/* Stepper - Inside the box */}
              <div className="pb-4 border-b">
                <div className="w-full">
                  {/* Stepper - Horizontal */}
                  <div className="flex items-center justify-center gap-2">
                    {STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStep;
                      const isActive = idx === currentStep;
                      const isLast = idx === STEPS.length - 1;

                      return (
                        <React.Fragment key={idx}>
                          {/* Step Circle */}
                          <button
                            onClick={() => setCurrentStep(idx)}
                            disabled={idx > currentStep}
                            className={`
                              relative flex items-center justify-center
                              w-6 h-6 rounded-full font-semibold text-[10px]
                              transition-all duration-200
                              ${
                                isCompleted
                                  ? 'bg-secondary text-white hover:bg-text-accent cursor-pointer'
                                  : isActive
                                  ? 'bg-text-accent text-white ring-1 ring-primary'
                                  : 'bg-gray-200 text-gray-400'
                              }
                              ${idx <= currentStep ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                              focus:outline-none focus:ring-1 focus:ring-text-accent
                            `}
                            aria-label={`Passo ${idx + 1} - ${step.title} - ${
                              isCompleted ? 'Concluído' : isActive ? 'Atual' : 'Pendente'
                            }`}
                            aria-current={isActive ? 'step' : undefined}
                            title={step.title}
                          >
                            {isCompleted ? (
                              <span>✓</span>
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </button>

                          {/* Connector Line */}
                          {!isLast && (
                            <div
                              className={`
                                w-4 h-[1px]
                                transition-colors duration-300
                                ${
                                  isCompleted
                                    ? 'bg-secondary'
                                    : 'bg-gray-300'
                                }
                              `}
                              aria-hidden="true"
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-text-main">
                  {currentStepConfig.title}
                </h2>
                {currentStepConfig.subtitle && (
                  <p className="text-xs text-gray-500 font-medium">
                    {currentStepConfig.subtitle}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Passo {currentStep + 1} de {STEPS.length}
                </p>
                {/* Progress Badge - Only show when there are cards to count */}
                {totalCards > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="text-xs text-gray-600">
                      {completedCards} de {totalCards} cartas completas
                    </div>
                    <Badge
                      variant={overallProgress === 100 ? 'default' : 'secondary'}
                      className={`text-xs px-2 py-0.5 ${
                        overallProgress === 100 ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                    >
                      {overallProgress}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                {/* Step 1: Intro Message */}
                {currentStepConfig.type === 'intro' && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          Informações Básicas
                        </h3>
                        <p className="text-xs text-gray-600">
                          Preencha os dados iniciais da sua coleção de cartas
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="sender-name" className="block text-xs font-medium text-gray-700 mb-1">
                            De: <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="sender-name"
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Seu nome"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="recipient-name" className="block text-xs font-medium text-gray-700 mb-1">
                            Para: <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="recipient-name"
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nome do destinatário"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label htmlFor="youtube-url" className="block text-xs font-medium text-gray-700 mb-1">
                          🎵 Música de Fundo (opcional)
                        </label>
                        <div className="relative">
                          <input
                            id="youtube-url"
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:border-transparent ${
                              urlError ? 'border-red-500 focus:ring-red-500' : 
                              isValidUrl ? 'border-green-500 focus:ring-green-500' : 
                              'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Cole o link do YouTube aqui (ex: https://www.youtube.com/watch?v=...)"
                          />
                          {youtubeUrl && (
                            <button
                              type="button"
                              onClick={() => setYoutubeUrl('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* URL Validation Feedback */}
                        {urlError && (
                          <div className="flex items-start gap-2 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>{urlError}</span>
                          </div>
                        )}

                        {isValidUrl && videoId && (
                          <div className="flex items-start gap-2 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>URL válida! ID do vídeo: {videoId}</span>
                          </div>
                        )}

                        {!youtubeUrl && (
                          <p className="text-[10px] text-gray-500">
                            A música tocará durante toda a experiência das 12 cartas
                          </p>
                        )}

                        {/* Music Start Time Slider */}
                        {isValidUrl && videoId && (
                          <div className="space-y-2 pt-2">
                            <label htmlFor="music-start-time" className="block text-xs font-medium text-gray-700">
                              Tempo de Início da Música
                            </label>
                            <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                              <span>Início: {formatTime(musicStartTime)}</span>
                              <span className="text-gray-500">Máximo: 5:00</span>
                            </div>
                            <input
                              id="music-start-time"
                              type="range"
                              min="0"
                              max="300"
                              step="5"
                              value={musicStartTime}
                              onChange={(e) => setMusicStartTime(parseInt(e.target.value, 10))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500">
                              <span>0:00</span>
                              <span>1:00</span>
                              <span>2:00</span>
                              <span>3:00</span>
                              <span>4:00</span>
                              <span>5:00</span>
                            </div>
                          </div>
                        )}

                        {/* Music Preview Player */}
                        {isValidUrl && videoId && (
                          <div className="space-y-2 pt-2">
                            <label className="block text-xs font-medium text-gray-700">
                              Prévia da Música
                            </label>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                              <div className="aspect-video bg-black">
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}?start=${musicStartTime}`}
                                  title="Prévia da música do YouTube"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Play className="w-3 h-3" />
                              <span>
                                A música começará em {formatTime(musicStartTime)} quando abrir as cartas.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Steps 2-4: Card Blocks */}
                {currentStepConfig.type === 'cards' && (
                  <div className="space-y-4">
                    <CardGridView
                      cards={currentStepCards}
                      onEditMessage={handleEditMessage}
                      onEditPhoto={handleEditPhoto}
                    />
                  </div>
                )}

                {/* Step 5: Delivery Data */}
                {currentStepConfig.type === 'delivery' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-800">
                        <strong>Atenção:</strong> Estes são os dados de <strong>quem está comprando</strong> (você). 
                        O email será enviado para você com o link e QR Code das 12 cartas para <strong>{recipientName}</strong>.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="delivery-name" className="block text-xs font-medium text-gray-700 mb-1">
                        Seu Nome Completo *
                      </label>
                      <input
                        id="delivery-name"
                        type="text"
                        value={deliveryName}
                        onChange={(e) => setDeliveryName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="delivery-phone" className="block text-xs font-medium text-gray-700 mb-1">
                        Seu Telefone *
                      </label>
                      <input
                        id="delivery-phone"
                        type="tel"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="delivery-email" className="block text-xs font-medium text-gray-700 mb-1">
                        Seu Email *
                      </label>
                      <input
                        id="delivery-email"
                        type="email"
                        value={deliveryEmail}
                        onChange={(e) => setDeliveryEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="seu-email@exemplo.com"
                        required
                      />
                      {deliveryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryEmail) && (
                        <p className="text-xs text-red-600 mt-1">
                          Email inválido
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        O QR Code e link serão enviados para este email
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t gap-3">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 0 || isProcessing || isFinalizingState}
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="Voltar para etapa anterior"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                  Voltar
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button
                    onClick={currentStepConfig.type === 'intro' ? handleSaveIntro : goToNextStep}
                    disabled={
                      (currentStepConfig.type === 'intro' && !canProceedFromIntro) ||
                      isProcessing
                    }
                    className="min-h-[44px] min-w-[44px]"
                    aria-label="Avançar para próxima etapa"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinalize}
                    disabled={
                      !canProceedFromDelivery ||
                      !canProceedToCheckout() ||
                      isProcessing ||
                      isFinalizingState
                    }
                    className="min-h-[44px] min-w-[44px]"
                    aria-label="Continuar para pagamento"
                    aria-busy={isFinalizingState}
                  >
                    {isFinalizingState ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ir para Pagamento
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Preview Panel */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="sticky top-6 space-y-4">
              <CardCollectionPreview
                cards={cards}
                introMessage={collection?.introMessage}
                senderName={collection?.senderName}
                recipientName={collection?.recipientName}
                viewMode={previewMode}
                onViewModeChange={setPreviewMode}
              />

              {/* Info Box - Como Funciona */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">💡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Como Funciona:
                    </h3>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Preencha as informações básicas (remetente e destinatário)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Edite as 12 cartas com suas mensagens personalizadas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Adicione fotos especiais para cada carta (opcional)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Escolha uma música do YouTube para tocar durante a experiência</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Preencha os dados de contato para envio</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <span>Finalize e pague para gerar o link único</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {activeCard && activeModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-gray-900">Carregando...</span>
            </div>
          </div>
        }>
          {activeModal === 'message' && (
            <EditMessageModal
              card={activeCard}
              isOpen={true}
              onClose={handleCloseModal}
              onSave={handleSaveMessage}
            />
          )}

          {activeModal === 'photo' && (
            <PhotoUploadModal
              card={activeCard}
              isOpen={true}
              onClose={handleCloseModal}
              onSave={handleSavePhoto}
              onRemove={handleRemovePhoto}
            />
          )}

        </Suspense>
      )}
    </div>
  );
}
