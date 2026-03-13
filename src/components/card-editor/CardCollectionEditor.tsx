'use client';

import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { WizardStepper } from '@/components/wizard/WizardStepper';
import { CardEditorStep } from './CardEditorStep';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Loader2, Save, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface CardCollectionEditorProps {
  onFinalize: () => Promise<void>;
  isProcessing?: boolean;
}

/**
 * Card labels for the 12 cards
 */
const CARD_LABELS = [
  'Dia Difícil',
  'Insegurança',
  'Distância',
  'Estresse',
  'Amor',
  'Aniversário',
  'Conquista',
  'Chuva',
  'Briga',
  'Risada',
  'Irritação',
  'Insônia',
];

/**
 * CardCollectionEditor Component
 * Main wizard component for editing 12 cards
 * 
 * Features:
 * - Adapted WizardStepper for 12 steps
 * - Progress indicator
 * - Navigation between cards
 * - CardEditorStep integration
 * - Finalization button
 * - Auto-save indicator
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.6
 */
export function CardCollectionEditor({ onFinalize, isProcessing = false }: CardCollectionEditorProps) {
  const {
    cards,
    currentCardIndex,
    totalCards,
    isFirstCard,
    isLastCard,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    nextCard,
    previousCard,
    goToCard,
    canProceedToCheckout,
  } = useCardCollectionEditor();

  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Calculate completed cards (cards with title and message)
  const completedCards = new Set<number>(
    cards
      .map((card, index) => ({
        index: index + 1,
        isComplete: card.title.trim().length > 0 && 
                   card.messageText.trim().length > 0 && 
                   card.messageText.length <= 500
      }))
      .filter(item => item.isComplete)
      .map(item => item.index)
  );

  /**
   * Handle step click navigation
   * Requirement: 8.3
   */
  const handleStepClick = (step: number) => {
    // Convert 1-based step to 0-based index
    goToCard(step - 1);
  };

  /**
   * Handle next button
   * Requirement: 8.3
   */
  const handleNext = () => {
    if (!isLastCard) {
      nextCard();
    }
  };

  /**
   * Handle previous button
   * Requirement: 8.3
   */
  const handlePrevious = () => {
    if (!isFirstCard) {
      previousCard();
    }
  };

  /**
   * Handle finalize button
   * Requirement: 8.6
   */
  const handleFinalize = async () => {
    if (canProceedToCheckout()) {
      await onFinalize();
    }
  };

  /**
   * Format last saved time
   */
  const formatLastSaved = (date: Date | null): string => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 10) return 'agora mesmo';
    if (diffSecs < 60) return `há ${diffSecs} segundos`;
    if (diffMins === 1) return 'há 1 minuto';
    if (diffMins < 60) return `há ${diffMins} minutos`;
    
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  /**
   * Calculate progress percentage
   * Requirement: 8.2
   */
  const progressPercentage = Math.round((completedCards.size / totalCards) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container px-4 md:px-8 py-6 md:py-8 max-w-screen-2xl mx-auto">
        {/* Auto-save indicator */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-3">
            <div className="flex items-center gap-3">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-gray-600">Salvando...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Alterações não salvas</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    Salvo {formatLastSaved(lastSaved)}
                  </span>
                </>
              ) : null}
            </div>
            
            {/* Progress indicator - Requirement: 8.2 */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {completedCards.size} de {totalCards} cartas
              </span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progresso: ${progressPercentage}%`}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: Card Editor */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 space-y-6">
              {/* Wizard Stepper - Requirement: 8.1 */}
              <div className="pb-4 border-b">
                <WizardStepper
                  currentStep={currentCardIndex + 1}
                  totalSteps={totalCards}
                  completedSteps={completedCards}
                  onStepClick={handleStepClick}
                  stepLabels={CARD_LABELS}
                />
              </div>

              {/* Card Editor Step - Requirement: 8.3 */}
              <CardEditorStep />

              {/* Navigation Buttons - Requirement: 8.3 */}
              <div className="flex justify-between pt-6 border-t gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstCard}
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="Voltar para carta anterior"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                  Anterior
                </Button>

                {isLastCard ? (
                  <Button
                    onClick={handleFinalize}
                    disabled={isProcessing || !canProceedToCheckout()}
                    className="min-h-[44px] min-w-[44px]"
                    aria-label="Finalizar e ir para pagamento"
                    aria-busy={isProcessing}
                    title={
                      !canProceedToCheckout() 
                        ? 'Complete todas as cartas antes de finalizar' 
                        : 'Finalizar e ir para pagamento'
                    }
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Processando...
                      </>
                    ) : (
                      <>
                        Finalizar
                        <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={isLastCard}
                    className="min-h-[44px] min-w-[44px]"
                    aria-label="Avançar para próxima carta"
                  >
                    Próxima
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Preview/Info Panel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 sticky top-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Sobre as 12 Cartas
                </h3>
                <p className="text-sm text-gray-600">
                  Você está criando um conjunto especial de 12 mensagens que só podem 
                  ser abertas uma única vez cada. Personalize cada carta com uma mensagem 
                  única, foto e música.
                </p>
              </div>

              {/* Progress Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Progresso das Cartas
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 12 }, (_, i) => {
                    const cardNumber = i + 1;
                    const isCompleted = completedCards.has(cardNumber);
                    const isCurrent = currentCardIndex === i;
                    
                    return (
                      <button
                        key={cardNumber}
                        onClick={() => handleStepClick(cardNumber)}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center
                          text-xs font-semibold transition-all
                          ${isCurrent 
                            ? 'bg-blue-500 text-white ring-2 ring-blue-300' 
                            : isCompleted 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }
                        `}
                        aria-label={`Ir para carta ${cardNumber}`}
                        title={CARD_LABELS[i]}
                      >
                        {cardNumber}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Card Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Carta Atual
                </h4>
                <p className="text-sm text-blue-800">
                  <strong>Carta {currentCardIndex + 1}:</strong> {CARD_LABELS[currentCardIndex]}
                </p>
              </div>

              {/* Tips */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">
                  💡 Dicas
                </h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Cada carta pode ter até 500 caracteres</li>
                  <li>• Foto e música são opcionais</li>
                  <li>• Suas alterações são salvas automaticamente</li>
                  <li>• Você pode navegar entre as cartas livremente</li>
                </ul>
              </div>

              {/* Finalize Info */}
              {completedCards.size === totalCards && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">
                    ✅ Pronto para Finalizar!
                  </h4>
                  <p className="text-sm text-green-800">
                    Todas as cartas estão completas. Clique em "Finalizar" para 
                    prosseguir para o pagamento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
