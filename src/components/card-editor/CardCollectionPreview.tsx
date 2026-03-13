'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Monitor, Smartphone, Eye, Lock, LockOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/types/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export interface CardCollectionPreviewProps {
  cards: Card[];
  introMessage?: string | null;
  senderName?: string;
  recipientName?: string;
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  className?: string;
}

// Theme colors matching the demo
const themeColors = {
  background: '#FFFAFA',
  backgroundGradient: 'linear-gradient(135deg, #FFFAFA 0%, #FFF5F5 50%, #FFE4E4 100%)',
  textColor: '#4A4A4A',
  secondaryTextColor: '#8B5F5F',
  accentColor: '#E6C2C2',
  accentColorDark: '#D4A5A5',
};

/**
 * Displays real-time preview of the card collection in Desktop or Mobile view.
 */
export function CardCollectionPreview({
  cards,
  introMessage,
  senderName,
  recipientName,
  viewMode,
  onViewModeChange,
  className,
}: CardCollectionPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [openedCards, setOpenedCards] = useState<Set<string>>(new Set());
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Trigger re-render when data changes
  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      setUpdateKey(prev => prev + 1);
    }, 100);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [cards, introMessage, senderName, recipientName]);

  // Lock body scroll when mobile preview is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Preview stage state (simulates the real experience stages)
  const [previewStage, setPreviewStage] = useState<'grid' | 'envelope' | 'detail'>('grid');
  const [cardToOpen, setCardToOpen] = useState<Card | null>(null);

  const handleOpenCard = (card: Card) => {
    if (openedCards.has(card.id)) {
      // Already opened, go straight to detail
      setSelectedCard(card);
      setPreviewStage('detail');
    } else {
      // First time: show envelope animation
      setCardToOpen(card);
      setPreviewStage('envelope');

      // After envelope animation, show detail
      setTimeout(() => {
        setOpenedCards(prev => new Set(prev).add(card.id));
        setSelectedCard(card);
        setCardToOpen(null);
        setPreviewStage('detail');
      }, 2500);
    }
  };

  const handleCloseCard = () => {
    setSelectedCard(null);
    setPreviewStage('grid');
  };

  // Get moment label based on card order
  const getMomentLabel = (order: number): string => {
    if (order <= 4) return "Para Momentos Difíceis";
    if (order <= 8) return "Para Momentos de Amor";
    return "Para Momentos Especiais";
  };

  const PreviewContent = () => {
    return (
      <div 
        className="min-h-full flex flex-col items-center relative font-sans"
        style={{
          background: themeColors.backgroundGradient,
          color: themeColors.textColor,
        }}
      >
        {/* Background Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

        {/* Main View: Grid of cards */}
        <div className="w-full max-w-6xl mx-auto z-10 px-3 py-6">
          {/* Title */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-5"
          >
            <h1 
              className="text-xl md:text-2xl font-light mb-1"
              style={{ color: themeColors.textColor }}
            >
              Suas 12 Cartas Especiais
            </h1>
            <p 
              className="text-xs font-light"
              style={{ color: themeColors.secondaryTextColor }}
            >
              {senderName && recipientName 
                ? `De ${senderName} para ${recipientName}`
                : 'Visualização em tempo real'
              }
            </p>
          </motion.div>

          {/* Cards Grid - matching demo layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cards.map((card, index) => {
              const isOpened = openedCards.has(card.id);
              const hasContent = card.title.trim().length > 0 && card.messageText.trim().length > 0;
              
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => handleOpenCard(card)}
                  className="aspect-[3/4] relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
                  style={{
                    backgroundColor: isOpened ? '#f0f0f0' : 'white',
                  }}
                >
                  {isOpened && card.imageUrl ? (
                    // Opened card with image - show image preview like demo
                    <>
                      <Image
                        src={card.imageUrl}
                        alt={card.title}
                        fill
                        className="object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                        <LockOpen className="w-5 h-5 text-white mb-1.5" />
                        <span className="text-[11px] font-medium text-white leading-tight">
                          {card.title || 'Sem título'}
                        </span>
                        <span className="text-[9px] text-white/80 mt-0.5">
                          Aberta
                        </span>
                      </div>
                    </>
                  ) : (
                    // Unopened card - locked state like demo
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-white to-gray-50 group-hover:from-gray-50 group-hover:to-white transition-all">
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: themeColors.accentColor + '20' }}
                      >
                        {isOpened ? (
                          <LockOpen 
                            className="w-4 h-4"
                            style={{ color: themeColors.accentColor }}
                          />
                        ) : (
                          <Lock 
                            className="w-4 h-4"
                            style={{ color: themeColors.accentColor }}
                          />
                        )}
                      </div>
                      <span 
                        className="text-[9px] font-medium mb-1"
                        style={{ color: themeColors.accentColor }}
                      >
                        Carta {card.order}
                      </span>
                      <h3 
                        className="text-[11px] font-medium leading-tight line-clamp-2"
                        style={{ color: themeColors.textColor }}
                      >
                        {card.title || 'Sem título'}
                      </h3>
                      {/* Completion indicator */}
                      {hasContent && (
                        <div className="absolute bottom-2 right-2">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Overlay for card detail and envelope animation - rendered via portal for proper centering
  const PreviewOverlays = () => {
    if (typeof document === 'undefined') return null;

    return createPortal(
      <>
        {/* CARD DETAIL VIEW */}
        <AnimatePresence mode="wait">
          {selectedCard && previewStage === 'detail' && (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
              onClick={handleCloseCard}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg max-h-[85vh] overflow-y-auto"
              >
                {/* Card Image */}
                {selectedCard.imageUrl && (
                  <div className="relative h-48 md:h-64">
                    <Image
                      src={selectedCard.imageUrl}
                      alt={selectedCard.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-5">
                      <span 
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-1.5"
                        style={{ 
                          backgroundColor: themeColors.accentColor + '30',
                          color: themeColors.accentColor 
                        }}
                      >
                        {getMomentLabel(selectedCard.order)}
                      </span>
                      <h2 className="text-xl font-semibold text-white leading-tight">
                        {selectedCard.title || 'Título da carta'}
                      </h2>
                    </div>
                  </div>
                )}

                {/* Card Message */}
                <div className="p-6">
                  {!selectedCard.imageUrl && (
                    <>
                      <span 
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-2"
                        style={{ 
                          backgroundColor: themeColors.accentColor + '30',
                          color: themeColors.accentColor 
                        }}
                      >
                        {getMomentLabel(selectedCard.order)}
                      </span>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                        {selectedCard.title || 'Título da carta'}
                      </h2>
                    </>
                  )}
                  
                  <p className="text-base leading-relaxed text-gray-800 mb-5 whitespace-pre-wrap">
                    {selectedCard.messageText || 'Sua mensagem aparecerá aqui...'}
                  </p>

                  <Button
                    onClick={handleCloseCard}
                    className="w-full rounded-full"
                    size="lg"
                    style={{
                      backgroundColor: themeColors.accentColor,
                      color: 'white'
                    }}
                  >
                    Fechar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ENVELOPE ANIMATION */}
        <AnimatePresence>
          {previewStage === 'envelope' && cardToOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9998] flex items-center justify-center p-6"
            >
              <div className="relative w-full max-w-[240px] aspect-[4/3]">
                {/* Envelope Body */}
                <motion.div
                  className="absolute inset-0 rounded-lg overflow-hidden"
                  style={{ backgroundColor: themeColors.accentColor }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-black/10" />
                </motion.div>

                {/* Envelope Flap (opens) */}
                <motion.div
                  className="absolute top-0 left-0 right-0 origin-top"
                  style={{
                    height: '50%',
                    backgroundColor: themeColors.accentColorDark,
                    clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                  }}
                  animate={{ rotateX: [0, -180] }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
                />

                {/* Card inside envelope (slides up) */}
                <motion.div
                  className="absolute inset-x-4 bottom-4 bg-white rounded-lg shadow-2xl overflow-hidden"
                  style={{ height: '70%' }}
                  initial={{ y: 0 }}
                  animate={{ y: -80 }}
                  transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                >
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                    <Lock className="w-6 h-6 mb-2" style={{ color: themeColors.accentColor }} />
                    <p className="text-sm font-medium leading-tight" style={{ color: themeColors.textColor }}>
                      {cardToOpen.title || 'Carta'}
                    </p>
                  </div>
                </motion.div>

                {/* Sparkle effects */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${15 + Math.random() * 70}%`,
                        top: `${15 + Math.random() * 70}%`,
                      }}
                      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 0.6, delay: 1.2 + i * 0.08 }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>,
      document.body
    );
  };

  return (
    <>
      {/* Overlay portals for card detail and envelope animation */}
      <PreviewOverlays />
      {/* Desktop Preview - Sticky */}
      <div
        className={cn(
          'hidden lg:block',
          className
        )}
      >
        <div className="sticky top-6">
          {/* View Mode Toggle */}
          <div className="mb-4 flex items-center justify-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <Button
              variant={viewMode === 'desktop' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('desktop')}
              className={cn(
                'flex-1 gap-2 transition-all',
                viewMode === 'desktop' && 'shadow-sm'
              )}
              aria-label="Visualização desktop"
              aria-pressed={viewMode === 'desktop'}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden xl:inline">Desktop</span>
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('mobile')}
              className={cn(
                'flex-1 gap-2 transition-all',
                viewMode === 'mobile' && 'shadow-sm'
              )}
              aria-label="Visualização mobile"
              aria-pressed={viewMode === 'mobile'}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden xl:inline">Mobile</span>
            </Button>
          </div>

          {/* Preview Content */}
          <div
            className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-lg"
            key={updateKey}
          >
            {viewMode === 'desktop' ? (
              <div className="relative aspect-[16/10] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
                {/* MacBook Pro Mockup */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Screen */}
                  <div className="relative bg-gray-900 rounded-t-xl shadow-2xl overflow-hidden border-[8px] border-gray-900 w-full" style={{ height: 'calc(100% - 12px)' }}>
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[20px] bg-gray-900 rounded-b-2xl z-30" />
                    
                    {/* Screen Content */}
                    <div className="relative bg-white h-full overflow-hidden">
                      <div className="h-full overflow-auto" style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db #f3f4f6'
                      }}>
                        <PreviewContent />
                      </div>
                    </div>
                    
                    {/* Base/Keyboard */}
                    <div className="absolute bottom-[-8px] left-0 right-0 h-[8px] bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-xl shadow-lg">
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gray-800/20" />
                    </div>
                    
                    {/* Bottom Stand */}
                    <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 h-[2px] w-[50%] bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[9/16] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="relative w-full max-w-[280px] aspect-[9/19.5] bg-black rounded-[2.5rem] shadow-2xl overflow-hidden">
                  {/* iPhone Frame */}
                  <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-gray-900 pointer-events-none z-20" />
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-30" />
                  
                  {/* Screen Content */}
                  <div className="absolute inset-[3px] bg-white rounded-[2.3rem] overflow-hidden">
                    <div className="h-full overflow-auto" style={{ 
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}>
                      <style jsx>{`
                        div::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      <div className="min-h-full" style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}>
                        <PreviewContent />
                      </div>
                    </div>
                  </div>
                  
                  {/* Side Buttons */}
                  <div className="absolute left-[-3px] top-[80px] w-[3px] h-[50px] bg-gray-900 rounded-l-sm" />
                  <div className="absolute left-[-3px] top-[140px] w-[3px] h-[50px] bg-gray-900 rounded-l-sm" />
                  <div className="absolute left-[-3px] top-[200px] w-[3px] h-[60px] bg-gray-900 rounded-l-sm" />
                  <div className="absolute right-[-3px] top-[140px] w-[3px] h-[80px] bg-gray-900 rounded-r-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Preview Label */}
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Visualização em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Preview - Floating Button (Portal to body) */}
      {typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden fixed bottom-6 right-6 z-[90]">
          <Button
            size="lg"
            onClick={() => setIsVisible(true)}
            className="rounded-full shadow-2xl h-14 w-14 p-0 bg-primary hover:bg-primary/90"
            aria-label="Abrir visualização"
          >
            <Eye className="w-6 h-6" />
          </Button>
        </div>,
        document.body
      )}

      {/* Mobile Preview - Full Screen Modal (Portal to body) */}
      {isVisible && typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden fixed inset-0 z-[9999] bg-white flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold flex-1">Visualização</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300"
                aria-label="Fechar visualização"
              >
                <X className="w-5 h-5" />
                <span className="ml-2 hidden sm:inline">Fechar</span>
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="mt-3 flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'desktop' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('desktop')}
                className="flex-1 gap-2 min-h-[44px]"
                aria-label="Visualização desktop"
                aria-pressed={viewMode === 'desktop'}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('mobile')}
                className="flex-1 gap-2 min-h-[44px]"
                aria-label="Visualização mobile"
                aria-pressed={viewMode === 'mobile'}
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </Button>
            </div>
          </div>

          {/* Preview Content - Scrollable area */}
          <div
            className="flex-1 overflow-auto"
            key={updateKey}
          >
            <PreviewContent />
          </div>

          {/* Bottom Close Button - Fixed at bottom for easy access */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsVisible(false)}
              className="w-full min-h-[48px] bg-gray-50 hover:bg-gray-100"
              aria-label="Fechar visualização"
            >
              <X className="w-5 h-5 mr-2" />
              Fechar Visualização
            </Button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
