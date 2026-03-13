"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGenderRevealEditor } from '@/contexts/GenderRevealEditorContext';
import { Button } from '@/components/ui/Button';
import { Upload, X, Image as ImageIcon, ExternalLink } from 'lucide-react';

export function Step3Photos() {
  const { data, updateData, nextStep, prevStep } = useGenderRevealEditor();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - data.photos.length;
    if (remainingSlots <= 0) {
      setUploadError('Você já adicionou o máximo de 5 fotos');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Apenas imagens são permitidas');
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('Imagem muito grande. Máximo 10MB');
        }

        // Upload to server
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao fazer upload');
        }

        const result = await response.json();
        uploadedUrls.push(result.url);
      }

      updateData({ photos: [...data.photos, ...uploadedUrls] });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Erro ao fazer upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = data.photos.filter((_, i) => i !== index);
    updateData({ photos: newPhotos });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 10 }}
        className="text-6xl mb-6"
      >
        📸
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-3xl md:text-4xl text-center mb-3 text-gray-800"
      >
        Que tal adicionar fotos?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-gray-600 mb-8 max-w-md"
      >
        Fotos do casal, do ultrassom, da barriguinha... Deixe a revelação ainda mais especial! 🤰
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Progress indicator - inside container */}
        <div className="flex justify-between items-center mb-2">
          <div className="w-16" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === 3 ? 'bg-pink-400 scale-125' : step < 3 ? 'bg-pink-300' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <a
            href="/demo/revelacao-virtual"
            target="_blank"
            className="flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm font-medium"
          >
            <ExternalLink size={14} />
            Demo
          </a>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-3 gap-3">
          {data.photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Add Photo Button */}
          {data.photos.length < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50/50 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500">Adicionar</span>
                </>
              )}
            </button>
          )}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 5 - data.photos.length - 1) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center"
            >
              <ImageIcon size={24} className="text-gray-300" />
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadError && (
          <p className="text-red-500 text-sm text-center">{uploadError}</p>
        )}

        <p className="text-xs text-gray-500 text-center">
          {data.photos.length}/5 fotos adicionadas • Esta etapa é opcional
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            💡 <strong>Dica:</strong> Se você não adicionar fotos, a revelação vai direto para a votação. 
            Mas com fotos fica muito mais especial!
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={prevStep}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            ← Voltar
          </Button>
          <Button
            onClick={nextStep}
            size="lg"
            className="flex-1 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-semibold shadow-lg"
          >
            {data.photos.length === 0 ? 'Pular →' : 'Continuar →'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
