'use client';

import { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Eye, Lock, LockOpen } from 'lucide-react';
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

  const handleOpenCard = (card: Card) => {
    setSelectedCard(card);
    // Mark as opened in preview
    setOpenedCards(prev => new Set(prev).add(card.id));
  };

  const handleCloseCard = () => {
    setSelectedCard(null);
  };

  const PreviewContent = () => {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans p-4"
        style={{
          background: themeColors.backgroundGradient,
          color: themeColors.textColor,
        }}
      >
        {/* Background Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

        {/* Main View: Grid of cards */}
        {!selectedCard && (
          <div className="w-full max-w-6xl mx-auto z-10">
            {/* Title */}
            <div className="text-center mb-6">
              <h1 
                className="text-2xl md:text-3xl font-light mb-1"
                style={{ color: themeColors.textColor }}
              >
                Suas 12 Cartas Especiais
              </h1>
              <p 
                className="text-sm md:text-base font-light"
                style={{ color: themeColors.secondaryTextColor }}
              >
                Visualização em tempo real
              </p>
            </div>

            {/* Cards Grid - 3 columns */}
            <div className="grid grid-cols-3 gap-3">
              {cards.map((card, index) => {
                const isOpened = openedCards.has(card.id);
                
                return (
                  <button
                    key={card.id}
                    onClick={() => handleOpenCard(card)}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-3 text-left group relative overflow-hidden"
                    style={{
                      minHeight: '180px',
                    }}
                  >
                    {/* Card Number Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span 
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: themeColors.accentColor + '40',
                          color: themeColors.accentColor 
                        }}
                      >
                        Carta {card.order}
                      </span>
                      {isOpened && (
                        <LockOpen 
                          className="w-3 h-3"
                          style={{ color: themeColors.accentColor }}
                        />
                      )}
                      {!isOpened && (
                        <Lock 
                          className="w-3 h-3"
                          style={{ color: themeColors.accentColor }}
                        />
                      )}
                    </div>

                    {/* Card Title */}
                    <h3 
                      className="text-xs font-bold mb-2 line-clamp-2 leading-tight"
                      style={{ color: themeColors.textColor }}
                    >
                      {card.title || 'Título da carta'}
                    </h3>

                    {/* Status Badge */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <div 
                        className="flex items-center gap-1 text-[9px] font-medium"
                        style={{ color: themeColors.accentColor }}
                      >
                        {isOpened ? (
                          <>
                            <span className="inline-block w-1 h-1 rounded-full bg-current" />
                            Mensagem
                          </>
                        ) : (
                          <>
                            <span className="inline-block w-1 h-1 rounded-full bg-current" />
                            Mensagem
                          </>
                        )}
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div 
                      className="absolute bottom-2 right-3 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: themeColors.accentColor }}
                    >
                      Abrir carta →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CARD DETAIL VIEW */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={handleCloseCard}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Card Image */}
                {selectedCard.imageUrl && (
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={selectedCard.imageUrl}
                      alt={selectedCard.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-6">
                      <h2 className="text-2xl md:text-3xl font-semibold text-white">
                        {selectedCard.title || 'Título da carta'}
                      </h2>
                    </div>
                  </div>
                )}

                {/* Card Message */}
                <div className="p-8">
                  {!selectedCard.imageUrl && (
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                      {selectedCard.title || 'Título da carta'}
                    </h2>
                  )}
                  
                  <p className="text-xl md:text-2xl leading-relaxed text-gray-800 mb-6 whitespace-pre-wrap">
                    {selectedCard.messageText || 'Sua mensagem aparecerá aqui...'}
                  </p>

                  <Button
                    onClick={handleCloseCard}
                    className="w-full"
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
      </div>
    );
  };

  return (
    <>
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

      {/* Mobile Preview - Floating Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setIsVisible(true)}
          className="rounded-full shadow-2xl h-14 w-14 p-0"
          aria-label="Abrir visualização"
        >
          <Eye className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile Preview - Full Screen Modal */}
      {isVisible && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Visualização</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="min-h-[44px] min-w-[44px]"
                aria-label="Fechar visualização"
              >
                ✕
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

          {/* Preview Content */}
          <div
            className="overflow-auto h-[calc(100vh-120px)]"
            key={updateKey}
          >
            <PreviewContent />
          </div>
        </div>
      )}
    </>
  );
}

// Helper function to extract YouTube video ID
function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}
