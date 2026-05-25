'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation } from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { CardGridView } from '@/components/card-editor/CardGridView';
import { Loader2, ChevronDown } from 'lucide-react';

const EditMessageModal = lazy(() =>
  import('@/components/card-editor/modals/EditMessageModal').then(mod => ({ default: mod.EditMessageModal }))
);
const PhotoUploadModal = lazy(() =>
  import('@/components/card-editor/modals/PhotoUploadModal').then(mod => ({ default: mod.PhotoUploadModal }))
);

type ModalType = 'message' | 'photo' | null;

const CARD_GROUPS = [
  { emoji: '💔', label: 'Para os momentos difíceis', range: '1-4', start: 0, end: 4 },
  { emoji: '💝', label: 'Para os momentos de amor', range: '5-8', start: 4, end: 8 },
  { emoji: '🎁', label: 'Para os momentos especiais', range: '9-12', start: 8, end: 12 },
] as const;

export function Step3AllCards() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { cards, collection, isSaving, updateCard } = useCardCollectionEditor();
  const recipientName = collection?.recipientName?.trim() || 'a pessoa';

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const activeCard = activeCardId ? cards.find(c => c.id === activeCardId) : null;

  const toggleGroup = (range: string) => {
    setExpandedGroup(prev => (prev === range ? null : range));
  };

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

  return (
    <FullscreenStep
      emoji="💌"
      title={`As 12 cartas de ${recipientName}`}
      subtitle="Toque em um grupo para ver e personalizar as cartas — ou siga direto"
      showProgress={true}
      showBackLink={false}
      showPriceBadge={false}
    >
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center space-y-1">
          <p className="text-sm text-purple-800 font-medium">
            ✨ Já preparamos as 12 cartas com IA
          </p>
          <p className="text-xs text-purple-700">
            Personalize se quiser, ou siga direto para o checkout.
          </p>
        </div>

        {CARD_GROUPS.map(group => {
          const groupCards = cards.slice(group.start, group.end);
          if (groupCards.length === 0) return null;
          const isExpanded = expandedGroup === group.range;
          const editedCount = groupCards.filter(c => c.imageUrl).length;

          return (
            <section key={group.range}>
              <button
                type="button"
                onClick={() => toggleGroup(group.range)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                  isExpanded
                    ? 'border-purple-300 bg-purple-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{group.emoji}</span>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {group.label}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Cartas {group.range}
                      {editedCount > 0 && (
                        <span className="text-purple-600 ml-1">· {editedCount} com foto</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-600 font-medium">
                    {isExpanded ? 'Fechar' : 'Ver cartas'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-purple-500 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-1">
                      <CardGridView
                        cards={groupCards}
                        onEditMessage={handleEditMessage}
                        onEditPhoto={handleEditPhoto}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}

        <WizardNavigation
          onNext={nextStep}
          onPrev={prevStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={isSaving}
        />
      </div>

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
