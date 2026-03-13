'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/types/card';
import { Button } from '@/components/ui/Button';
import { extractYouTubeVideoId, fetchYouTubeVideoTitle } from '@/lib/youtube-utils';
import { Music, Loader2, XCircle, CheckCircle, ExternalLink } from 'lucide-react';

/**
 * MusicSelectionModal Props
 * Requirements: 3.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
interface MusicSelectionModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, youtubeUrl: string) => Promise<void>;
  onRemove: (cardId: string) => Promise<void>;
}

/**
 * MusicSelectionModal Component
 * 
 * Modal for selecting and managing YouTube music for cards.
 * 
 * Features:
 * - YouTube URL input with real-time validation
 * - Video ID extraction
 * - Video preview (iframe embed)
 * - Save, Remove, Cancel buttons
 * - Reuses existing validation logic
 * - Responsive design (fullscreen on mobile)
 * 
 * Requirements: 3.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
export function MusicSelectionModal({ card, isOpen, onClose, onSave, onRemove }: MusicSelectionModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState(card.youtubeUrl || '');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset state when modal opens or card changes
  useEffect(() => {
    if (isOpen) {
      setYoutubeUrl(card.youtubeUrl || '');
      setError(null);
      setHasChanges(false);
      setShowConfirmation(false);
      setIsRemoving(false);
      setVideoTitle(null);
      
      // Extract video ID if URL exists
      if (card.youtubeUrl) {
        const id = extractYouTubeVideoId(card.youtubeUrl);
        setVideoId(id);
        
        // Fetch video title
        if (id) {
          fetchYouTubeVideoTitle(card.youtubeUrl).then(title => {
            setVideoTitle(title);
          });
        }
      } else {
        setVideoId(null);
      }
    }
  }, [isOpen, card.youtubeUrl]);

  // Track changes
  useEffect(() => {
    const changed = youtubeUrl !== (card.youtubeUrl || '');
    setHasChanges(changed);
  }, [youtubeUrl, card.youtubeUrl]);

  /**
   * Validate YouTube URL in real-time
   * Requirements: 6.2, 6.3
   */
  const validateYouTubeUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setVideoId(null);
      setVideoTitle(null);
      setError(null);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Extract video ID (Requirement 6.3)
      const id = extractYouTubeVideoId(url);
      
      if (!id) {
        setError('Deve ser uma URL do YouTube válida');
        setVideoId(null);
        setVideoTitle(null);
        return;
      }

      setVideoId(id);

      // Fetch video title for better UX
      const title = await fetchYouTubeVideoTitle(url);
      setVideoTitle(title);
    } catch (err) {
      console.error('Error validating YouTube URL:', err);
      setError('Erro ao validar URL. Verifique se o vídeo existe.');
      setVideoId(null);
      setVideoTitle(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Handle URL input change with debounced validation
   * Requirements: 6.2
   * Debounced to 800ms for better performance
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateYouTubeUrl(youtubeUrl);
    }, 800); // Debounce validation by 800ms for better performance

    return () => clearTimeout(timeoutId);
  }, [youtubeUrl, validateYouTubeUrl]);

  /**
   * Handle save
   * Requirements: 6.4
   */
  const handleSave = useCallback(async () => {
    if (!youtubeUrl.trim()) {
      // If URL is empty, just close
      onClose();
      return;
    }

    if (!videoId) {
      setError('Deve ser uma URL do YouTube válida');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(card.id, youtubeUrl.trim());
      onClose();
    } catch (err) {
      console.error('Error saving music:', err);
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [youtubeUrl, videoId, card.id, onSave, onClose]);

  /**
   * Handle remove music
   * Requirements: 6.5
   */
  const handleRemove = useCallback(async () => {
    setIsRemoving(true);
    setError(null);

    try {
      await onRemove(card.id);
      onClose();
    } catch (err) {
      console.error('Error removing music:', err);
      setError('Erro ao remover música. Tente novamente.');
    } finally {
      setIsRemoving(false);
    }
  }, [card.id, onRemove, onClose]);

  /**
   * Handle cancel
   * Requirements: 6.6
   */
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  /**
   * Handle close (clicking outside or escape)
   * Requirements: 6.6
   */
  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleSave]);

  /**
   * Prevent body scroll when modal is open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div
          className="bg-white w-full h-full sm:h-auto sm:rounded-lg sm:shadow-xl sm:max-w-3xl sm:max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-900">
              {card.youtubeUrl ? 'Editar Música' : 'Adicionar Música'}
            </h2>
            <p id="modal-description" className="text-sm text-gray-600 mt-1">
              Carta {card.order} de 12
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {/* URL Input */}
            <div>
              <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-1">
                URL do YouTube
              </label>
              <div className="relative">
                <input
                  id="youtube-url"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-red-500 focus:ring-red-500'
                      : videoId
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="https://www.youtube.com/watch?v=..."
                  aria-invalid={!!error}
                  aria-describedby={error ? 'url-error' : videoId ? 'url-success' : 'url-hint'}
                />
                {/* Validation indicator */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidating ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" aria-hidden="true" />
                  ) : error ? (
                    <XCircle className="w-5 h-5 text-red-500" aria-label="URL inválida" />
                  ) : videoId ? (
                    <CheckCircle className="w-5 h-5 text-green-500" aria-label="URL válida" />
                  ) : null}
                </div>
              </div>
              {error && (
                <p id="url-error" className="text-sm text-red-600 mt-1" role="alert">
                  {error}
                </p>
              )}
              {videoId && !error && videoTitle && (
                <p id="url-success" className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  {videoTitle}
                </p>
              )}
              <p id="url-hint" className="text-xs text-gray-500 mt-1">
                Cole a URL completa do vídeo do YouTube
              </p>
            </div>

            {/* Video Preview */}
            {videoId && !error && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Prévia do Vídeo
                </label>
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  Abrir no YouTube
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Current Music Info */}
            {card.youtubeUrl && !youtubeUrl && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Music className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Música Atual
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {videoTitle || 'Carregando...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                💡 Dica
              </h3>
              <p className="text-sm text-blue-800">
                Escolha uma música especial que tenha significado para vocês. O destinatário poderá ouvir a música enquanto lê a carta.
              </p>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              <p>Dica: Pressione Ctrl+Enter (ou Cmd+Enter) para salvar rapidamente</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <div>
              {card.youtubeUrl && (
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  disabled={isSaving || isRemoving}
                  className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px]"
                  aria-label="Remover música da carta"
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Removendo...
                    </>
                  ) : (
                    'Remover Música'
                  )}
                </Button>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving || isRemoving}
                className="w-full sm:w-auto min-h-[44px]"
                aria-label="Cancelar edição de música"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isRemoving || !!error || (youtubeUrl.trim() !== '' && !videoId)}
                className="w-full sm:w-auto min-h-[44px]"
                aria-label="Salvar música"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60] transition-opacity"
            onClick={() => setShowConfirmation(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="confirmation-title" className="text-lg font-semibold text-gray-900 mb-2">
                Descartar alterações?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Você alterou a URL da música. Deseja descartar esta alteração?
              </p>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false);
                    setYoutubeUrl(card.youtubeUrl || '');
                    onClose();
                  }}
                  className="w-full sm:w-auto"
                >
                  Descartar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="w-full sm:w-auto"
                >
                  Continuar Editando
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
