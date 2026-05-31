'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Heart, X, ArrowLeft } from 'lucide-react';
import { PriceBadge } from '@/components/interactive-wizard/PriceBadge';
import { Card as CardType } from '@/types/card';

const accent = '#E6C2C2';
const accentDark = '#D4A5A5';
const textMain = '#4A4A4A';
const textSecondary = '#8B5F5F';

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

type ModalStage =
  | 'grid'
  | 'confirm-open'
  | 'envelope'
  | 'detail'
  | 'confirm-close'
  | 'seal'
  | 'locked-info';

export interface CardCinematicPreviewModalProps {
  collection: {
    recipientName: string;
    senderName: string;
    introMessage: string | null;
    coverImageUrl?: string | null;
  };
  cards: CardType[];
  onClose: () => void;
  /** Editor: chamado quando o usuário sela a 1ª carta (pra detectar “já testou”). */
  onCardOpened?: () => void;
  /** Editor: aparece banner "Voltar pra editar" no topo. */
  onBackToEdit?: () => void;
  /**
   * editor: só a 1ª carta é clicável, exibe checkout bar após selar
   * dashboard: todas as cartas são clicáveis, sem checkout bar (usuário já pagou)
   */
  mode?: 'editor' | 'dashboard';
}

/**
 * CardPreviewModal — experiência cinematográfica completa
 * (envelope abre, sparkles, detail view, seal, etc).
 *
 * Usado em dois contextos:
 * 1. Editor: usuário testa a experiência antes de pagar (1 carta liberada).
 * 2. Dashboard: comprador vê a prévia infinita (todas as cartas liberadas, sem seal permanente).
 */
export function CardCinematicPreviewModal({
  collection,
  cards,
  onClose,
  onCardOpened,
  onBackToEdit,
  mode = 'editor',
}: CardCinematicPreviewModalProps) {
  const [stage, setStage] = useState<ModalStage>('grid');
  const [targetCard, setTargetCard] = useState<CardType | null>(null);
  const [hasOpened, setHasOpened] = useState(false);
  const [showCheckoutBar, setShowCheckoutBar] = useState(false);
  const [openedCardIds, setOpenedCardIds] = useState<Set<string>>(new Set());

  const sparklesRef = useRef(
    Array.from({ length: 10 }, () => ({
      left: 15 + Math.random() * 70,
      top: 10 + Math.random() * 80,
      delay: Math.random() * 0.4,
    }))
  );

  const recipientName = collection.recipientName || 'a pessoa';
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);
  const isDashboard = mode === 'dashboard';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage === 'grid') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [stage, onClose]);

  const handleCardClick = (card: CardType) => {
    if (isDashboard) {
      // Dashboard: qualquer carta é clicável e pode ser reaberta
      setTargetCard(card);
      setStage('confirm-open');
      return;
    }
    // Editor: só a 1ª carta uma vez
    if (card.order === 1 && !hasOpened) {
      setTargetCard(card);
      setStage('confirm-open');
    } else if (card.order !== 1) {
      setTargetCard(card);
      setStage('locked-info');
    }
  };

  const handleConfirmOpen = () => {
    setStage('envelope');
    setTimeout(() => setStage('detail'), 3200);
  };

  const handleRequestClose = () => {
    setStage('confirm-close');
  };

  const handleConfirmClose = () => {
    setStage('seal');
    setTimeout(() => {
      setStage('grid');
      const sealedCard = targetCard;
      setTargetCard(null);
      setHasOpened(true);
      if (sealedCard) {
        setOpenedCardIds(prev => {
          const next = new Set(prev);
          next.add(sealedCard.id);
          return next;
        });
      }
      onCardOpened?.();
      if (!isDashboard) {
        setTimeout(() => setShowCheckoutBar(true), 400);
      }
    }, 2800);
  };

  const handleCancelConfirm = () => {
    if (stage === 'confirm-open' || stage === 'locked-info') {
      setStage('grid');
      setTargetCard(null);
    }
    if (stage === 'confirm-close') setStage('detail');
  };

  const bannerTitle = `👀 É assim que ${recipientName} vai ver`;

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

      {/* Top banner */}
      <div
        className="text-white py-2.5 px-3 text-sm font-medium sticky top-0 z-[110] flex items-center justify-between gap-2 shadow-md"
        style={{ backgroundColor: accentDark }}
      >
        {onBackToEdit ? (
          <button
            onClick={onBackToEdit}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-xs font-medium"
            aria-label="Voltar para editar"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Voltar pra editar</span>
            <span className="sm:hidden">Editar</span>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fechar pré-visualização"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <span className="text-xs sm:text-sm text-center flex-1 truncate px-2">
          {bannerTitle}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>

      {/* GRID VIEW */}
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

          {!hasOpened && !isDashboard && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mb-6 max-w-md rounded-2xl border-2 border-dashed px-5 py-4 text-center"
              style={{ borderColor: accent, backgroundColor: accent + '15' }}
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-2xl mb-1"
              >
                👇
              </motion.div>
              <p className="text-base font-semibold" style={{ color: accentDark }}>
                Toque na Carta 1 para experimentar
              </p>
              <p className="text-xs mt-1" style={{ color: textSecondary }}>
                Sinta a emoção que {recipientName} vai sentir
              </p>
            </motion.div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {sortedCards.map((card, index) => {
              const isFirstCard = card.order === 1;
              const isOpenedCard = isDashboard
                ? openedCardIds.has(card.id)
                : isFirstCard && hasOpened;
              const showStartHereBadge = !isDashboard && isFirstCard && !hasOpened;

              return (
                <motion.button
                  key={card.id}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    showStartHereBadge
                      ? {
                          opacity: 1,
                          y: 0,
                          boxShadow: [
                            `0 0 0 0px ${accent}80`,
                            `0 0 0 10px ${accent}00`,
                            `0 0 0 0px ${accent}80`,
                          ],
                        }
                      : { opacity: 1, y: 0 }
                  }
                  transition={
                    showStartHereBadge
                      ? {
                          opacity: { delay: index * 0.05 },
                          y: { delay: index * 0.05 },
                          boxShadow: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                        }
                      : { delay: index * 0.05 }
                  }
                  onClick={() => handleCardClick(card)}
                  className={`
                    aspect-[3/4] relative rounded-2xl overflow-hidden shadow-lg
                    transition-all duration-300 group text-left cursor-pointer
                    ${showStartHereBadge
                      ? 'hover:shadow-2xl hover:scale-[1.03] ring-4'
                      : 'hover:shadow-xl'
                    }
                  `}
                  style={{
                    backgroundColor: 'white',
                    ...(showStartHereBadge
                      ? { ringColor: accent, '--tw-ring-color': accent } as React.CSSProperties
                      : {}),
                  }}
                  aria-label={`Carta ${card.order}: ${card.title}`}
                >
                  {isOpenedCard ? (
                    <div className="absolute inset-0">
                      {(card.imageUrl ?? collection.coverImageUrl) ? (
                        <img
                          src={(card.imageUrl ?? collection.coverImageUrl) as string}
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

                      {showStartHereBadge && (
                        <motion.span
                          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.04, 1] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                          className="mt-3 text-xs font-bold px-3 py-1.5 rounded-full shadow-md"
                          style={{ backgroundColor: accentDark, color: 'white' }}
                        >
                          👉 Toque aqui ✨
                        </motion.span>
                      )}
                    </div>
                  )}

                  {showStartHereBadge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
                      className="absolute top-2 right-2 z-20 px-2 py-1 rounded-full text-[9px] font-bold shadow-md"
                      style={{ backgroundColor: accentDark, color: 'white' }}
                    >
                      COMECE AQUI
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* CONFIRM OPEN */}
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

      {/* ENVELOPE ANIMATION */}
      <AnimatePresence>
        {stage === 'envelope' && targetCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md aspect-[4/3]">
              <motion.div
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{ backgroundColor: accent }}
              >
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-black/10" />
              </motion.div>

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

      {/* CARD DETAIL VIEW */}
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
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl md:max-w-4xl w-full max-h-[92vh] flex flex-col md:flex-row relative"
            >
              <button
                onClick={handleRequestClose}
                className="absolute top-3 right-3 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-1.5 transition-all"
                aria-label="Selar carta"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>

              {(() => {
                const headerImage = targetCard.imageUrl ?? collection.coverImageUrl ?? null;
                return (
                  <div
                    className="relative w-full md:w-2/5 md:flex-shrink-0 aspect-[3/4] md:aspect-auto md:self-stretch max-h-[55vh] md:max-h-none overflow-hidden bg-gray-100"
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
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-6 md:hidden">
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

              <div className="p-6 md:p-8 md:flex-1 md:flex md:flex-col md:justify-center overflow-y-auto">
                <div className="hidden md:block mb-4">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                    style={{ backgroundColor: accent + '30', color: textSecondary }}
                  >
                    Carta {targetCard.order}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-semibold" style={{ color: textMain }}>
                    {targetCard.title}
                  </h2>
                </div>

                <p className="text-lg md:text-xl leading-relaxed text-gray-800 mb-6 whitespace-pre-line">
                  {targetCard.messageText}
                </p>

                <button
                  onClick={handleRequestClose}
                  className="w-full py-3.5 rounded-full font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: accent }}
                >
                  Selar carta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRM CLOSE */}
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
                    className="w-full min-h-[56px] py-4 px-6 rounded-full border-2 font-medium transition-colors hover:bg-gray-50"
                    style={{ borderColor: accent, color: textMain }}
                  >
                    Voltar e ler mais uma vez
                  </button>
                  <button
                    onClick={handleConfirmClose}
                    className="w-full min-h-[56px] py-4 px-6 rounded-full font-medium text-white transition-colors hover:opacity-90"
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

      {/* SEAL ANIMATION */}
      <AnimatePresence>
        {stage === 'seal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[130] flex items-center justify-center p-4"
          >
            <div className="text-center space-y-8">
              <motion.div className="relative w-48 h-36 mx-auto">
                <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: accent }} />

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

      {/* LOCKED INFO (editor only) */}
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

      {/* CHECKOUT BAR (editor only) */}
      <AnimatePresence>
        {showCheckoutBar && !isDashboard && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            className="fixed bottom-0 inset-x-0 z-[110] bg-white/98 backdrop-blur-xl border-t-2 shadow-2xl"
            style={{ borderColor: accent }}
          >
            <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
              <div className="text-center">
                <p className="text-base font-bold" style={{ color: textMain }}>
                  ✨ Gostou? Libere as 11 cartas restantes para <span style={{ color: accentDark }}>{recipientName}</span>!
                </p>
              </div>

              <div className="flex justify-center">
                <PriceBadge productType="card-collection" variant="compact" contextLine="Acesso para sempre" />
              </div>

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

              <div className="flex items-center justify-center gap-3 text-xs" style={{ color: textSecondary }}>
                <span>⭐⭐⭐⭐⭐</span>
                <span>+800 presentes entregues</span>
                <span>·</span>
                <span>🔒 Pagamento seguro</span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 px-6 font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99] transition-all text-sm"
                style={{ backgroundColor: accentDark, color: 'white' }}
              >
                💌 Liberar as 11 cartas para {recipientName.length > 20 ? recipientName.slice(0, 20) + '…' : recipientName}
              </button>

              <p className="text-center text-[11px]" style={{ color: textSecondary }}>
                Entrega instantânea · Sem assinatura · Você decide quando enviar
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className={`relative z-10 border-t border-gray-200/50 ${showCheckoutBar ? 'mb-72' : 'mt-12'}`}>
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm" style={{ color: textSecondary }}>Feito com ❤️ por Paper Bloom Digital</p>
        </div>
      </footer>
    </motion.div>
  );
}
