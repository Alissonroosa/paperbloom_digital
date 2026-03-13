'use client';

import React, { useRef, useState, DragEvent } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { useWizard } from '@/contexts/WizardContext';
import { Upload, X, Image as ImageIcon, Loader2, XCircle, CheckCircle } from 'lucide-react';

/**
 * Step 4: Photo Upload Component
 * Allows users to upload a main image and up to 7 gallery images
 * Features:
 * - Drag-and-drop upload areas
 * - Image format validation (JPEG, PNG, WebP)
 * - File size validation (5MB max)
 * - Upload progress indicators
 * - Image removal and replacement
 * - Updates preview with uploaded images
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export function Step4PhotoUpload() {
  const { data, updateField, uploads, updateMainImageUpload, updateGalleryImageUpload, stepValidation, currentStep } = useWizard();
  const [dragOver, setDragOver] = useState<{ main: boolean; gallery: boolean[] }>({
    main: false,
    gallery: [false, false, false, false, false, false, false],
  });

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const errors = stepValidation[currentStep]?.errors || {};

  // Allowed file types
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Validate image file
   * Requirements: 5.2, 5.3
   */
  const validateImage = (file: File): { valid: boolean; error?: string } => {
    // Check file type (Requirement 5.2)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato inválido. Use JPEG, PNG ou WebP.',
      };
    }

    // Check file size (Requirement 5.3)
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
   * Requirement: 5.4
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
   * Handle main image upload
   * Requirements: 5.1, 5.4, 5.5, 5.6
   */
  const handleMainImageUpload = async (file: File) => {
    // Validate image (Requirements 5.2, 5.3)
    const validation = validateImage(file);
    if (!validation.valid) {
      updateMainImageUpload({
        error: validation.error || 'Erro de validação',
      });
      return;
    }

    // Set uploading state (Requirement 5.4)
    updateMainImageUpload({
      isUploading: true,
      error: null,
    });

    try {
      // Upload to server (Requirement 5.4)
      const url = await uploadImage(file);
      
      if (url) {
        // Update state with uploaded URL (Requirement 5.6)
        updateField('mainImage', file);
        updateMainImageUpload({
          url,
          isUploading: false,
          error: null,
        });
      }
    } catch (error) {
      // Handle upload error
      updateMainImageUpload({
        isUploading: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer upload',
      });
    }
  };

  /**
   * Handle gallery image upload
   * Requirements: 5.1, 5.4, 5.5, 5.6
   */
  const handleGalleryImageUpload = async (file: File, index: number) => {
    // Validate image (Requirements 5.2, 5.3)
    const validation = validateImage(file);
    if (!validation.valid) {
      updateGalleryImageUpload(index, {
        error: validation.error || 'Erro de validação',
      });
      return;
    }

    // Set uploading state (Requirement 5.4)
    updateGalleryImageUpload(index, {
      isUploading: true,
      error: null,
    });

    try {
      // Upload to server (Requirement 5.4)
      const url = await uploadImage(file);
      
      if (url) {
        // Update state with uploaded URL (Requirement 5.6)
        const newGalleryImages = [...data.galleryImages];
        newGalleryImages[index] = file;
        updateField('galleryImages', newGalleryImages);
        
        updateGalleryImageUpload(index, {
          url,
          isUploading: false,
          error: null,
        });
      }
    } catch (error) {
      // Handle upload error
      updateGalleryImageUpload(index, {
        isUploading: false,
        error: error instanceof Error ? error.message : 'Erro ao fazer upload',
      });
    }
  };

  /**
   * Handle file input change
   */
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleMainImageUpload(file);
    }
  };

  const handleGalleryImageChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleGalleryImageUpload(file, index);
    }
  };

  /**
   * Handle drag and drop
   * Requirement: 5.1
   */
  const handleMainImageDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver({ ...dragOver, main: false });

    const file = e.dataTransfer.files[0];
    if (file) {
      handleMainImageUpload(file);
    }
  };

  const handleGalleryImageDrop = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newGalleryDragOver = [...dragOver.gallery];
    newGalleryDragOver[index] = false;
    setDragOver({ ...dragOver, gallery: newGalleryDragOver });

    const file = e.dataTransfer.files[0];
    if (file) {
      handleGalleryImageUpload(file, index);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleMainImageDragEnter = () => {
    setDragOver({ ...dragOver, main: true });
  };

  const handleMainImageDragLeave = () => {
    setDragOver({ ...dragOver, main: false });
  };

  const handleGalleryImageDragEnter = (index: number) => () => {
    const newGalleryDragOver = [...dragOver.gallery];
    newGalleryDragOver[index] = true;
    setDragOver({ ...dragOver, gallery: newGalleryDragOver });
  };

  const handleGalleryImageDragLeave = (index: number) => () => {
    const newGalleryDragOver = [...dragOver.gallery];
    newGalleryDragOver[index] = false;
    setDragOver({ ...dragOver, gallery: newGalleryDragOver });
  };

  /**
   * Handle image removal
   * Requirement: 5.5
   */
  const handleRemoveMainImage = () => {
    updateField('mainImage', null);
    updateMainImageUpload({
      url: null,
      isUploading: false,
      error: null,
    });
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = '';
    }
  };

  const handleRemoveGalleryImage = (index: number) => () => {
    const newGalleryImages = [...data.galleryImages];
    newGalleryImages[index] = null;
    updateField('galleryImages', newGalleryImages);
    
    updateGalleryImageUpload(index, {
      url: null,
      isUploading: false,
      error: null,
    });
    
    if (galleryInputRefs[index].current) {
      galleryInputRefs[index].current!.value = '';
    }
  };

  /**
   * Render upload area
   */
  const renderMainImageUploadArea = () => {
    const hasImage = uploads.mainImage.url || data.mainImage;
    const isUploading = uploads.mainImage.isUploading;
    const error = uploads.mainImage.error;

    return (
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all
          ${dragOver.main ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${error ? 'border-red-500 bg-red-50' : ''}
          ${hasImage && !error ? 'border-green-500 bg-green-50' : ''}
          ${!isUploading && !hasImage ? 'hover:border-gray-400 hover:bg-gray-50 cursor-pointer' : ''}
        `}
        onDrop={handleMainImageDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleMainImageDragEnter}
        onDragLeave={handleMainImageDragLeave}
        onClick={() => !isUploading && !hasImage && mainImageInputRef.current?.click()}
      >
        <input
          ref={mainImageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleMainImageChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Enviando imagem...</p>
            </>
          ) : hasImage && !error ? (
            <>
              <div className="relative w-48 h-48">
                {uploads.mainImage.url && (
                  <Image
                    src={uploads.mainImage.url}
                    alt="Imagem principal"
                    fill
                    className="object-cover rounded-lg"
                  />
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMainImage();
                  }}
                  aria-label="Remover imagem principal"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">Imagem carregada com sucesso</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  mainImageInputRef.current?.click();
                }}
              >
                Trocar Imagem
              </Button>
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
                  updateMainImageUpload({ error: null });
                  mainImageInputRef.current?.click();
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
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG ou WebP • Máximo 5MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render gallery upload slot
   */
  const renderGalleryUploadSlot = (index: number) => {
    const hasImage = uploads.galleryImages[index].url || data.galleryImages[index];
    const isUploading = uploads.galleryImages[index].isUploading;
    const error = uploads.galleryImages[index].error;

    return (
      <div
        key={index}
        className={`
          relative border-2 border-dashed rounded-lg p-4 transition-all aspect-square
          ${dragOver.gallery[index] ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${error ? 'border-red-500 bg-red-50' : ''}
          ${hasImage && !error ? 'border-green-500 bg-green-50' : ''}
          ${!isUploading && !hasImage ? 'hover:border-gray-400 hover:bg-gray-50 cursor-pointer' : ''}
        `}
        onDrop={handleGalleryImageDrop(index)}
        onDragOver={handleDragOver}
        onDragEnter={handleGalleryImageDragEnter(index)}
        onDragLeave={handleGalleryImageDragLeave(index)}
        onClick={() => !isUploading && !hasImage && galleryInputRefs[index].current?.click()}
      >
        <input
          ref={galleryInputRefs[index]}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleGalleryImageChange(index)}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center h-full space-y-2">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs text-gray-600">Enviando...</p>
            </>
          ) : hasImage && !error ? (
            <>
              <div className="relative w-full h-full">
                {uploads.galleryImages[index].url && (
                  <Image
                    src={uploads.galleryImages[index].url}
                    alt={`Imagem da galeria ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveGalleryImage(index)();
                  }}
                  aria-label={`Remover imagem ${index + 1} da galeria`}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </>
          ) : error ? (
            <>
              <XCircle className="w-8 h-8 text-red-500" />
              <p className="text-xs text-red-600 text-center px-1">{error}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  updateGalleryImageUpload(index, { error: null });
                  galleryInputRefs[index].current?.click();
                }}
              >
                Tentar Novamente
              </Button>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <p className="text-xs text-gray-500 text-center">
                Foto {index + 1}
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Adicionar Fotos
        </h2>
        <p className="text-gray-600">
          Adicione uma foto principal e até 3 fotos adicionais para a galeria.
        </p>
      </div>

      {/* Main Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="mainImage">
          Foto Principal
        </Label>
        {renderMainImageUploadArea()}
        {errors.mainImage && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            {errors.mainImage}
          </p>
        )}
      </div>

      {/* Gallery Images Upload */}
      <div className="space-y-2">
        <Label>
          Galeria de Fotos <span className="text-gray-500 text-sm font-normal">(Opcional)</span>
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Adicione até 7 fotos adicionais para criar uma galeria.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => renderGalleryUploadSlot(index))}
        </div>
        {errors.galleryImages && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            {errors.galleryImages}
          </p>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Dicas para melhores fotos
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Use imagens de alta qualidade e bem iluminadas</li>
          <li>Formatos aceitos: JPEG, PNG ou WebP</li>
          <li>Tamanho máximo: 5MB por imagem</li>
          <li>As fotos serão redimensionadas automaticamente se necessário</li>
        </ul>
      </div>
    </div>
  );
}
