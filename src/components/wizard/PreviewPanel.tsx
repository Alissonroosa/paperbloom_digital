'use client';

import { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CinematicPreview } from '@/components/editor/CinematicPreview';
import { WizardFormData, WizardUploadStates } from '@/types/wizard';
import { cn } from '@/lib/utils';

export interface PreviewPanelProps {
  data: WizardFormData;
  uploads: WizardUploadStates;
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  className?: string;
}

/**
 * PreviewPanel Component
 * 
 * Displays real-time preview of the message in Desktop or Mobile view.
 * Features:
 * - Toggle between Desktop and Mobile views
 * - Real-time updates within 300ms
 * - Sticky positioning on desktop
 * - Floating button for mobile devices
 * - Persists view mode across navigation
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5
 */
export function PreviewPanel({
  data,
  uploads,
  viewMode,
  onViewModeChange,
  className,
}: PreviewPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Trigger re-render when data changes (debounced to 300ms max)
  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      setUpdateKey(prev => prev + 1);
    }, 100); // Update quickly but debounce rapid changes

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [data, uploads]);

  // Prepare data for preview components
  const previewData = {
    // Card preview props
    image: uploads.mainImage.url,
    message: data.mainMessage || 'Sua mensagem especial aparecerá aqui...',
    from: data.senderName || '...',
    to: data.recipientName || '...',
    youtubeLink: data.youtubeUrl,

    // Cinematic preview props
    title: data.pageTitle || 'Uma mensagem especial',
    specialDate: data.specialDate,
    mainImage: uploads.mainImage.url,
    galleryImages: uploads.galleryImages
      .map(img => img.url)
      .filter((url): url is string => url !== null),
    signature: data.signature || `Com carinho, ${data.senderName || '...'}`,
    closing: data.closingMessage || 'Obrigado por sentir isso.',
    
    // Theme customization
    backgroundColor: data.backgroundColor,
    theme: data.theme,
    customEmoji: data.customEmoji || null,
  };

  return (
    <>
      {/* Desktop Preview - Sticky */}
      <div
        className={cn(
          'hidden lg:block',
          className
        )}
      >
        <div className="sticky top-6">
          {/* View Mode Toggle */}
          <div className="mb-4 flex items-center justify-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <Button
              variant={viewMode === 'desktop' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('desktop')}
              className={cn(
                'flex-1 gap-2 transition-all',
                viewMode === 'desktop' && 'shadow-sm'
              )}
              aria-label="Visualização desktop"
              aria-pressed={viewMode === 'desktop'}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden xl:inline">Desktop</span>
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('mobile')}
              className={cn(
                'flex-1 gap-2 transition-all',
                viewMode === 'mobile' && 'shadow-sm'
              )}
              aria-label="Visualização mobile"
              aria-pressed={viewMode === 'mobile'}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden xl:inline">Mobile</span>
            </Button>
          </div>

          {/* Preview Content */}
          <div
            className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-lg"
            key={updateKey}
          >
            {viewMode === 'desktop' ? (
              <div className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                {/* MacBook Pro Mockup */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Screen */}
                  <div className="relative bg-gray-900 rounded-t-2xl shadow-2xl overflow-hidden border-[12px] border-gray-900 w-full max-w-full" style={{ height: 'calc(100% - 20px)' }}>
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[28px] bg-gray-900 rounded-b-3xl z-30" />
                    
                    {/* Screen Content */}
                    <div className="relative bg-white h-full overflow-hidden">
                      <div className="h-full overflow-auto" style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db #f3f4f6'
                      }}>
                        <CinematicPreview
                          data={previewData}
                          stage="full-view"
                          autoPlay={false}
                        />
                      </div>
                    </div>
                    
                    {/* Base/Keyboard */}
                    <div className="absolute bottom-[-12px] left-0 right-0 h-[12px] bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-2xl shadow-lg">
                      <div className="absolute inset-x-0 top-0 h-[2px] bg-gray-800/20" />
                    </div>
                    
                    {/* Bottom Stand */}
                    <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 h-[4px] w-[60%] bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-2">
                <div className="w-[280px] h-[560px] bg-black rounded-[3rem] shadow-2xl overflow-hidden relative">
                  {/* iPhone 16 Pro Max Frame */}
                  <div className="absolute inset-0 rounded-[3rem] border-[4px] border-gray-900 pointer-events-none z-20" />
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[120px] h-[36px] bg-black rounded-full z-30" />
                  
                  {/* Screen Content */}
                  <div className="absolute inset-[4px] bg-white rounded-[2.75rem] overflow-hidden">
                    <div className="h-full overflow-auto" style={{ 
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}>
                      <style jsx>{`
                        div::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      <div className="min-h-full" style={{ transform: 'scale(0.45)', transformOrigin: 'top left', width: '222%', height: '222%' }}>
                        <CinematicPreview
                          data={previewData}
                          stage="full-view"
                          autoPlay={false}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Side Buttons */}
                  <div className="absolute left-[-4px] top-[100px] w-[4px] h-[60px] bg-gray-900 rounded-l-sm" />
                  <div className="absolute left-[-4px] top-[170px] w-[4px] h-[60px] bg-gray-900 rounded-l-sm" />
                  <div className="absolute left-[-4px] top-[240px] w-[4px] h-[70px] bg-gray-900 rounded-l-sm" />
                  <div className="absolute right-[-4px] top-[170px] w-[4px] h-[100px] bg-gray-900 rounded-r-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Preview Label */}
          <div className="mt-3 text-center">
            <p className="text-xs text-muted-foreground">
              Visualização em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Preview - Floating Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setIsVisible(true)}
          className="rounded-full shadow-2xl h-14 w-14 p-0"
          aria-label="Abrir visualização"
        >
          <Eye className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile Preview - Full Screen Modal */}
      {isVisible && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Visualização</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="min-h-[44px] min-w-[44px]"
                aria-label="Fechar visualização"
              >
                ✕
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="mt-3 flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'desktop' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('desktop')}
                className="flex-1 gap-2 min-h-[44px]"
                aria-label="Visualização desktop"
                aria-pressed={viewMode === 'desktop'}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('mobile')}
                className="flex-1 gap-2 min-h-[44px]"
                aria-label="Visualização mobile"
                aria-pressed={viewMode === 'mobile'}
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </Button>
            </div>
          </div>

          {/* Preview Content */}
          <div
            className="overflow-auto h-[calc(100vh-120px)]"
            key={updateKey}
          >
            {viewMode === 'desktop' ? (
              <div className="relative min-h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-3">
                {/* MacBook Pro Mockup */}
                <div className="relative w-full max-w-[95%]">
                  {/* Screen */}
                  <div className="relative bg-gray-900 rounded-t-xl shadow-2xl overflow-hidden border-[8px] border-gray-900">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[18px] bg-gray-900 rounded-b-2xl z-30" />
                    
                    {/* Screen Content */}
                    <div className="relative bg-white aspect-[16/10] overflow-hidden">
                      <div className="h-full overflow-auto" style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db #f3f4f6'
                      }}>
                        <CinematicPreview
                          data={previewData}
                          stage="full-view"
                          autoPlay={false}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Base/Keyboard */}
                  <div className="relative h-[8px] bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-xl shadow-lg">
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gray-800/20" />
                  </div>
                  
                  {/* Bottom Stand */}
                  <div className="relative h-[3px] mx-auto w-[60%] bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-sm" />
                </div>
              </div>
            ) : (
              <div className="relative min-h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-3">
                <div className="w-full max-w-[320px] aspect-[430/932] bg-black rounded-[3rem] shadow-2xl overflow-hidden relative">
                  {/* iPhone 16 Pro Max Frame */}
                  <div className="absolute inset-0 rounded-[3rem] border-[4px] border-gray-900 pointer-events-none z-20" />
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[130px] h-[38px] bg-black rounded-full z-30" />
                  
                  {/* Screen Content */}
                  <div className="absolute inset-[4px] bg-white rounded-[2.75rem] overflow-hidden">
                    <div className="h-full overflow-auto" style={{ 
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}>
                      <style jsx>{`
                        div::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      <div className="min-h-full" style={{ transform: 'scale(0.45)', transformOrigin: 'top left', width: '222%', height: '222%' }}>
                        <CinematicPreview
                          data={previewData}
                          stage="full-view"
                          autoPlay={false}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Side Buttons */}
                  <div className="absolute left-[-4px] top-[110px] w-[4px] h-[65px] bg-gray-900 rounded-l-sm" />
                  <div className="absolute left-[-4px] top-[185px] w-[4px] h-[65px] bg-gray-900 rounded-l-sm" />
                  <div className="absolute left-[-4px] top-[260px] w-[4px] h-[75px] bg-gray-900 rounded-l-sm" />
                  <div className="absolute right-[-4px] top-[185px] w-[4px] h-[110px] bg-gray-900 rounded-r-sm" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
