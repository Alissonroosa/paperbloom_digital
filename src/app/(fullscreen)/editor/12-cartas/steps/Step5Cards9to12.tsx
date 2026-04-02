'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation } from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { CardGridView } from '@/components/card-editor/CardGridView';
import { Loader2 } from 'lucide-react';

// Lazy load modals for better performance
const EditMessageModal = lazy(() => 
  import('@/components/card-editor/modals/EditMessageModal').then(mod => ({ default: mod.EditMessageModal }))
);
const PhotoUploadModal = lazy(() => 
  import('@/components/card-editor/modals/PhotoUploadModal').then(mod => ({ default: mod.PhotoUploadModal }))
);

type ModalType = 'message' | 'photo' | null;

/**
 * Step 4: Momentos Especiais (Cards 9-12)
 * Edit cards for conflict resolution and fun moments
 * 
 * @see Requirements 4.2, 4.3, 4.4, 4.5, 4.7
 */
export function Step5Cards9to12() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { cards, isSaving, updateCard } = useCardCollectionEditor();

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Cards 9-12 (indices 8-11)
  const momentCards = cards.slice(8, 12);

  // Get the active card for modal editing
  const activeCard = activeCardId ? cards.find(c => c.id === activeCardId) : null;

  // Modal handlers
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

  // Save handlers for modals
  const handleSaveMessage = useCallback(async (cardId: string, data: { title: string; messageText: string }) => {
    await updateCard(cardId, data);
  }, [updateCard]);

  const handleSavePhoto = useCallback(async (cardId: string, imageUrl: string) => {
    await updateCard(cardId, { imageUrl });
  }, [updateCard]);

  const handleRemovePhoto = useCallback(async (cardId: string) => {
    await updateCard(cardId, { imageUrl: null });
  }, [updateCard]);

  const handleNext = () => {
    nextStep();
  };

  const handlePrev = () => {
    prevStep();
  };

  return (
    <FullscreenStep
      emoji="🎁"
      title="Cartas para Momentos Especiais"
      subtitle="Diversão, superação e surpresas"
      showProgress={true}
      showBackLink={false}
      showDemoLink={true}
      demoLinkHref="/demo/card-collection"
    >
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <p className="text-center text-gray-600 text-sm">
          As últimas 4 cartas! Para quando precisar de uma risada, 
          superar um desafio, ou simplesmente ter uma surpresa especial. 🎉
        </p>

        {/* AI Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-700">
            🤖 As mensagens vêm pré-preenchidas com IA, mas recomendamos <span className="font-medium">editar cada carta</span> para adicionar mais sentimento e personalidade! 🎁
          </p>
        </div>

        {/* Photo tip */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📸</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Adicione 1 foto em cada carta!</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Fotos tornam a experiência muito mais emocionante. Clique no botão <span className="font-medium">+ Foto</span> em cada carta para personalizar.
            </p>
          </div>
        </div>

        {/* Card Grid View */}
        <CardGridView
          cards={momentCards}
          onEditMessage={handleEditMessage}
          onEditPhoto={handleEditPhoto}
        />

        <WizardNavigation
          onNext={handleNext}
          onPrev={handlePrev}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={isSaving}
        />
      </div>

      {/* Edit Message Modal */}
      {activeCard && activeModal === 'message' && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        }>
          <EditMessageModal
            card={activeCard}
            isOpen={true}
            onClose={handleCloseModal}
            onSave={handleSaveMessage}
          />
        </Suspense>
      )}

      {/* Photo Upload Modal */}
      {activeCard && activeModal === 'photo' && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        }>
          <PhotoUploadModal
            card={activeCard}
            isOpen={true}
            onClose={handleCloseModal}
            onSave={handleSavePhoto}
            onRemove={handleRemovePhoto}
          />
        </Suspense>
      )}
    </FullscreenStep>
  );
}
