'use client';

import { useState, useEffect, useCallback } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';
import { Camera, X, Image as ImageIcon, Eye, Heart, Loader2, CheckCircle } from 'lucide-react';

/**
 * Upload image to server
 */
async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

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
}

/**
 * Step 4: Fotos
 * Main photo and gallery photos upload - uploads immediately to server
 */
export function Step4Photos() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { data, updateField, uploads, updateMainImageUpload, updateGalleryImageUpload, ui } = useWizard();
  
  const [isUploading, setIsUploading] = useState(false);

  // This step is optional, so always valid
  useEffect(() => {
    setStepValidation(3, { isValid: true, errors: {} });
  }, []);

  // Handle main image upload - uploads to server immediately
  const handleMainImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      updateMainImageUpload({ error: 'Arquivo deve ser uma imagem' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      updateMainImageUpload({ error: 'Imagem deve ter no máximo 5MB' });
      return;
    }

    setIsUploading(true);
    updateMainImageUpload({ isUploading: true, error: null });

    try {
      // Upload to server immediately
      const url = await uploadImage(file);
      
      // Store the file and the uploaded URL
      updateField('mainImage', file);
      updateMainImageUpload({ url, isUploading: false, error: null });
    } catch (error) {
      console.error('Main image upload error:', error);
      updateMainImageUpload({ 
        error: error instanceof Error ? error.message : 'Erro ao enviar imagem', 
        isUploading: false 
      });
    } finally {
      setIsUploading(false);
    }
  }, [updateField, updateMainImageUpload]);

  // Handle gallery image upload - uploads to server immediately
  const handleGalleryImageUpload = useCallback(async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      updateGalleryImageUpload(index, { error: 'Arquivo deve ser uma imagem' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      updateGalleryImageUpload(index, { error: 'Imagem deve ter no máximo 5MB' });
      return;
    }

    setIsUploading(true);
    updateGalleryImageUpload(index, { isUploading: true, error: null });

    try {
      // Upload to server immediately
      const url = await uploadImage(file);
      
      // Store the file and the uploaded URL
      const newGalleryImages = [...data.galleryImages];
      newGalleryImages[index] = file;
      updateField('galleryImages', newGalleryImages);
      updateGalleryImageUpload(index, { url, isUploading: false, error: null });
    } catch (error) {
      console.error(`Gallery image ${index} upload error:`, error);
      updateGalleryImageUpload(index, { 
        error: error instanceof Error ? error.message : 'Erro ao enviar imagem', 
        isUploading: false 
      });
    } finally {
      setIsUploading(false);
    }
  }, [data.galleryImages, updateField, updateGalleryImageUpload]);

  // Remove main image
  const handleRemoveMainImage = useCallback(() => {
    updateField('mainImage', null);
    updateMainImageUpload({ url: null, error: null, isUploading: false });
  }, [updateField, updateMainImageUpload]);

  // Remove gallery image
  const handleRemoveGalleryImage = useCallback((index: number) => {
    const newGalleryImages = [...data.galleryImages];
    newGalleryImages[index] = null;
    updateField('galleryImages', newGalleryImages);
    updateGalleryImageUpload(index, { url: null, error: null, isUploading: false });
  }, [data.galleryImages, updateField, updateGalleryImageUpload]);

  const handleNext = () => {
    nextStep();
  };

  const handlePrev = () => {
    prevStep();
  };

  const hasAnyPhoto = uploads.mainImage.url || uploads.galleryImages.some(img => img?.url);
  const isAnyUploading = uploads.mainImage.isUploading || uploads.galleryImages.some(img => img?.isUploading);

  return (
    <FullscreenStep
      emoji="📸"
      title="Momentos que marcaram vocês"
      subtitle={`Adicione fotos especiais para ${data.recipientName || 'essa pessoa'} reviver os melhores momentos`}
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Main Photo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Foto Principal 💕
          </label>
          
          {uploads.mainImage.isUploading ? (
            <div className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-pink-300 bg-pink-50">
              <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-3" />
              <span className="text-sm text-pink-600">Enviando foto...</span>
            </div>
          ) : uploads.mainImage.url ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-green-300 shadow-sm">
              <img
                src={uploads.mainImage.url}
                alt="Foto principal"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <CheckCircle size={12} />
                Enviada
              </div>
              <button
                onClick={handleRemoveMainImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                aria-label="Remover foto"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-50 cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files?.[0] && handleMainImageUpload(e.target.files[0])}
                className="hidden"
              />
              <Camera className="w-12 h-12 text-pink-400 mb-3" />
              <span className="text-sm text-pink-600 font-medium">Clique para adicionar</span>
              <span className="text-xs text-pink-400 mt-1">A foto que mais representa vocês</span>
            </label>
          )}
          
          {uploads.mainImage.error && (
            <p className="text-sm text-red-600">{uploads.mainImage.error}</p>
          )}
        </div>

        {/* Gallery Photos */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Galeria de Memórias (até 7 fotos) ✨
          </label>
          
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="aspect-square">
                {uploads.galleryImages[index]?.isUploading ? (
                  <div className="flex items-center justify-center w-full h-full rounded-lg border-2 border-pink-300 bg-pink-50">
                    <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                  </div>
                ) : uploads.galleryImages[index]?.url ? (
                  <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-green-300">
                    <img
                      src={uploads.galleryImages[index].url!}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      aria-label={`Remover foto ${index + 1}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => e.target.files?.[0] && handleGalleryImageUpload(index, e.target.files[0])}
                      className="hidden"
                    />
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </label>
                )}
                {uploads.galleryImages[index]?.error && (
                  <p className="text-xs text-red-600 mt-1">{uploads.galleryImages[index].error}</p>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500">
            JPEG, PNG ou WebP • Máximo 5MB por foto
          </p>
        </div>

        {/* Encouragement message */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800 flex items-center gap-2">
            <Heart size={16} className="text-amber-600" />
            {hasAnyPhoto 
              ? 'Que lindas memórias! Essas fotos vão deixar sua mensagem ainda mais especial.'
              : 'Fotos são opcionais, mas deixam a mensagem muito mais emocionante!'
            }
          </p>
        </div>

        {/* Demo Link */}
        <div className="text-center">
          <a 
            href="/demo/message"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 transition-colors"
          >
            <Eye size={16} />
            Ver demonstração
          </a>
        </div>

        <WizardNavigation
          onNext={handleNext}
          onPrev={handlePrev}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={ui.isAutoSaving || isAnyUploading}
          canProceed={!isAnyUploading}
          nextLabel="Continuar →"
        />
      </div>
    </FullscreenStep>
  );
}
