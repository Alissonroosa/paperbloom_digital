'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';
import { Music, ExternalLink } from 'lucide-react';

/**
 * Step 6: Música
 * YouTube URL for background music
 * 
 * @see Requirements 5.2, 5.4, 5.5, 5.7
 */
export function Step6Music() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { data, updateField, ui } = useWizard();
  
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  // Validate YouTube URL
  const validateUrl = (url: string): boolean => {
    if (!url) {
      setError(null);
      setVideoId(null);
      return true; // Optional field
    }
    
    const id = extractVideoId(url);
    if (!id) {
      setError('URL do YouTube inválida');
      setVideoId(null);
      return false;
    }
    
    setError(null);
    setVideoId(id);
    return true;
  };

  // Update validation when URL changes
  useEffect(() => {
    const isValid = validateUrl(data.youtubeUrl);
    setStepValidation(5, { isValid, errors: error ? { youtubeUrl: error } : {} });
  }, [data.youtubeUrl]);

  const handleUrlChange = (value: string) => {
    updateField('youtubeUrl', value);
  };

  const handleStartTimeChange = (value: number) => {
    updateField('musicStartTime', Math.min(300, Math.max(0, value)));
  };

  const handleNext = () => {
    if (validateUrl(data.youtubeUrl)) {
      nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <FullscreenStep
      emoji="🎵"
      title="Música de Fundo"
      subtitle="Adicione uma música do YouTube para tocar na sua mensagem (opcional)"
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* YouTube URL Field */}
        <div className="space-y-2">
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
            Link do YouTube
          </label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="youtubeUrl"
              type="url"
              value={data.youtubeUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                error 
                  ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
              } transition-colors`}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <p className="text-xs text-gray-500">
            Cole o link de qualquer vídeo do YouTube
          </p>
        </div>

        {/* Start Time Slider */}
        {videoId && (
          <div className="space-y-2">
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              Começar a música em: {formatTime(data.musicStartTime)}
            </label>
            <input
              id="startTime"
              type="range"
              min={0}
              max={300}
              value={data.musicStartTime}
              onChange={(e) => handleStartTimeChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0:00</span>
              <span>5:00</span>
            </div>
          </div>
        )}

        {/* Video Preview */}
        {videoId && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Prévia
            </label>
            <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?start=${data.musicStartTime}`}
                title="YouTube video preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <a
              href={`https://youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700"
            >
              <ExternalLink size={14} />
              Abrir no YouTube
            </a>
          </div>
        )}

        {/* Suggestions */}
        {!videoId && (
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <p className="text-sm font-medium text-pink-800 mb-2">💡 Dicas:</p>
            <ul className="text-sm text-pink-700 space-y-1">
              <li>• Escolha uma música que tenha significado para vocês</li>
              <li>• Músicas românticas funcionam muito bem</li>
              <li>• A música tocará automaticamente quando a pessoa abrir</li>
            </ul>
          </div>
        )}

        {/* Skip message */}
        {!data.youtubeUrl && (
          <p className="text-center text-sm text-gray-500">
            Você pode pular esta etapa se preferir
          </p>
        )}

        <WizardNavigation
          onNext={handleNext}
          onPrev={handlePrev}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={ui.isAutoSaving}
          canProceed={!error}
          nextLabel="Continuar →"
        />
      </div>
    </FullscreenStep>
  );
}
