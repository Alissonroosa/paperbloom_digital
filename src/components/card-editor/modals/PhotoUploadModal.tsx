'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/types/card';
import { Button } from '@/components/ui/Button';
import { Upload, X, Loader2, XCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

/**
 * PhotoUploadModal Props
 * Requirements: 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */
interface PhotoUploadModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, imageUrl: string) => Promise<void>;
  onRemove: (cardId: string) => Promise<void>;
}

/**
 * File validation constants
 * Requirements: 5.3, 5.4
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * PhotoUploadModal Component
 * 
 * Modal for uploading and managing card photos with drag-and-drop support.
 * 
 * Features:
 * - Drag-and-drop area
 * - Current photo preview
 * - Format validation (JPEG, PNG, WebP)
 * - Size validation (max 5MB)
 * - Upload progress indicator
 * - Save, Remove, Cancel buttons
 * - Responsive design (fullscreen on mobile)
 * 
 * Requirements: 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */
export function PhotoUploadModal({ card, isOpen, onClose, onSave, onRemove }: PhotoUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(card.imageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens or card changes
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreviewUrl(card.imageUrl);
      setError(null);
      setUploadProgress(0);
      setHasChanges(false);
      setShowConfirmation(false);
      setIsRemoving(false);
    }
  }, [isOpen, card.imageUrl]);

  // Track changes
  useEffect(() => {
    const changed = selectedFile !== null || (previewUrl !== card.imageUrl);
    setHasChanges(changed);
  }, [selectedFile, previewUrl, card.imageUrl]);

  /**
   * Validate image file
   * Requirements: 5.3, 5.4
   */
  const validateImage = useCallback((file: File): { valid: boolean; error?: string } => {
    // Validate file type (Requirement 5.3)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato inválido. Use JPEG, PNG ou WebP',
      };
    }

    // Validate file size (Requirement 5.4)
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo 5MB. (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      };
    }

    return { valid: true };
  }, []);

  /**
   * Handle file selection
   * Requirements: 5.1, 5.3, 5.4
   */
  const handleFileSelect = useCallback((file: File) => {
    // Validate file
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Erro de validação');
      setSelectedFile(null);
      setPreviewUrl(card.imageUrl);
      return;
    }

    // Clear any previous errors
    setError(null);

    // Set selected file
    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Cleanup old preview URL
    return () => URL.revokeObjectURL(objectUrl);
  }, [card.imageUrl, validateImage]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Handle drag and drop
   * Requirements: 5.1
   */
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback(() => {
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  /**
   * Upload image to server
   * Requirements: 5.5
   */
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    setUploadProgress(0);

    try {
      // Simulate progress (since fetch doesn't support upload progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload/card-image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

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
  }, []);

  /**
   * Handle save
   * Requirements: 5.5, 5.6
   */
  const handleSave = useCallback(async () => {
    if (!selectedFile) {
      // No new file selected, just close
      onClose();
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload image
      const imageUrl = await uploadImage(selectedFile);

      // Save to card
      await onSave(card.id, imageUrl);

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error saving photo:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer upload. Tente novamente.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile, card.id, uploadImage, onSave, onClose]);

  /**
   * Handle remove photo
   * Requirements: 5.6
   */
  const handleRemove = useCallback(async () => {
    setIsRemoving(true);
    setError(null);

    try {
      await onRemove(card.id);
      onClose();
    } catch (error) {
      console.error('Error removing photo:', error);
      setError('Erro ao remover foto. Tente novamente.');
    } finally {
      setIsRemoving(false);
    }
  }, [card.id, onRemove, onClose]);

  /**
   * Handle cancel
   * Requirements: 5.7
   */
  const handleCancel = useCallback(() => {
    if (hasChanges && selectedFile) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  }, [hasChanges, selectedFile, onClose]);

  /**
   * Handle close (clicking outside or escape)
   * Requirements: 5.7
   */
  const handleClose = useCallback(() => {
    if (hasChanges && selectedFile) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  }, [hasChanges, selectedFile, onClose]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

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
          className="bg-white w-full h-full sm:h-auto sm:rounded-lg sm:shadow-xl sm:max-w-2xl sm:max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-900">
              {card.imageUrl ? 'Editar Foto' : 'Adicionar Foto'}
            </h2>
            <p id="modal-description" className="text-sm text-gray-600 mt-1">
              Carta {card.order} de 12
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {/* Current/Preview Photo */}
            {previewUrl && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {selectedFile ? 'Prévia da Nova Foto' : 'Foto Atual'}
                </label>
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview da foto"
                    fill
                    className="object-contain"
                  />
                  {selectedFile && (
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(card.imageUrl);
                          setError(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="bg-white/90 hover:bg-white min-h-[44px] min-w-[44px]"
                        aria-label="Remover seleção de foto"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {previewUrl ? 'Trocar Foto' : 'Selecionar Foto'}
              </label>
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer
                  ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                  ${error ? 'border-red-500 bg-red-50' : ''}
                  ${!isUploading ? 'hover:border-gray-400 hover:bg-gray-50' : ''}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={isUploading}
                  aria-label="Selecionar arquivo de imagem"
                />

                <div className="flex flex-col items-center justify-center space-y-4">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                      <div className="w-full max-w-xs">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Enviando...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    </>
                  ) : error ? (
                    <>
                      <XCircle className="w-12 h-12 text-red-500" />
                      <p className="text-sm text-red-600 text-center">{error}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setError(null);
                          fileInputRef.current?.click();
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
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                💡 Dica
              </h3>
              <p className="text-sm text-blue-800">
                Escolha uma foto especial que complemente sua mensagem. A foto será exibida junto com o texto da carta.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <div>
              {card.imageUrl && !selectedFile && (
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  disabled={isUploading || isRemoving}
                  className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px]"
                  aria-label="Remover foto da carta"
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Removendo...
                    </>
                  ) : (
                    'Remover Foto'
                  )}
                </Button>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading || isRemoving}
                className="w-full sm:w-auto min-h-[44px]"
                aria-label="Cancelar edição de foto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUploading || isRemoving || (!selectedFile && !card.imageUrl)}
                className="w-full sm:w-auto min-h-[44px]"
                aria-label="Salvar foto"
              >
                {isUploading ? (
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
                Você selecionou uma nova foto. Deseja descartar esta seleção?
              </p>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedFile(null);
                    setPreviewUrl(card.imageUrl);
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
