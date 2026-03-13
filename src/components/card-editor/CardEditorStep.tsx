'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { extractYouTubeVideoId } from '@/lib/youtube-utils';
import { isValidYouTubeUrl } from '@/types/card';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  XCircle, 
  CheckCircle,
  Music,
  AlertCircle,
  Sparkles
} from 'lucide-react';

/**
 * CardEditorStep Component
 * Individual card editor for the 12 Cartas product
 * 
 * Features:
 * - Title input with character counter
 * - Message textarea with 500 character limit
 * - Photo upload with drag-and-drop
 * - YouTube URL validation
 * - Real-time validation
 * - Preview integration
 * - Auto-save via context
 * 
 * Requirements: 1.4, 1.5, 1.6, 1.7, 3.1, 3.3, 3.5
 */
export function CardEditorStep() {
  const {
    currentCard,
    currentCardIndex,
    totalCards,
    updateCardLocal,
    saveCard,
    isSaving,
    imageUploadStates,
    setImageUploadState,
    resetImageUploadState,
  } = useCardCollectionEditor();

  // Local state for validation
  const [titleError, setTitleError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  // If no current card, show loading state
  if (!currentCard) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const uploadState = imageUploadStates[currentCard.id] || {
    isUploading: false,
    progress: 0,
    error: null,
  };

  // Character count for message
  const characterCount = currentCard.messageText.length;
  const maxCharacters = 500;
  const characterPercentage = (characterCount / maxCharacters) * 100;

  /**
   * Get character counter color based on usage
   */
  const getCharacterCountColor = () => {
    if (characterPercentage >= 100) return 'text-red-600';
    if (characterPercentage >= 90) return 'text-orange-600';
    if (characterPercentage >= 75) return 'text-yellow-600';
    return 'text-gray-500';
  };

  /**
   * Validate title
   * Requirement: 1.4, 3.1
   */
  const validateTitle = (title: string): boolean => {
    if (title.trim().length === 0) {
      setTitleError('O título é obrigatório');
      return false;
    }
    if (title.length > 200) {
      setTitleError('O título deve ter no máximo 200 caracteres');
      return false;
    }
    setTitleError(null);
    return true;
  };

  /**
   * Validate message text
   * Requirement: 1.5, 3.3
   */
  const validateMessage = (message: string): boolean => {
    if (message.trim().length === 0) {
      setMessageError('A mensagem é obrigatória');
      return false;
    }
    if (message.length > 500) {
      setMessageError('A mensagem deve ter no máximo 500 caracteres');
      return false;
    }
    setMessageError(null);
    return true;
  };

  /**
   * Validate YouTube URL
   * Requirement: 1.7, 3.5
   */
  const validateYouTubeUrl = (url: string): boolean => {
    if (!url || url.trim() === '') {
      setYoutubeError(null);
      setYoutubeVideoId(null);
      return true; // Optional field
    }

    // Check if URL matches YouTube domain pattern
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
    if (!youtubePattern.test(url)) {
      setYoutubeError('Deve ser uma URL do YouTube válida');
      setYoutubeVideoId(null);
      return false;
    }

    // Validate with Zod schema
    if (!isValidYouTubeUrl(url)) {
      setYoutubeError('Formato de URL do YouTube inválido');
      setYoutubeVideoId(null);
      return false;
    }

    // Extract video ID
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      setYoutubeError('Não foi possível extrair o ID do vídeo');
      setYoutubeVideoId(null);
      return false;
    }

    setYoutubeError(null);
    setYoutubeVideoId(videoId);
    return true;
  };

  /**
   * Handle title change
   * Requirement: 1.4, 3.1
   */
  const handleTitleChange = (value: string) => {
    validateTitle(value);
    updateCardLocal(currentCard.id, { title: value });
  };

  /**
   * Handle message change
   * Requirement: 1.5, 3.3
   */
  const handleMessageChange = (value: string) => {
    validateMessage(value);
    updateCardLocal(currentCard.id, { messageText: value });
  };

  /**
   * Handle YouTube URL change
   * Requirement: 1.7, 3.5
   */
  const handleYouTubeUrlChange = (value: string) => {
    validateYouTubeUrl(value);
    updateCardLocal(currentCard.id, { youtubeUrl: value || null });
  };

  /**
   * Validate image file
   * Requirement: 1.6, 3.4
   */
  const validateImage = (file: File): { valid: boolean; error?: string } => {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato inválido. Use JPEG, PNG ou WebP.',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo 5MB. (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      };
    }

    return { valid: true };
  };

  /**
   * Upload image to server
   * Requirement: 1.6, 3.4
   */
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/messages/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  /**
   * Handle image upload
   * Requirement: 1.6, 3.4
   */
  const handleImageUpload = async (file: File) => {
    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      setImageUploadState(currentCard.id, {
        error: validation.error || 'Erro de validação',
      });
      return;
    }

    // Set uploading state
    setImageUploadState(currentCard.id, {
      isUploading: true,
      error: null,
    });

    try {
      // Upload to server
      const url = await uploadImage(file);
      
      if (url) {
        // Update card with uploaded URL
        updateCardLocal(currentCard.id, { imageUrl: url });
        
        setImageUploadState(currentCard.id, {
          isUploading: false,
          error: null,
        });
      }
    } catch (error) {
      // Handle upload error
      setImageUploadState(currentCard.id, {
        isUploading: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer upload',
      });
    }
  };

  /**
   * Handle file input change
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = () => {
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  /**
   * Handle image removal
   */
  const handleRemoveImage = () => {
    updateCardLocal(currentCard.id, { imageUrl: null });
    resetImageUploadState(currentCard.id);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  /**
   * Clear YouTube URL
   */
  const handleClearYouTube = () => {
    updateCardLocal(currentCard.id, { youtubeUrl: null });
    setYoutubeError(null);
    setYoutubeVideoId(null);
  };

  /**
   * Validate YouTube URL on mount and when URL changes
   */
  useEffect(() => {
    if (currentCard.youtubeUrl) {
      validateYouTubeUrl(currentCard.youtubeUrl);
    }
  }, [currentCard.id]); // Only run when card changes

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Carta {currentCardIndex + 1} de {totalCards}
          </h2>
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando...</span>
            </div>
          )}
        </div>
        <p className="text-gray-600">
          Personalize esta carta com sua mensagem especial.
        </p>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="cardTitle">
          Título da Carta <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cardTitle"
          type="text"
          value={currentCard.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Ex: Abra quando..."
          maxLength={200}
          className={titleError ? 'border-red-500 focus-visible:ring-red-500' : ''}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? 'title-error' : undefined}
        />
        <div className="flex justify-between items-center">
          {titleError && (
            <p id="title-error" className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {titleError}
            </p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {currentCard.title.length}/200
          </p>
        </div>
      </div>

      {/* Message Textarea */}
      <div className="space-y-2">
        <Label htmlFor="cardMessage">
          Mensagem <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="cardMessage"
          value={currentCard.messageText}
          onChange={(e) => handleMessageChange(e.target.value)}
          placeholder="Escreva sua mensagem aqui..."
          maxLength={maxCharacters}
          rows={8}
          className={messageError ? 'border-red-500 focus-visible:ring-red-500' : ''}
          aria-invalid={!!messageError}
          aria-describedby={messageError ? 'message-error' : 'message-counter'}
        />
        <div className="flex justify-between items-center">
          {messageError && (
            <p id="message-error" className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {messageError}
            </p>
          )}
          <p 
            id="message-counter" 
            className={`text-sm ml-auto font-medium ${getCharacterCountColor()}`}
          >
            {characterCount}/{maxCharacters}
          </p>
        </div>
        {characterPercentage >= 90 && characterPercentage < 100 && (
          <p className="text-sm text-orange-600">
            Você está próximo do limite de caracteres.
          </p>
        )}
        {characterPercentage >= 100 && (
          <p className="text-sm text-red-600 font-medium">
            Limite de caracteres atingido!
          </p>
        )}
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label htmlFor="cardImage">
          Foto <span className="text-gray-500 text-sm font-normal">(Opcional)</span>
        </Label>
        
        {currentCard.imageUrl && !uploadState.isUploading ? (
          <div className="relative border-2 border-green-500 bg-green-50 rounded-lg p-4">
            <div className="relative w-full h-48">
              <Image
                src={currentCard.imageUrl}
                alt="Foto da carta"
                fill
                className="object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600"
                onClick={handleRemoveImage}
                aria-label="Remover foto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-green-600 mt-3">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Foto carregada com sucesso</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => imageInputRef.current?.click()}
            >
              Trocar Foto
            </Button>
          </div>
        ) : (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 transition-all
              ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${uploadState.error ? 'border-red-500 bg-red-50' : ''}
              ${!uploadState.isUploading ? 'hover:border-gray-400 hover:bg-gray-50 cursor-pointer' : ''}
            `}
            onDrop={handleImageDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={() => !uploadState.isUploading && imageInputRef.current?.click()}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
              disabled={uploadState.isUploading}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              {uploadState.isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                  <p className="text-sm text-gray-600">Enviando foto...</p>
                </>
              ) : uploadState.error ? (
                <>
                  <XCircle className="w-12 h-12 text-red-500" />
                  <p className="text-sm text-red-600 text-center">{uploadState.error}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetImageUploadState(currentCard.id);
                      imageInputRef.current?.click();
                    }}
                  >
                    Tentar Novamente
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Arraste uma foto ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, PNG ou WebP • Máximo 5MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* YouTube URL Input */}
      <div className="space-y-3">
        <Label htmlFor="cardYouTube">
          Música do YouTube
          <span className="text-gray-500 font-normal ml-2">(opcional)</span>
        </Label>
        <div className="relative">
          <Input
            id="cardYouTube"
            type="url"
            value={currentCard.youtubeUrl || ''}
            onChange={(e) => handleYouTubeUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`pr-10 ${youtubeError ? 'border-red-500 focus:ring-red-500' : ''} ${
              youtubeVideoId ? 'border-green-500 focus:ring-green-500' : ''
            }`}
            aria-invalid={!!youtubeError}
            aria-describedby={youtubeError ? 'youtube-error' : undefined}
          />
          {currentCard.youtubeUrl && (
            <button
              type="button"
              onClick={handleClearYouTube}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              aria-label="Limpar URL"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* YouTube Validation Feedback */}
        {youtubeError && (
          <div
            id="youtube-error"
            className="flex items-start gap-2 text-sm text-red-600"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{youtubeError}</span>
          </div>
        )}

        {youtubeVideoId && !youtubeError && (
          <div className="flex items-start gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>URL válida! ID do vídeo: {youtubeVideoId}</span>
          </div>
        )}

        <p className="text-sm text-gray-600">
          Cole a URL de um vídeo do YouTube para adicionar música à carta.
        </p>
      </div>

      {/* YouTube Preview */}
      {youtubeVideoId && !youtubeError && (
        <div className="space-y-3">
          <Label>Prévia da Música</Label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title="Prévia da música do YouTube"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Dica
        </h3>
        <p className="text-sm text-blue-800">
          Personalize cada carta com uma mensagem única. A foto e a música são opcionais, 
          mas tornam a experiência ainda mais especial para quem vai receber.
        </p>
      </div>
    </div>
  );
}
