'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useWizard } from '@/contexts/WizardContext';
import { extractYouTubeVideoId } from '@/lib/wizard-utils';
import { Music, Play, AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Step 6: Music Selection Component
 * Allows users to add background music from YouTube
 * Features:
 * - YouTube URL input with validation
 * - Video ID extraction from various URL formats
 * - Music start time slider (0-300 seconds)
 * - Music preview player
 * - Optional skip functionality
 */
export function Step6MusicSelection() {
  const { data, updateField } = useWizard();
  const [urlError, setUrlError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isValidUrl, setIsValidUrl] = useState(false);

  // Validate YouTube URL and extract video ID
  useEffect(() => {
    if (!data.youtubeUrl || data.youtubeUrl.trim() === '') {
      setUrlError(null);
      setVideoId(null);
      setIsValidUrl(false);
      return;
    }

    // Check if URL matches YouTube domain pattern
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
    if (!youtubePattern.test(data.youtubeUrl)) {
      setUrlError('Deve ser uma URL do YouTube válida');
      setVideoId(null);
      setIsValidUrl(false);
      return;
    }

    // Extract video ID
    const extractedId = extractYouTubeVideoId(data.youtubeUrl);
    if (!extractedId) {
      setUrlError('Não foi possível extrair o ID do vídeo. Verifique a URL.');
      setVideoId(null);
      setIsValidUrl(false);
      return;
    }

    // Valid URL with extracted video ID
    setUrlError(null);
    setVideoId(extractedId);
    setIsValidUrl(true);
  }, [data.youtubeUrl]);

  // Handle URL input change
  const handleUrlChange = (url: string) => {
    updateField('youtubeUrl', url);
  };

  // Handle start time change
  const handleStartTimeChange = (time: number) => {
    updateField('musicStartTime', time);
  };

  // Clear music selection
  const handleClearMusic = () => {
    updateField('youtubeUrl', '');
    updateField('musicStartTime', 0);
  };

  // Format time in MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Seleção de Música
        </h2>
        <p className="text-gray-600">
          Adicione uma trilha sonora especial do YouTube (opcional).
        </p>
      </div>

      {/* YouTube URL Input */}
      <div className="space-y-3">
        <Label htmlFor="youtubeUrl">
          URL do YouTube
          <span className="text-gray-500 font-normal ml-2">(opcional)</span>
        </Label>
        <div className="relative">
          <Input
            id="youtubeUrl"
            type="url"
            value={data.youtubeUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`pr-10 ${urlError ? 'border-red-500 focus:ring-red-500' : ''} ${
              isValidUrl ? 'border-green-500 focus:ring-green-500' : ''
            }`}
            aria-invalid={!!urlError}
            aria-describedby={urlError ? 'url-error' : undefined}
          />
          {data.youtubeUrl && (
            <button
              type="button"
              onClick={handleClearMusic}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              aria-label="Limpar URL"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* URL Validation Feedback */}
        {urlError && (
          <div
            id="url-error"
            className="flex items-start gap-2 text-sm text-red-600"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{urlError}</span>
          </div>
        )}

        {isValidUrl && videoId && (
          <div className="flex items-start gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>URL válida! ID do vídeo: {videoId}</span>
          </div>
        )}

        <p className="text-sm text-gray-600">
          Cole a URL de um vídeo do YouTube. Formatos aceitos:
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 ml-2">
          <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
          <li>https://youtu.be/VIDEO_ID</li>
          <li>https://www.youtube.com/embed/VIDEO_ID</li>
        </ul>
      </div>

      {/* Music Start Time Slider */}
      {isValidUrl && videoId && (
        <div className="space-y-3">
          <Label htmlFor="musicStartTime">
            Tempo de Início da Música
          </Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Início: {formatTime(data.musicStartTime)}</span>
              <span className="text-gray-500">Máximo: 5:00</span>
            </div>
            <input
              id="musicStartTime"
              type="range"
              min="0"
              max="300"
              step="5"
              value={data.musicStartTime}
              onChange={(e) => handleStartTimeChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Tempo de início da música em segundos"
              aria-valuemin={0}
              aria-valuemax={300}
              aria-valuenow={data.musicStartTime}
              aria-valuetext={`${formatTime(data.musicStartTime)}`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0:00</span>
              <span>1:00</span>
              <span>2:00</span>
              <span>3:00</span>
              <span>4:00</span>
              <span>5:00</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Escolha em que momento do vídeo a música deve começar a tocar.
          </p>
        </div>
      )}

      {/* Music Preview Player */}
      {isValidUrl && videoId && (
        <div className="space-y-3">
          <Label>Prévia da Música</Label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?start=${data.musicStartTime}`}
                title="Prévia da música do YouTube"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Play className="w-4 h-4" />
            <span>
              A música começará em {formatTime(data.musicStartTime)} quando o destinatário abrir a mensagem.
            </span>
          </div>
        </div>
      )}

      {/* Skip Option Info */}
      {!data.youtubeUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Music className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Música Opcional
            </h3>
            <p className="text-sm text-blue-800">
              Adicionar música é opcional. Você pode pular esta etapa e continuar 
              sem música de fundo, ou voltar mais tarde para adicionar.
            </p>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          💡 Dicas para Escolher a Música
        </h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Escolha uma música que tenha significado especial para o destinatário</li>
          <li>Considere músicas instrumentais para não competir com a mensagem</li>
          <li>Ajuste o tempo de início para pular introduções longas</li>
          <li>Teste a prévia para garantir que a música começa no momento certo</li>
        </ul>
      </div>

      {/* Copyright Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-yellow-900 mb-1">
          ⚠️ Aviso de Direitos Autorais
        </h3>
        <p className="text-sm text-yellow-800">
          Certifique-se de que você tem o direito de usar a música escolhida. 
          O Paper Bloom não se responsabiliza por violações de direitos autorais.
        </p>
      </div>
    </div>
  );
}
