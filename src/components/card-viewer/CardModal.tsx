'use client';

import { useEffect, useState } from 'react';
import { Card as CardType } from '@/types/card';
import { X, Heart, Music, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { YouTubePlayer } from '@/components/media/YouTubePlayer';
import { FallingEmojis } from '@/components/effects/FallingEmojis';

interface CardModalProps {
  card: CardType;
  isFirstOpen: boolean;
  onClose: () => void;
}

/**
 * CardModal Component
 * Displays the full content of an opened card
 * 
 * Features:
 * - Full card content display
 * - Photo display (if available)
 * - Automatic music playback (if available)
 * - Special animation on first opening
 * - Falling emojis effect
 * - Responsive design
 * 
 * Requirements: 5.5, 5.6, 5.7
 */
export function CardModal({ card, isFirstOpen, onClose }: CardModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  /**
   * Handle initial animation
   * Requirement: 5.7 - Special animation on first opening
   */
  useEffect(() => {
    if (isFirstOpen) {
      // Show falling emojis effect
      setShowEmojis(true);
      
      // Delay content reveal for dramatic effect
      const contentTimer = setTimeout(() => {
        setShowContent(true);
      }, 800);

      // Stop emojis after animation
      const emojiTimer = setTimeout(() => {
        setShowEmojis(false);
      }, 8000);

      return () => {
        clearTimeout(contentTimer);
        clearTimeout(emojiTimer);
      };
    } else {
      // Show content immediately if not first open
      setShowContent(true);
    }
  }, [isFirstOpen]);

  /**
   * Handle escape key to close modal
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  /**
   * Prevent body scroll when modal is open
   */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  /**
   * Extract emoji from card title for falling effect
   */
  const getEmojiFromTitle = (): string => {
    // Extract emoji from message text or use default heart
    // Using a simpler regex that works with ES5+
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uD83C-\uD83E][\uDC00-\uDFFF]/;
    const emojiMatch = card.messageText.match(emojiRegex);
    return emojiMatch ? emojiMatch[0] : '❤️';
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      onClick={onClose}
    >
      {/* Falling Emojis Effect - Requirement: 5.7 */}
      {showEmojis && (
        <FallingEmojis emoji={getEmojiFromTitle()} count={20} />
      )}

      {/* Modal Content */}
      <div
        className={`
          relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full 
          ${isFirstOpen && !showContent ? 'animate-in zoom-in duration-700' : 'animate-in fade-in zoom-in duration-300'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
          aria-label="Fechar carta"
        >
          <X className="w-6 h-6 text-gray-700" aria-hidden="true" />
        </button>

        {/* Card Header */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 rounded-t-3xl">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8" aria-hidden="true" />
            </div>
          </div>
          <h2 
            id="card-modal-title"
            className="text-3xl font-bold text-center mb-2"
          >
            Carta {card.order}
          </h2>
          <p className="text-xl text-center text-white/90">
            {card.title}
          </p>
        </div>

        {/* Card Content - Requirement: 5.5 */}
        <div className={`
          p-8 space-y-6
          ${isFirstOpen && !showContent ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}
        `}>
          {/* Photo Display - Requirement: 5.6 */}
          {card.imageUrl && (
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">Foto especial</span>
              </div>
              <img
                src={card.imageUrl}
                alt="Foto da carta"
                className="w-full h-auto max-h-96 object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Message Text - Requirement: 5.5 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
              {card.messageText}
            </p>
          </div>

          {/* Music Player - Requirement: 5.7 */}
          {card.youtubeUrl && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-600">
                <Music className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold">Música especial para você</span>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
                <YouTubePlayer
                  videoUrl={card.youtubeUrl}
                  autoplay={isFirstOpen}
                  volume={70}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* First Open Message */}
          {isFirstOpen && showContent && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 text-center animate-in fade-in duration-1000 delay-500">
              <p className="text-amber-900 font-medium">
                ✨ Esta é a primeira e única vez que você pode ver esta carta completa. 
                Aproveite este momento especial! ✨
              </p>
            </div>
          )}

          {/* Already Opened Message */}
          {!isFirstOpen && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-gray-600 font-medium">
                Esta carta já foi aberta anteriormente em {card.openedAt ? new Date(card.openedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'data desconhecida'}.
              </p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button
              variant="primary"
              onClick={onClose}
              className="px-8 py-3 text-lg"
              aria-label="Fechar carta"
            >
              Fechar Carta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
