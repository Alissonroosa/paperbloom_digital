'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import {
  useInteractiveWizardNavigation,
} from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { CardCinematicPreviewModal } from '@/components/card-editor/CardCinematicPreviewModal';

/**
 * Step 4 — Preview only (no form/checkout).
 * Modal abre automaticamente ao entrar no step.
 * Auto-avança para o checkout após fechar o preview (se o usuário abriu alguma carta).
 */
export function Step4Preview() {
  const { nextStep, prevStep } = useInteractiveWizardNavigation();
  const { collection, cards } = useCardCollectionEditor();

  const [showPreviewModal, setShowPreviewModal] = useState(true);
  const [hasOpenedPreview, setHasOpenedPreview] = useState(false);
  const hasAutoAdvanced = useRef(false);

  const recipientName = collection?.recipientName?.trim() || 'a pessoa';

  const handleClosePreview = () => {
    setShowPreviewModal(false);
  };

  const handleBackToEdit = () => {
    setShowPreviewModal(false);
    setTimeout(() => prevStep(), 150);
  };

  const handleCardOpened = () => {
    setHasOpenedPreview(true);
  };

  useEffect(() => {
    if (hasOpenedPreview && !showPreviewModal && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      const timer = setTimeout(() => nextStep(), 400);
      return () => clearTimeout(timer);
    }
  }, [hasOpenedPreview, showPreviewModal, nextStep]);

  return (
    <>
      <FullscreenStep
        emoji="👀"
        title="Pré-visualização"
        subtitle={`É assim que ${recipientName} vai receber o presente`}
        showProgress={true}
        showBackLink={false}
        showPriceBadge={false}
      >
        <div className="w-full max-w-md mx-auto space-y-6">
          <motion.button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 text-center hover:border-purple-400 hover:shadow-xl transition-all"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Ver como ficou
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Abra a 1ª carta e sinta a emoção ✨
              </p>
            </div>
          </motion.button>

          <WizardNavigation
            onPrev={prevStep}
            prevLabel="← Voltar para editar"
            hideNext={true}
          />
        </div>
      </FullscreenStep>

      <AnimatePresence>
        {showPreviewModal && collection && (
          <CardCinematicPreviewModal
            collection={{
              recipientName: collection.recipientName,
              senderName: collection.senderName,
              introMessage: collection.introMessage,
              coverImageUrl: collection.coverImageUrl,
            }}
            cards={cards}
            onClose={handleClosePreview}
            onCardOpened={handleCardOpened}
            onBackToEdit={handleBackToEdit}
            mode="editor"
          />
        )}
      </AnimatePresence>
    </>
  );
}
