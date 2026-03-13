'use client';

import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AutoSaveIndicator } from '@/components/editor/AutoSaveIndicator';
import { MomentNavigation } from './MomentNavigation';
import { CardGridView } from './CardGridView';
import {
  useCardCollectionEditorState,
  useCardCollectionEditorActions,
  useThematicMoments,
  THEMATIC_MOMENTS,
} from '@/contexts/CardCollectionEditorContext';
import { ArrowLeft, ArrowRight, ShoppingCart, Loader2 } from 'lucide-react';

// Lazy load modals for better performance
const EditMessageModal = lazy(() => import('./modals/EditMessageModal').then(m => ({ default: m.EditMessageModal })));
const PhotoUploadModal = lazy(() => import('./modals/PhotoUploadModal').then(m => ({ default: m.PhotoUploadModal })));
const MusicSelectionModal = lazy(() => import('./modals/MusicSelectionModal').then(m => ({ default: m.MusicSelectionModal })));

/**
 * GroupedCardCollectionEditor Props
 * Requirements: 7.3, 7.5, 7.6, 7.7, 9.1
 */
export interface GroupedCardCollectionEditorProps {
  onFinalize: () => Promise<void>;
  isProcessing?: boolean;
}

/**
 * Modal state type
 */
type ModalType = 'message' | 'photo' | 'music' | null;

/**
 * GroupedCardCollectionEditor Component
 * 
 * Main component that orchestrates the grouped card collection editing experience.
 * Displays cards grouped by thematic moments with modal-based editing.
 * 
 * Features:
 * - Header with overall progress indicator
 * - Moment navigation component
 * - Card grid view showing 4 cards per moment
 * - Modal management for editing message, photo, and music
 * - Footer with Previous/Next/Finalize navigation
 * - Auto-save indicators
 * - Responsive layout
 * 
 * Requirements: 7.3, 7.5, 7.6, 7.7, 9.1
 */
export function GroupedCardCollectionEditor({
  onFinalize,
  isProcessing = false,
}: GroupedCardCollectionEditorProps) {
  // Context hooks
  const { cards, isSaving, lastSaved, hasUnsavedChanges } = useCardCollectionEditorState();
  const {
    updateCard,
    canProceedToCheckout,
    clearLocalStorage,
  } = useCardCollectionEditorActions();
  const {
    currentMomentIndex,
    isFirstMoment,
    isLastMoment,
    moments,
    getCurrentMomentCards,
    getAllMomentsCompletionStatus,
    nextMoment,
    previousMoment,
    goToMoment,
  } = useThematicMoments();

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isFinalizingState, setIsFinalizingState] = useState(false);

  // Get current moment cards
  const currentMomentCards = getCurrentMomentCards();
  
  // Get completion status for all moments - memoized to prevent recalculation
  const completionStatus = useMemo(() => getAllMomentsCompletionStatus(), [getAllMomentsCompletionStatus]);

  // Get active card for modals
  const activeCard = useMemo(() => 
    activeCardId ? cards.find(c => c.id === activeCardId) : null,
    [activeCardId, cards]
  );

  // Calculate overall progress - memoized to prevent recalculation
  const { totalCards, completedCards, overallProgress } = useMemo(() => {
    const total = cards.length;
    const completed = cards.filter(card => {
      return (
        card.title.trim().length > 0 &&
        card.messageText.trim().length > 0 &&
        card.messageText.length <= 500
      );
    }).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      totalCards: total,
      completedCards: completed,
      overallProgress: progress,
    };
  }, [cards]);

  /**
   * Open edit message modal
   * Requirements: 3.2, 7.5
   */
  const handleEditMessage = useCallback((cardId: string) => {
    setActiveCardId(cardId);
    setActiveModal('message');
  }, []);

  /**
   * Open photo upload modal
   * Requirements: 3.3, 7.5
   */
  const handleEditPhoto = useCallback((cardId: string) => {
    setActiveCardId(cardId);
    setActiveModal('photo');
  }, []);

  /**
   * Open music selection modal
   * Requirements: 3.4, 7.5
   */
  const handleEditMusic = useCallback((cardId: string) => {
    setActiveCardId(cardId);
    setActiveModal('music');
  }, []);

  /**
   * Close all modals
   * Requirements: 7.5
   */
  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
    setActiveCardId(null);
  }, []);

  /**
   * Save message edits
   * Requirements: 4.4, 8.1
   */
  const handleSaveMessage = useCallback(async (cardId: string, data: { title: string; messageText: string }) => {
    await updateCard(cardId, data);
  }, [updateCard]);

  /**
   * Save photo
   * Requirements: 5.5
   */
  const handleSavePhoto = useCallback(async (cardId: string, imageUrl: string) => {
    await updateCard(cardId, { imageUrl });
  }, [updateCard]);

  /**
   * Remove photo
   * Requirements: 5.6
   */
  const handleRemovePhoto = useCallback(async (cardId: string) => {
    await updateCard(cardId, { imageUrl: null });
  }, [updateCard]);

  /**
   * Save music
   * Requirements: 6.4
   */
  const handleSaveMusic = useCallback(async (cardId: string, youtubeUrl: string) => {
    await updateCard(cardId, { youtubeUrl });
  }, [updateCard]);

  /**
   * Remove music
   * Requirements: 6.5
   */
  const handleRemoveMusic = useCallback(async (cardId: string) => {
    await updateCard(cardId, { youtubeUrl: null });
  }, [updateCard]);

  /**
   * Handle finalize and proceed to checkout
   * Requirements: 7.6, 7.7
   */
  const handleFinalize = useCallback(async () => {
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
  }, [canProceedToCheckout, onFinalize, clearLocalStorage]);

  /**
   * Handle clear draft
   */
  const handleClearDraft = useCallback(() => {
    if (confirm('Tem certeza que deseja limpar o rascunho salvo?')) {
      clearLocalStorage();
    }
  }, [clearLocalStorage]);

  // Check if can proceed to checkout
  const canFinalize = canProceedToCheckout();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" role="main">
      {/* Header with Progress */}
      <header 
        className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Title and Progress */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Editar 12 Cartas
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Personalize suas cartas por momentos temáticos
                </p>
              </div>
              
              {/* Overall Progress Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {completedCards} de {totalCards}
                  </div>
                  <div className="text-xs text-gray-500">
                    cartas completas
                  </div>
                </div>
                <Badge
                  variant={overallProgress === 100 ? 'default' : 'secondary'}
                  className={`text-base px-3 py-1 ${
                    overallProgress === 100 ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  {overallProgress}%
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${overallProgress}%` }}
                  role="progressbar"
                  aria-valuenow={overallProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${overallProgress}% completo`}
                />
              </div>
            </div>

            {/* Auto-save Indicator */}
            <div className="flex justify-end">
              <AutoSaveIndicator
                isSaving={isSaving}
                lastSaved={lastSaved}
                onClearDraft={hasUnsavedChanges ? handleClearDraft : undefined}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        role="main"
        aria-label="Editor de cartas"
      >
        <div className="space-y-6 sm:space-y-8">
          {/* Moment Navigation */}
          <MomentNavigation
            moments={moments}
            currentMomentIndex={currentMomentIndex}
            onMomentChange={goToMoment}
            completionStatus={completionStatus}
          />

          {/* Current Moment Title */}
          <div className="text-center">
            <h2 
              className="text-xl sm:text-2xl font-bold text-gray-900"
              id="current-moment-title"
            >
              {THEMATIC_MOMENTS[currentMomentIndex].title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              {THEMATIC_MOMENTS[currentMomentIndex].description}
            </p>
          </div>

          {/* Card Grid */}
          <CardGridView
            cards={currentMomentCards}
            onEditMessage={handleEditMessage}
            onEditPhoto={handleEditPhoto}
          />
        </div>
      </main>

      {/* Footer with Navigation */}
      <footer 
        className="bg-white border-t border-gray-200 sticky bottom-0 z-30 shadow-lg"
        role="contentinfo"
        aria-label="Navegação do editor"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Previous Button */}
            <div className="w-full sm:w-auto order-2 sm:order-1">
              {!isFirstMoment && (
                <Button
                  variant="outline"
                  onClick={previousMoment}
                  disabled={isProcessing || isFinalizingState}
                  className="w-full sm:w-auto"
                  aria-label="Voltar para o momento anterior"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                  Anterior
                </Button>
              )}
            </div>

            {/* Moment Indicator */}
            <div className="text-center order-1 sm:order-2">
              <div 
                className="text-sm font-medium text-gray-900"
                aria-live="polite"
                aria-atomic="true"
              >
                Momento {currentMomentIndex + 1} de {THEMATIC_MOMENTS.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {completionStatus[currentMomentIndex].completedCards} de{' '}
                {completionStatus[currentMomentIndex].totalCards} cartas completas
              </div>
            </div>

            {/* Next/Finalize Button */}
            <div className="w-full sm:w-auto order-3">
              {isLastMoment ? (
                <Button
                  onClick={handleFinalize}
                  disabled={!canFinalize || isProcessing || isFinalizingState}
                  className="w-full sm:w-auto"
                  aria-label={canFinalize ? "Finalizar e ir para o checkout" : "Complete todas as cartas para finalizar"}
                  aria-disabled={!canFinalize}
                >
                  {isFinalizingState ? (
                    <>
                      <span className="animate-spin mr-2" aria-hidden="true">⏳</span>
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" aria-hidden="true" />
                      Finalizar e Comprar
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextMoment}
                  disabled={isProcessing || isFinalizingState}
                  className="w-full sm:w-auto"
                  aria-label="Avançar para o próximo momento"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          {/* Finalize hint */}
          {isLastMoment && !canFinalize && (
            <div 
              className="mt-4 text-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm text-amber-600">
                Complete todas as cartas para finalizar e prosseguir para o checkout
              </p>
            </div>
          )}
        </div>
      </footer>

      {/* Modals */}
      {activeCard && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-gray-900">Carregando...</span>
            </div>
          </div>
        }>
          {/* Edit Message Modal */}
          {activeModal === 'message' && (
            <EditMessageModal
              card={activeCard}
              isOpen={true}
              onClose={handleCloseModal}
              onSave={handleSaveMessage}
            />
          )}

          {/* Photo Upload Modal */}
          {activeModal === 'photo' && (
            <PhotoUploadModal
              card={activeCard}
              isOpen={true}
              onClose={handleCloseModal}
              onSave={handleSavePhoto}
              onRemove={handleRemovePhoto}
            />
          )}

          {/* Music Selection Modal */}
          {activeModal === 'music' && (
            <MusicSelectionModal
              card={activeCard}
              isOpen={true}
              onClose={handleCloseModal}
              onSave={handleSaveMusic}
              onRemove={handleRemoveMusic}
            />
          )}
        </Suspense>
      )}
    </div>
  );
}
