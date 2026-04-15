'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation } from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Search, Link as LinkIcon, Music, X } from 'lucide-react';
import { YouTubeSearch } from '@/components/interactive-wizard/YouTubeSearch';

const MESSAGE_SUGGESTIONS = [
  {
    label: '💕 Para o amor',
    text: 'Preparei essas cartas com todo o meu amor para você. Cada uma guarda um pedacinho do que sinto, e espero que ao abrir cada uma, você sinta o quanto é especial para mim.',
  },
  {
    label: '🎂 Aniversário',
    text: 'Hoje é o seu dia e eu queria celebrar de um jeito diferente. Essas 12 cartas representam 12 razões pelas quais você faz minha vida mais bonita. Feliz aniversário!',
  },
  {
    label: '👩‍👧 Para a mãe',
    text: 'Mãe, palavras nunca serão suficientes para expressar tudo que você significa para mim. Mas tentei colocar um pouquinho desse amor em cada uma dessas cartas. Obrigado por tudo.',
  },
  {
    label: '👨‍👧 Para o pai',
    text: 'Pai, você sempre foi meu exemplo e meu porto seguro. Escrevi essas cartas pensando em tudo que aprendi com você e em como sou grato por ter você na minha vida.',
  },
  {
    label: '👫 Para a amizade',
    text: 'Amizades como a nossa são raras e preciosas. Escrevi essas cartas para te lembrar o quanto você é importante para mim e o quanto nossa amizade significa.',
  },
  {
    label: '🎓 Formatura',
    text: 'Você chegou até aqui com muito esforço e dedicação! Essas cartas são uma forma de celebrar cada conquista sua e te lembrar de que estou aqui, orgulhoso(a) de você.',
  },
];

/**
 * Step 2: Mensagem Inicial + Música
 * Introduction message and background music for the card collection
 */
export function Step2Intro() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { collection, updateCollection, isSaving } = useCardCollectionEditor();
  
  const [introMessage, setIntroMessage] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [musicMode, setMusicMode] = useState<'search' | 'link'>('search');
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  // Sync with collection data
  useEffect(() => {
    if (collection) {
      if (collection.introMessage) {
        setIntroMessage(collection.introMessage);
      }
      if (collection.youtubeVideoId) {
        setVideoId(collection.youtubeVideoId);
        setYoutubeUrl(`https://www.youtube.com/watch?v=${collection.youtubeVideoId}`);
      }
    }
  }, [collection]);

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    if (!url.trim()) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url);
    setUrlError(null);
    setSelectedTitle(null);

    if (!url.trim()) {
      setVideoId(null);
      return;
    }

    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
    } else {
      setVideoId(null);
      setUrlError('URL do YouTube inválida');
    }
  };

  const handleSearchSelect = (selectedVideoId: string, title: string) => {
    setVideoId(selectedVideoId);
    setYoutubeUrl(`https://www.youtube.com/watch?v=${selectedVideoId}`);
    setSelectedTitle(title);
    setUrlError(null);
  };

  const handleRemoveMusic = () => {
    setVideoId(null);
    setYoutubeUrl('');
    setSelectedTitle(null);
    setUrlError(null);
  };

  const handleNext = async () => {
    if (!collection || urlError) return;
    
    try {
      await updateCollection(collection.id, {
        introMessage: introMessage.trim() || null,
        youtubeVideoId: videoId,
      });
      nextStep();
    } catch (error) {
      console.error('Failed to save intro and music:', error);
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  return (
    <FullscreenStep
      emoji="✨"
      title="Personalize a experiência"
      subtitle="Adicione uma mensagem de abertura e uma música especial"
      showProgress={true}
      showBackLink={false}
      showDemoLink={true}
      demoLinkHref="/demo/card-collection"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Intro Message */}
        <div className="space-y-2">
          <label htmlFor="introMessage" className="block text-sm font-medium text-gray-700">
            💬 Mensagem de abertura (opcional)
          </label>
          <textarea
            id="introMessage"
            value={introMessage}
            onChange={(e) => setIntroMessage(e.target.value)}
            placeholder="Ex: Preparei essas cartas com muito carinho para você. Cada uma foi escrita pensando em momentos especiais..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all resize-none"
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <Sparkles size={13} />
              Ver sugestões
              {showSuggestions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <p className="text-xs text-gray-500">
              {introMessage.length}/500
            </p>
          </div>

          {/* Suggestions Panel */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid gap-2 pt-1">
                  {MESSAGE_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      type="button"
                      onClick={() => {
                        setIntroMessage(suggestion.text);
                        setShowSuggestions(false);
                      }}
                      className="text-left p-3 rounded-xl border-2 border-purple-100 bg-purple-50 hover:border-purple-300 hover:bg-purple-100 transition-all"
                    >
                      <p className="text-xs font-semibold text-purple-700 mb-1">{suggestion.label}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{suggestion.text}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* YouTube Music */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            🎵 Música de fundo (opcional)
          </label>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMusicMode('search')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                musicMode === 'search'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search size={13} />
              Buscar música
            </button>
            <button
              type="button"
              onClick={() => setMusicMode('link')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                musicMode === 'link'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LinkIcon size={13} />
              Colar link
            </button>
          </div>

          {/* Search Mode */}
          {musicMode === 'search' && (
            <YouTubeSearch onSelect={handleSearchSelect} />
          )}

          {/* Link Mode */}
          {musicMode === 'link' && (
            <div className="space-y-2">
              <input
                id="youtubeUrl"
                type="url"
                value={youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                  urlError 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-pink-200 focus:border-pink-400'
                }`}
              />
              {urlError && (
                <p className="text-sm text-red-600">{urlError}</p>
              )}
            </div>
          )}

          {/* Selected Music Info */}
          {videoId && selectedTitle && musicMode === 'search' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2 bg-pink-50 border border-pink-200 rounded-xl"
            >
              <Music size={14} className="text-pink-500 flex-shrink-0" />
              <p className="text-xs text-pink-700 font-medium flex-1 line-clamp-1">{selectedTitle}</p>
              <button
                type="button"
                onClick={handleRemoveMusic}
                className="text-pink-400 hover:text-pink-600 transition-colors"
                aria-label="Remover música"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

          <p className="text-xs text-gray-500">
            A música tocará quando as cartas forem abertas 🎶
          </p>
        </div>

        {/* YouTube Preview */}
        {videoId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            <iframe
              width="100%"
              height="180"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video preview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        )}

        <WizardNavigation
          onNext={handleNext}
          onPrev={handlePrev}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={isSaving}
          canProceed={!urlError}
          nextLabel="Continuar →"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-gray-400 text-center"
        >
          Pode pular se preferir ir direto para as cartas 😊
        </motion.p>
      </div>
    </FullscreenStep>
  );
}
