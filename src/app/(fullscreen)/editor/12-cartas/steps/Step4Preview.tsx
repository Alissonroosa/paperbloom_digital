'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight } from 'lucide-react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import {
  useInteractiveWizardNavigation,
} from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { CardCinematicPreviewModal } from '@/components/card-editor/CardCinematicPreviewModal';
import { analytics } from '@/lib/analytics';

const PREVIEW_STEP_INDEX = 3;

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
    analytics.editorBackNavigation('card-collection', PREVIEW_STEP_INDEX + 1, PREVIEW_STEP_INDEX, 'preview_back');
    try { sessionStorage.setItem('pb_suppress_next_back_nav', '1'); } catch { /* ignore */ }
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
        title="Tudo pronto!"
        subtitle={`As cartas pra ${recipientName} estão prontas pra você finalizar`}
        showProgress={true}
        showBackLink={false}
        showPriceBadge={false}
      >
        <div className="w-full max-w-md mx-auto space-y-4">
          {/* CTA primário — finalizar compra. Antes este step só permitia avançar
              depois de abrir a 1ª carta na preview (auto-advance via useEffect), o que
              prendia clientes que não queriam abrir nenhuma carta no preview.
              Agora botão de compra é o caminho principal e a preview vira opcional. */}
          <motion.button
            type="button"
            onClick={nextStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-center shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">💌</span>
              <h3 className="text-xl font-bold text-white">
                Comprar minhas 12 cartas
              </h3>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
            <p className="text-xs text-white/80 mt-2">
              Pagamento único · entrega na hora
            </p>
          </motion.button>

          {/* Separador "ou" */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">ou antes</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* CTA secundário — preview (opcional). Tom: "se quiser ver" em vez de
              "abra a 1ª carta" — evita o medo de "estragar" o presente. */}
          <motion.button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 text-center hover:border-purple-400 hover:shadow-lg transition-all"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Ver como ficou
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mt-1">
                  Pré-visualize sem afetar a experiência de {recipientName} ✨
                </p>
              </div>
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
