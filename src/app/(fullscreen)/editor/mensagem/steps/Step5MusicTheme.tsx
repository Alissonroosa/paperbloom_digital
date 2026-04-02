'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';
import { BACKGROUND_COLORS, THEME_OPTIONS } from '@/types/wizard';
import { Music, ExternalLink, Check, Eye, Palette } from 'lucide-react';

// Popular emoji options for the falling animation
const EMOJI_OPTIONS = [
  { emoji: '❤️', label: 'Coração' },
  { emoji: '💕', label: 'Corações' },
  { emoji: '💖', label: 'Coração brilhante' },
  { emoji: '💝', label: 'Coração com laço' },
  { emoji: '🌹', label: 'Rosa' },
  { emoji: '🌸', label: 'Flor de cerejeira' },
  { emoji: '✨', label: 'Brilhos' },
  { emoji: '⭐', label: 'Estrela' },
  { emoji: '🦋', label: 'Borboleta' },
  { emoji: '🌈', label: 'Arco-íris' },
  { emoji: '💫', label: 'Estrela cadente' },
  { emoji: '🎀', label: 'Laço' },
];

/**
 * Step 5: Música e Tema
 * YouTube music and visual theme selection combined
 */
export function Step5MusicTheme() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { data, updateField, ui } = useWizard();
  
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'music' | 'theme'>('music');

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
      return true;
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
    setStepValidation(4, { isValid, errors: error ? { youtubeUrl: error } : {} });
  }, [data.youtubeUrl]);

  const handleUrlChange = (value: string) => {
    updateField('youtubeUrl', value);
  };

  const handleStartTimeChange = (value: number) => {
    updateField('musicStartTime', Math.min(300, Math.max(0, value)));
  };

  const handleColorSelect = (color: string) => {
    updateField('backgroundColor', color);
  };

  const handleThemeSelect = (theme: typeof data.theme) => {
    updateField('theme', theme);
  };

  const handleEmojiSelect = (emoji: string) => {
    updateField('customEmoji', emoji);
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
      title="Trilha sonora e visual"
      subtitle="Escolha uma música especial e personalize as cores da sua mensagem"
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Tab Selector */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('music')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'music'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Music size={16} />
            Música
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'theme'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Palette size={16} />
            Cores
          </button>
        </div>

        {/* Music Tab */}
        {activeTab === 'music' && (
          <div className="space-y-6">
            {/* YouTube URL Field */}
            <div className="space-y-2">
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
                Qual música representa vocês? 🎶
              </label>
              <div className="relative">
                <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="youtubeUrl"
                  type="url"
                  value={data.youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="Cole o link do YouTube aqui..."
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border ${
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
                A música tocará automaticamente quando a pessoa abrir sua mensagem
              </p>
            </div>

            {/* Start Time Slider */}
            {videoId && (
              <div className="space-y-2">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Começar em: {formatTime(data.musicStartTime)}
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
                <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 bg-black">
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
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <p className="text-sm font-medium text-purple-800 mb-2">💡 Dicas:</p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Escolha "a música de vocês"</li>
                  <li>• Músicas românticas funcionam muito bem</li>
                  <li>• Pode ser a música do primeiro encontro</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            {/* Background Color Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Cor de Fundo 🎨
              </label>
              
              <div className="grid grid-cols-5 gap-3">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorSelect(color.value)}
                    className={`relative aspect-square rounded-xl border-2 transition-all ${
                      data.backgroundColor === color.value
                        ? 'border-pink-500 ring-2 ring-pink-200 scale-110'
                        : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    aria-label={`Selecionar cor ${color.name}`}
                  >
                    {data.backgroundColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-5 h-5 text-pink-600 drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Custom Color Picker */}
              <div className="flex items-center gap-3 pt-2">
                <label className="text-sm text-gray-600">Cor personalizada:</label>
                <input
                  type="color"
                  value={data.backgroundColor}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Estilo Visual ✨
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleThemeSelect(theme.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      data.theme === theme.value
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-800">{theme.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Emoji da Animação 🎉
              </label>
              <p className="text-xs text-gray-500">
                Esse emoji vai cair suavemente pela tela quando a pessoa abrir sua mensagem
              </p>
              
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_OPTIONS.map((option) => (
                  <button
                    key={option.emoji}
                    onClick={() => handleEmojiSelect(option.emoji)}
                    className={`aspect-square rounded-xl border-2 text-2xl flex items-center justify-center transition-all hover:scale-110 ${
                      data.customEmoji === option.emoji
                        ? 'border-pink-500 bg-pink-50 scale-110'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    title={option.label}
                    aria-label={`Selecionar ${option.label}`}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
              
              {data.customEmoji && (
                <p className="text-center text-sm text-pink-600">
                  Emoji selecionado: {data.customEmoji}
                </p>
              )}
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Prévia
              </label>
              <div
                className="p-6 rounded-xl border border-gray-200 text-center shadow-sm relative overflow-hidden"
                style={{ backgroundColor: data.backgroundColor }}
              >
                {/* Falling emoji preview */}
                {data.customEmoji && (
                  <div className="absolute inset-0 pointer-events-none opacity-30">
                    <span className="absolute top-2 left-4 text-2xl animate-bounce">{data.customEmoji}</span>
                    <span className="absolute top-8 right-8 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>{data.customEmoji}</span>
                    <span className="absolute top-4 right-1/3 text-lg animate-bounce" style={{ animationDelay: '0.4s' }}>{data.customEmoji}</span>
                  </div>
                )}
                <p className="text-lg font-serif text-gray-800">
                  Para: {data.recipientName || 'Amor'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Tema: {THEME_OPTIONS.find(t => t.value === data.theme)?.name}
                </p>
                {data.customEmoji && (
                  <p className="text-sm text-gray-500 mt-1">
                    Emoji: {data.customEmoji}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Demo Link */}
        <div className="text-center pt-2">
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
          isLoading={ui.isAutoSaving}
          canProceed={!error}
          nextLabel="Continuar →"
        />
      </div>
    </FullscreenStep>
  );
}
