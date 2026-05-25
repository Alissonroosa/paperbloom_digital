'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation } from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Search, Link as LinkIcon, Music, X, Camera, Loader2, Crop as CropIcon, RotateCcw, RotateCw, RefreshCw } from 'lucide-react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { getCroppedImage, fixImageOrientation } from '@/lib/crop-image';
import { Button } from '@/components/ui/Button';
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
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  // Crop modal state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropPos, setCropPos] = useState<Point>({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropFileName, setCropFileName] = useState<string>('cover.jpg');

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
      if (collection.coverImageUrl) {
        setCoverImageUrl(collection.coverImageUrl);
      }
    }
  }, [collection]);

  const resetCropState = () => {
    setCropPos({ x: 0, y: 0 });
    setCropZoom(1);
    setCropRotation(0);
    setCroppedAreaPixels(null);
  };

  const openCropFromFile = async (file: File) => {
    setCoverError(null);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setCoverError('Use uma imagem JPG, PNG ou WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverError('Imagem maior que 5MB. Tente uma menor.');
      return;
    }

    try {
      const fixedUrl = await fixImageOrientation(file);
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(fixedUrl);
      setCropFileName(file.name || 'cover.jpg');
      resetCropState();
      setCropOpen(true);
    } catch (err) {
      console.error('Cover prepare failed:', err);
      setCoverError('Não foi possível abrir a foto. Tente outra.');
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await openCropFromFile(file);
  };

  const handleAdjustExisting = async () => {
    if (!coverImageUrl) return;
    setCoverError(null);
    try {
      const res = await fetch(coverImageUrl);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(URL.createObjectURL(blob));
      setCropFileName('cover-adjusted.jpg');
      resetCropState();
      setCropOpen(true);
    } catch (err) {
      console.error('Adjust existing failed:', err);
      setCoverError('Não foi possível abrir esta foto para ajuste. Tente trocar a foto.');
    }
  };

  const onCropComplete = (_a: Area, areaPx: Area) => {
    setCroppedAreaPixels(areaPx);
  };

  const handleCropCancel = () => {
    setCropOpen(false);
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    resetCropState();
  };

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setIsUploadingCover(true);
    setCoverError(null);
    try {
      const croppedFile = await getCroppedImage(cropSrc, croppedAreaPixels, cropRotation, cropFileName);
      const formData = new FormData();
      formData.append('image', croppedFile);
      const res = await fetch('/api/upload/card-image', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Falha no upload');
      const data = await res.json();
      setCoverImageUrl(data.url);
      setCropOpen(false);
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
      resetCropState();
    } catch (err) {
      console.error('Cover upload failed:', err);
      setCoverError('Não foi possível enviar a foto. Tente novamente.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverImageUrl(null);
    setCoverError(null);
  };

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
        coverImageUrl,
      });
      nextStep();
    } catch (error) {
      console.error('Failed to save intro and music:', error);
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const recipientName = collection?.recipientName?.trim() || 'a pessoa';

  return (
    <FullscreenStep
      emoji="✨"
      title="A abertura do presente"
      subtitle={`O que ${recipientName} vai ler e ouvir antes das 12 cartas`}
      showProgress={true}
      showBackLink={false}
      showPriceBadge={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
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

          <p className="text-xs text-gray-500">
            A música tocará quando {recipientName} abrir cada carta 🎶
          </p>
        </div>

        {/* Intro Message */}
        <div className="space-y-2">
          <label htmlFor="introMessage" className="block text-sm font-medium text-gray-700">
            💬 Mensagem para {recipientName} (opcional)
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

        {/* Cover Photo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            📸 Foto da capa (opcional)
          </label>

          {coverImageUrl ? (
            <div className="flex items-center gap-3 rounded-xl border-2 border-purple-200 bg-white p-3 shadow-sm">
              <img
                src={coverImageUrl}
                alt="Foto da capa"
                className="w-20 aspect-[3/4] object-cover rounded-lg bg-gray-100 shrink-0"
              />
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={handleAdjustExisting}
                  disabled={isUploadingCover}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors disabled:opacity-50"
                >
                  <CropIcon size={13} />
                  Ajustar enquadramento
                </button>
                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer">
                  <RefreshCw size={13} />
                  Trocar foto
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleCoverFileChange}
                    disabled={isUploadingCover}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  disabled={isUploadingCover}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <X size={13} />
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <label
              className={`flex items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                isUploadingCover
                  ? 'border-purple-300 bg-purple-50/60 cursor-wait'
                  : 'border-purple-200 bg-purple-50/40 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleCoverFileChange}
                disabled={isUploadingCover}
                className="hidden"
              />
              {isUploadingCover ? (
                <>
                  <Loader2 size={20} className="text-purple-500 animate-spin" />
                  <p className="text-sm text-purple-700 font-medium">Enviando...</p>
                </>
              ) : (
                <>
                  <Camera size={20} className="text-purple-400" />
                  <p className="text-sm text-purple-700 font-medium">Escolher foto da capa</p>
                </>
              )}
            </label>
          )}

          {coverError && (
            <p className="text-sm text-red-600">{coverError}</p>
          )}

          <p className="text-xs text-gray-500">
            Será usada como fundo das cartas que você não personalizar individualmente. JPG, PNG ou WebP até 5MB.
          </p>
        </div>

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

      {/* Crop Modal */}
      <AnimatePresence>
        {cropOpen && cropSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-0 sm:p-4"
            onClick={isUploadingCover ? undefined : handleCropCancel}
          >
            <div
              className="bg-white w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl sm:shadow-2xl sm:max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <CropIcon size={16} className="text-purple-500" />
                  Ajustar foto da capa
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Arraste para posicionar · pinça/scroll para zoom
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="relative w-full aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden max-h-[55vh]">
                  <Cropper
                    image={cropSrc}
                    crop={cropPos}
                    zoom={cropZoom}
                    rotation={cropRotation}
                    aspect={3 / 4}
                    onCropChange={setCropPos}
                    onZoomChange={setCropZoom}
                    onRotationChange={setCropRotation}
                    onCropComplete={onCropComplete}
                    showGrid={true}
                    minZoom={1}
                    maxZoom={3}
                  />
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCropRotation((r) => ((r - 90) % 360 + 360) % 360)}
                    className="min-h-[40px] min-w-[40px]"
                    aria-label="Girar para esquerda"
                  >
                    <RotateCcw size={16} />
                  </Button>
                  <span className="text-xs text-gray-500 min-w-[36px] text-center">
                    {cropRotation}°
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCropRotation((r) => (r + 90) % 360)}
                    className="min-h-[40px] min-w-[40px]"
                    aria-label="Girar para direita"
                  >
                    <RotateCw size={16} />
                  </Button>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCropCancel}
                  disabled={isUploadingCover}
                  className="flex-1 min-h-[44px]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCropConfirm}
                  disabled={isUploadingCover || !croppedAreaPixels}
                  className="flex-1 min-h-[44px]"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CropIcon size={16} className="mr-2" />
                      Confirmar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FullscreenStep>
  );
}
