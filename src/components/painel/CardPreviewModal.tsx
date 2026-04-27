'use client';

import { useEffect } from 'react';
import { Card, CardCollection } from '@/types/card';
import { X, Heart, Music, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { YouTubePlayer } from '@/components/media/YouTubePlayer';

interface CardPreviewModalProps {
  card: Card | null;
  collection: CardCollection;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Preview modal for the buyer dashboard.
 * Shows card content without calling the open API — read-only preview.
 */
export function CardPreviewModal({ card, collection, isOpen, onClose }: CardPreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !card) return null;

  const imageUrl = card.imageUrl ?? collection.coverImageUrl;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110"
        aria-label="Fechar pré-visualização"
      >
        <X className="w-6 h-6 text-gray-700" aria-hidden="true" />
      </button>

      {/* Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Preview badge */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-[#8B5F5F] text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">
            Pré-visualização
          </span>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-[#D4A5A5] to-[#8B5F5F] text-white p-8 rounded-t-3xl pt-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8" aria-hidden="true" />
            </div>
          </div>
          <h2 id="preview-modal-title" className="text-3xl font-bold text-center mb-2">
            Carta {card.order}
          </h2>
          <p className="text-xl text-center text-white/90">{card.title}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {imageUrl && (
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#8B5F5F]" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">Foto especial</span>
              </div>
              <img
                src={imageUrl}
                alt="Foto da carta"
                className="w-full max-h-[50vh] object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="bg-[#FFFAFA] border-2 border-[#E6C2C2] rounded-2xl p-6">
            <p className="text-lg text-[#4A4A4A] leading-relaxed whitespace-pre-wrap">
              {card.messageText}
            </p>
          </div>

          {card.youtubeUrl && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#8B5F5F]">
                <Music className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold">Música especial</span>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
                <YouTubePlayer
                  videoUrl={card.youtubeUrl}
                  autoplay={false}
                  volume={70}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              variant="primary"
              onClick={onClose}
              className="px-8 py-3 text-lg"
              aria-label="Fechar pré-visualização"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
