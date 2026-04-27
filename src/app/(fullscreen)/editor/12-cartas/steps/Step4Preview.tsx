'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Heart, X, ArrowLeft, Eye } from 'lucide-react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import {
  useInteractiveWizardNavigation,
  useInteractiveWizardValidation,
  useInteractiveWizardAutoSave,
} from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { PriceBadge } from '@/components/interactive-wizard/PriceBadge';
import { analytics } from '@/lib/analytics';
import { Card as CardType } from '@/types/card';

// ─────────────────────────────────────────────────────────────────────────────
// Theme colors — matching the demo
// ─────────────────────────────────────────────────────────────────────────────
const accent = '#E6C2C2';
const accentDark = '#D4A5A5';
const textMain = '#4A4A4A';
const textSecondary = '#8B5F5F';

// ─────────────────────────────────────────────────────────────────────────────
// Gradient fallback backgrounds for cards without images
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
  'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
  'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
  'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
  'linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%)',
  'linear-gradient(135deg, #e1f5fe 0%, #81d4fa 100%)',
  'linear-gradient(135deg, #fce4ec 0%, #ef9a9a 100%)',
  'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
  'linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)',
  'linear-gradient(135deg, #ede7f6 0%, #b39ddb 100%)',
  'linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)',
  'linear-gradient(135deg, #fbe9e7 0%, #ffab91 100%)',
];

// ─────────────────────────────────────────────────────────────────────────────
// Fullscreen Preview Modal — replicates the real /cartas/[slug] page
// with demo-matching animations (envelope open, sparkles, seal)
// ─────────────────────────────────────────────────────────────────────────────

type ModalStage =
  | 'grid'            // card grid view
  | 'confirm-open'    // "Abrir esta carta?" popup
  | 'envelope'        // envelope flap opens, card slides up
  | 'detail'          // card content detail view
  | 'confirm-close'   // "Fechar esta carta?" popup
  | 'seal'            // envelope closes, wax seal stamps on
  | 'locked-info';    // popup for locked cards (2-12)

interface PreviewModalProps {
  collection: {
    recipientName: string;
    senderName: string;
    introMessage: string | null;
    coverImageUrl?: string | null;
  };
  cards: CardType[];
  onClose: () => void;
  onCardOpened: () => void;
}

function PreviewModal({ collection, cards, onClose, onCardOpened }: PreviewModalProps) {
  const [stage, setStage] = useState<ModalStage>('grid');
  const [targetCard, setTargetCard] = useState<CardType | null>(null);
  const [hasOpened, setHasOpened] = useState(false);
  const [showCheckoutBar, setShowCheckoutBar] = useState(false);

  // Sparkle positions — generated once so they don't shift on re-render
  const sparklesRef = useRef(
    Array.from({ length: 10 }, () => ({
      left: 15 + Math.random() * 70,
      top: 10 + Math.random() * 80,
      delay: Math.random() * 0.4,
    }))
  );

  const recipientName = collection.recipientName || 'a pessoa';
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Escape key closes modal (only from grid)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage === 'grid') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [stage, onClose]);

  // ── Flow handlers ──────────────────────────────────────────────────────

  /** Step 1 — user taps card 1 → show confirmation popup; other cards → locked info */
  const handleCardClick = (card: CardType) => {
    if (card.order === 1 && !hasOpened) {
      setTargetCard(card);
      setStage('confirm-open');
    } else if (card.order !== 1) {
      setTargetCard(card);
      setStage('locked-info');
    }
  };

  /** Step 2 — user confirms open → play envelope animation → detail */
  const handleConfirmOpen = () => {
    setStage('envelope');
    // After envelope animation finishes, show detail view
    setTimeout(() => setStage('detail'), 3200);
  };

  /** Step 3 — user clicks close on detail → show close confirmation */
  const handleRequestClose = () => {
    setStage('confirm-close');
  };

  /** Step 4 — user confirms close → play seal animation → back to grid */
  const handleConfirmClose = () => {
    setStage('seal');
    setTimeout(() => {
      setStage('grid');
      setTargetCard(null);
      setHasOpened(true);
      onCardOpened();
      setTimeout(() => setShowCheckoutBar(true), 400);
    }, 2800);
  };

  /** Cancel any confirmation → go back */
  const handleCancelConfirm = () => {
    if (stage === 'confirm-open' || stage === 'locked-info') {
      setStage('grid');
      setTargetCard(null);
    }
    if (stage === 'confirm-close') setStage('detail');
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #FFFAFA 0%, #FFF5F5 50%, #FFE4E4 100%)' }}
    >
      {/* Paper texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      {/* Preview banner */}
      <div
        className="text-white text-center py-2.5 px-4 text-sm font-medium sticky top-0 z-[110] flex items-center justify-center gap-3 shadow-md"
        style={{ backgroundColor: accentDark }}
      >
        <button
          onClick={onClose}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fechar pré-visualização"
        >
          <ArrowLeft size={18} />
        </button>
        <span>👀 Pré-visualização — é assim que {recipientName} vai ver</span>
        <button
          onClick={onClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── GRID VIEW ─────────────────────────────────────────────────── */}
      {stage === 'grid' && (
        <div className="w-full max-w-6xl mx-auto px-4 py-8 relative z-10">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-light mb-2" style={{ color: textMain }}>
              Suas 12 Cartas Especiais
            </h1>

            {collection.introMessage && (
              <div className="my-4 px-4 max-w-2xl mx-auto">
                <p
                  className="text-base md:text-lg font-light italic leading-relaxed"
                  style={{ color: textMain, opacity: 0.9 }}
                >
                  &ldquo;{collection.introMessage}&rdquo;
                </p>
              </div>
            )}

            <p className="text-lg md:text-xl font-light" style={{ color: textSecondary }}>
              Cada carta só pode ser aberta uma vez. Escolha o momento certo.
            </p>
          </motion.div>

          {/* Card grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {sortedCards.map((card, index) => {
              const isFirstCard = card.order === 1;
              const isClickable = isFirstCard && !hasOpened;
              const isOpenedCard = isFirstCard && hasOpened;

              return (
                <motion.button
                  key={card.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCardClick(card)}
                  disabled={isOpenedCard}
                  className={`
                    aspect-[3/4] relative rounded-2xl overflow-hidden shadow-lg
                    transition-all duration-300 group text-left
                    ${isClickable
                      ? 'hover:shadow-2xl hover:scale-[1.03] cursor-pointer ring-2 ring-offset-2'
                      : isOpenedCard
                        ? 'cursor-default'
                        : 'cursor-pointer hover:shadow-xl'
                    }
                  `}
                  style={{
                    backgroundColor: 'white',
                    ...(isClickable ? { ringColor: accent, '--tw-ring-color': accent, '--tw-ring-offset-color': '#FFFAFA' } as React.CSSProperties : {}),
                  }}
                  aria-label={
                    isClickable
                      ? `Abrir carta ${card.order}: ${card.title}`
                      : `Carta ${card.order}: ${card.title}`
                  }
                >
                  {isOpenedCard ? (
                    /* Opened card — show cover image as background like the demo */
                    <div className="absolute inset-0">
                      {collection.coverImageUrl ? (
                        <img
                          src={collection.coverImageUrl}
                          alt={card.title}
                          className="w-full h-full object-cover opacity-70"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: FALLBACK_GRADIENTS[(card.order - 1) % FALLBACK_GRADIENTS.length], opacity: 0.7 }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <Unlock className="w-8 h-8 text-white mb-2" aria-hidden="true" />
                        <span className="text-sm font-medium text-white line-clamp-2">{card.title}</span>
                        <span className="text-xs text-white/80 mt-1">Aberta</span>
                      </div>
                    </div>
                  ) : (
                    /* Unopened card — demo style */
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-white to-gray-50 group-hover:from-gray-50 group-hover:to-white transition-all">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: accent + '20' }}
                      >
                        <Lock className="w-6 h-6" style={{ color: accent }} aria-hidden="true" />
                      </div>
                      <span className="text-xs font-medium mb-2" style={{ color: accent }}>
                        Carta {card.order}
                      </span>
                      <h3
                        className="text-sm md:text-base font-medium leading-tight"
                        style={{ color: textMain }}
                      >
                        {card.title}
                      </h3>

                      {/* Pulsing "Toque para abrir" label on card 1 */}
                      {isClickable && (
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="mt-3 text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ backgroundColor: accent + '30', color: accentDark }}
                        >
                          Toque para abrir ✨
                        </motion.span>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {!hasOpened && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm font-medium"
              style={{ color: textSecondary }}
            >
              👆 Toque na <strong>Carta 1</strong> para experimentar como {recipientName} vai ver
            </motion.p>
          )}
        </div>
      )}

      {/* ── CONFIRMATION POPUP — "Abrir esta carta?" ──────────────────── */}
      <AnimatePresence>
        {stage === 'confirm-open' && targetCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
            onClick={handleCancelConfirm}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-6"
                >
                  <div
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accent + '20' }}
                  >
                    <Lock className="w-10 h-10" style={{ color: accent }} />
                  </div>
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ color: textMain }}>
                  Abrir esta carta?
                </h2>
                <p className="text-lg mb-2 font-medium" style={{ color: textSecondary }}>
                  {targetCard.title}
                </p>
                <p className="text-base mb-8" style={{ color: textSecondary }}>
                  Esta carta só pode ser aberta uma vez.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCancelConfirm}
                    className="flex-1 py-3 px-6 rounded-full border-2 font-medium transition-colors hover:bg-gray-50"
                    style={{ borderColor: accent, color: textMain }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmOpen}
                    className="flex-1 py-3 px-6 rounded-full font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: accent }}
                  >
                    Sim, abrir carta
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ENVELOPE ANIMATION ────────────────────────────────────────── */}
      <AnimatePresence>
        {stage === 'envelope' && targetCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md aspect-[4/3]">
              {/* Envelope body */}
              <motion.div
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{ backgroundColor: accent }}
              >
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-black/10" />
              </motion.div>

              {/* Envelope flap (opens with rotateX) */}
              <motion.div
                className="absolute top-0 left-0 right-0 origin-top"
                style={{
                  height: '50%',
                  backgroundColor: accentDark,
                  clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                }}
                animate={{ rotateX: [0, -180] }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
              />

              {/* Sparkle effects */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, delay: 1.5 }}
              >
                {sparklesRef.current.map((s, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{ left: `${s.left}%`, top: `${s.top}%` }}
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, delay: 1.5 + s.delay }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CARD DETAIL VIEW (inline, no CardModal) ───────────────────── */}
      <AnimatePresence>
        {stage === 'detail' && targetCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              {/* Close X button */}
              <button
                onClick={handleRequestClose}
                className="absolute top-3 right-3 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 transition-all"
                aria-label="Fechar carta"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>

              {/* Image / fallback header — always shows, uses coverImageUrl as background */}
              {(() => {
                const headerImage = targetCard.imageUrl ?? collection.coverImageUrl ?? null;
                return (
                  <div
                    className="relative h-56 overflow-hidden"
                    style={{
                      background: headerImage
                        ? undefined
                        : FALLBACK_GRADIENTS[(targetCard.order - 1) % FALLBACK_GRADIENTS.length],
                    }}
                  >
                    {headerImage && (
                      <img
                        src={headerImage}
                        alt={targetCard.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails, hide it and show gradient fallback
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-6">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                        style={{ backgroundColor: accent + '30', color: 'white' }}
                      >
                        Carta {targetCard.order}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-semibold text-white drop-shadow-md">
                        {targetCard.title}
                      </h2>
                    </div>
                  </div>
                );
              })()}

              {/* Message text */}
              <div className="p-8">
                <p className="text-xl md:text-2xl leading-relaxed text-gray-800 mb-6 whitespace-pre-line">
                  {targetCard.messageText}
                </p>

                <button
                  onClick={handleRequestClose}
                  className="w-full py-3.5 rounded-full font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: accent }}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CLOSE CONFIRMATION — "Fechar esta carta?" ─────────────────── */}
      <AnimatePresence>
        {stage === 'confirm-close' && targetCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4"
            onClick={handleCancelConfirm}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                  className="text-5xl"
                >
                  💌
                </motion.div>

                <h3 className="text-xl font-semibold" style={{ color: textMain }}>
                  Fechar esta carta?
                </h3>

                <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                  Ao fechar, será <strong>selada para sempre</strong>.
                </p>

                <p className="text-sm italic" style={{ color: textSecondary, opacity: 0.8 }}>
                  Certifique-se de que leu tudo e sentiu cada palavra.
                </p>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={handleCancelConfirm}
                    className="w-full py-3 rounded-full border-2 font-medium transition-colors hover:bg-gray-50"
                    style={{ borderColor: accent, color: textMain }}
                  >
                    Voltar e ler mais uma vez
                  </button>
                  <button
                    onClick={handleConfirmClose}
                    className="w-full py-3 rounded-full font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: accent }}
                  >
                    Já li, pode selar 💝
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEAL ANIMATION ────────────────────────────────────────────── */}
      <AnimatePresence>
        {stage === 'seal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[130] flex items-center justify-center p-4"
          >
            <div className="text-center space-y-8">
              {/* Envelope closing + wax seal */}
              <motion.div className="relative w-48 h-36 mx-auto">
                {/* Envelope body */}
                <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: accent }} />

                {/* Flap closing (rotateX from open → closed) */}
                <motion.div
                  className="absolute top-0 left-0 right-0 origin-top"
                  style={{
                    height: '50%',
                    backgroundColor: accentDark,
                    clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                  }}
                  initial={{ rotateX: -180 }}
                  animate={{ rotateX: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
                />

                {/* Red wax seal with heart */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-10"
                  style={{ backgroundColor: '#c0392b' }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <Heart className="w-7 h-7 text-white fill-white" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="space-y-2"
              >
                <p className="text-white text-xl font-light">Carta selada</p>
                <p className="text-white/60 text-sm">Este momento ficará guardado para sempre ✨</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LOCKED CARD INFO POPUP ─────────────────────────────────── */}
      <AnimatePresence>
        {stage === 'locked-info' && targetCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
            onClick={handleCancelConfirm}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                >
                  <div
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accent + '20' }}
                  >
                    <Lock className="w-10 h-10" style={{ color: accent }} />
                  </div>
                </motion.div>

                <h3 className="text-xl font-semibold" style={{ color: textMain }}>
                  Carta bloqueada
                </h3>

                <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                  Na pré-visualização, apenas a <strong>Carta 1</strong> está liberada para você experimentar a experiência completa.
                </p>

                <p className="text-sm" style={{ color: textSecondary, opacity: 0.8 }}>
                  Após o pagamento, {recipientName} poderá abrir todas as 12 cartas. 💌
                </p>

                <button
                  onClick={handleCancelConfirm}
                  className="w-full py-3 rounded-full font-medium text-white transition-colors hover:opacity-90 mt-2"
                  style={{ backgroundColor: accent }}
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM CHECKOUT BAR ───────────────────────────────────────── */}
      <AnimatePresence>
        {showCheckoutBar && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            className="fixed bottom-0 inset-x-0 z-[110] bg-white/98 backdrop-blur-xl border-t-2 shadow-2xl"
            style={{ borderColor: accent }}
          >
            <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">

              {/* Headline */}
              <div className="text-center">
                <p className="text-base font-bold" style={{ color: textMain }}>
                  ✨ Gostou? Libere as 11 cartas restantes para <span style={{ color: accentDark }}>{recipientName}</span>!
                </p>
              </div>

              {/* Price badge */}
              <div className="flex justify-center">
                <PriceBadge productType="card-collection" variant="compact" contextLine="Acesso para sempre" />
              </div>

              {/* How it works — 3 bullets */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <div className="text-xl">📩</div>
                  <p className="text-xs font-medium" style={{ color: textMain }}>Você recebe o link</p>
                  <p className="text-[11px]" style={{ color: textSecondary }}>no seu email, na hora</p>
                </div>
                <div className="space-y-1">
                  <div className="text-xl">🎁</div>
                  <p className="text-xs font-medium" style={{ color: textMain }}>Você decide quando enviar</p>
                  <p className="text-[11px]" style={{ color: textSecondary }}>{recipientName} não recebe nada agora</p>
                </div>
                <div className="space-y-1">
                  <div className="text-xl">💌</div>
                  <p className="text-xs font-medium" style={{ color: textMain }}>12 cartas desbloqueadas</p>
                  <p className="text-[11px]" style={{ color: textSecondary }}>acesso para sempre</p>
                </div>
              </div>

              {/* Social proof + urgency */}
              <div className="flex items-center justify-center gap-3 text-xs" style={{ color: textSecondary }}>
                <span>⭐⭐⭐⭐⭐</span>
                <span>+800 presentes entregues</span>
                <span>·</span>
                <span>🔒 Pagamento seguro</span>
              </div>

              {/* CTA button */}
              <button
                onClick={onClose}
                className="w-full py-4 px-6 font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition-all text-sm"
                style={{ backgroundColor: accentDark, color: 'white' }}
              >
                💌 Presentear {recipientName.length > 20 ? recipientName.slice(0, 20) + '…' : recipientName} agora
              </button>

              <p className="text-center text-[11px]" style={{ color: textSecondary }}>
                Entrega instantânea · Sem assinatura · Cancele quando quiser
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`relative z-10 border-t border-gray-200/50 ${showCheckoutBar ? 'mb-72' : 'mt-12'}`}>
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm" style={{ color: textSecondary }}>Feito com ❤️ por Paper Bloom Digital</p>
        </div>
      </footer>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Preview + Checkout
// ─────────────────────────────────────────────────────────────────────────────

export function Step4Preview() {
  const { prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { clearDraft } = useInteractiveWizardAutoSave();
  const {
    collection,
    cards,
    updateCollection,
    canProceedToCheckout,
    clearLocalStorage,
    isSaving,
  } = useCardCollectionEditor();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [hasOpenedPreview, setHasOpenedPreview] = useState(false);
  const checkoutRef = useRef<HTMLDivElement>(null);

  const recipientName = collection?.recipientName?.trim() || 'a pessoa';
  const senderName = collection?.senderName?.trim() || 'Alguém especial';
  const truncatedName = recipientName.length > 30 ? recipientName.slice(0, 30) + '…' : recipientName;

  useEffect(() => {
    if (collection) {
      setContactName(collection.contactName || '');
      setContactEmail(collection.contactEmail || '');
    }
  }, [collection]);

  // Scroll to checkout after closing preview modal
  useEffect(() => {
    if (hasOpenedPreview && !showPreviewModal && checkoutRef.current) {
      setTimeout(() => {
        checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [hasOpenedPreview, showPreviewModal]);

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!contactName.trim()) {
      newErrors.contactName = 'Nome é obrigatório';
    } else if (contactName.length > 100) {
      newErrors.contactName = 'Nome deve ter no máximo 100 caracteres';
    }
    if (!contactEmail.trim()) {
      newErrors.contactEmail = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.contactEmail = 'Email inválido';
    }
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation(3, { isValid, errors: newErrors });
    return isValid;
  };

  useEffect(() => {
    if (contactName || contactEmail) validateFields();
  }, [contactName, contactEmail]);

  const handleClosePreview = () => {
    setShowPreviewModal(false);
  };

  const handleCardOpened = () => {
    setHasOpenedPreview(true);
  };

  const handleFinalize = async () => {
    if (!validateFields() || !collection) return;

    analytics.completeEditor('card-collection');
    analytics.initiatePayment('card-collection', collection.id);
    setIsCheckingOut(true);

    try {
      await updateCollection(collection.id, {
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
      });

      const response = await fetch('/api/checkout/card-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: collection.id }),
      });

      if (!response.ok) throw new Error('Falha ao criar checkout');

      const { url } = await response.json();
      clearLocalStorage();
      clearDraft();
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create checkout:', err);
      analytics.error('checkout_error', 'Falha ao criar checkout', {
        productType: 'card-collection',
        collectionId: collection.id,
      });
      alert('Erro ao processar pagamento. Tente novamente.');
      setIsCheckingOut(false);
    }
  };

  const canCheckout =
    !errors.contactName &&
    !errors.contactEmail &&
    !!contactName.trim() &&
    !!contactEmail.trim() &&
    canProceedToCheckout();

  return (
    <>
      <FullscreenStep
        emoji="✨"
        title={`Quase lá!`}
        subtitle={`Veja como ${recipientName} vai receber o presente`}
        showProgress={true}
        showBackLink={false}
        showPriceBadge={false}
      >
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Preview CTA */}
          <motion.button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 text-center hover:border-purple-400 hover:shadow-lg transition-all"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <Eye className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {hasOpenedPreview ? 'Ver novamente' : 'Ver como vai ficar'}
              </h3>
              <p className="text-sm text-gray-600">
                Experiência completa — idêntica ao que {recipientName} vai receber
              </p>
              {!hasOpenedPreview && (
                <p className="text-xs text-purple-600 font-medium">
                  Abra a 1ª carta e sinta a emoção ✨
                </p>
              )}
            </div>
          </motion.button>

          {hasOpenedPreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
            >
              <p className="text-sm text-green-800 font-medium">
                ✅ Agora libere as 11 cartas restantes para {recipientName}!
              </p>
            </motion.div>
          )}

          {/* Checkout form */}
          <div ref={checkoutRef} className="space-y-4 border-t border-gray-200 pt-5">
            <div className="space-y-2">
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                👤 Seu nome completo
              </label>
              <input
                id="contactName"
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Ex: João da Silva"
                maxLength={100}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                  errors.contactName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
                }`}
              />
              {errors.contactName && <p className="text-sm text-red-600">{errors.contactName}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                📩 Seu email (você recebe o acesso aqui)
              </label>
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                  errors.contactEmail ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
                }`}
              />
              {errors.contactEmail && <p className="text-sm text-red-600">{errors.contactEmail}</p>}
              <p className="text-xs text-gray-500">
                Você gerencia tudo pelo painel. {recipientName} só recebe quando você decidir.
              </p>
            </div>

            {/* How it works + trust bullets */}
            <div className="rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="px-5 pt-4 pb-2 border-b border-gray-100">
                <h3 className="font-semibold text-sm text-center text-gray-800">
                  ✨ Presente para {recipientName}
                </h3>
                <p className="text-xs text-center text-gray-500 mt-0.5">
                  De: {senderName}, com carinho
                </p>
              </div>

              {/* 3 bullets — como funciona */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
                <div className="px-3 py-4 space-y-1.5">
                  <div className="text-2xl">📩</div>
                  <p className="text-xs font-semibold text-gray-700">Você recebe o link</p>
                  <p className="text-[11px] text-gray-500 leading-tight">no seu email, na hora</p>
                </div>
                <div className="px-3 py-4 space-y-1.5">
                  <div className="text-2xl">🎁</div>
                  <p className="text-xs font-semibold text-gray-700">Você decide quando enviar</p>
                  <p className="text-[11px] text-gray-500 leading-tight">{recipientName} não recebe nada agora</p>
                </div>
                <div className="px-3 py-4 space-y-1.5">
                  <div className="text-2xl">💌</div>
                  <p className="text-xs font-semibold text-gray-700">12 cartas desbloqueadas</p>
                  <p className="text-[11px] text-gray-500 leading-tight">acesso para sempre</p>
                </div>
              </div>

              {/* Social proof */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500">
                <span>⭐⭐⭐⭐⭐</span>
                <span>+800 presentes entregues</span>
                <span>·</span>
                <span>🔒 Pagamento seguro</span>
              </div>

              {/* Price */}
              <div className="px-5 py-3 border-t border-gray-100 flex justify-center">
                <PriceBadge productType="card-collection" variant="compact" contextLine="Acesso para sempre" />
              </div>
            </div>

            {!canProceedToCheckout() && (
              <p className="text-sm text-amber-600 text-center bg-amber-50 p-3 rounded-lg">
                ⚠️ Complete todas as cartas antes de finalizar
              </p>
            )}

            <WizardNavigation
              onPrev={prevStep}
              onFinalize={handleFinalize}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              isLoading={isSaving || isCheckingOut}
              canProceed={canCheckout}
              finalizeLabel={`💌 Presentear ${truncatedName} agora`}
            />
          </div>
        </div>
      </FullscreenStep>

      {/* Fullscreen preview modal */}
      <AnimatePresence>
        {showPreviewModal && collection && (
          <PreviewModal
            collection={{
              recipientName: collection.recipientName,
              senderName: collection.senderName,
              introMessage: collection.introMessage,
              coverImageUrl: collection.coverImageUrl,
            }}
            cards={cards}
            onClose={handleClosePreview}
            onCardOpened={handleCardOpened}
          />
        )}
      </AnimatePresence>
    </>
  );
}
