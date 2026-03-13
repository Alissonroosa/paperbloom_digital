'use client';

import { useWizard } from '@/contexts/WizardContext';
import { WizardStepper } from './WizardStepper';
import { PreviewPanel } from './PreviewPanel';
import { WizardAutoSaveIndicator } from './WizardAutoSaveIndicator';
import { STEP_LABELS } from '@/types/wizard';
import {
  Step1PageTitleURL,
  Step2SpecialDate,
  Step3MainMessage,
  Step4PhotoUpload,
  Step5ThemeCustomization,
  Step6MusicSelection,
  Step7ContactInfo,
} from './steps';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useWizardAutoSave } from '@/hooks/useWizardAutoSave';
import { useState } from 'react';

interface WizardEditorProps {
  onPaymentClick: () => Promise<void>;
  isCreatingCheckout: boolean;
}

/**
 * WizardEditor Component
 * Main wizard component that orchestrates all 7 steps with preview
 */
export function WizardEditor({ onPaymentClick, isCreatingCheckout }: WizardEditorProps) {
  const {
    currentStep,
    data,
    uploads,
    ui,
    stepValidation,
    completedSteps,
    setStep,
    updateUIState,
    nextStep,
    previousStep,
    validateCurrentStep,
    canNavigateToStep,
    resetState,
  } = useWizard();

  // Auto-save functionality
  const { isSaving, lastSaved, clear: clearAutoSave } = useWizardAutoSave({
    key: 'paperbloom-wizard-draft',
    state: {
      currentStep,
      data,
      uploads,
      ui,
      stepValidation,
      completedSteps,
    },
    debounceMs: 2000,
    enabled: true,
  });

  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Handle step navigation
  const handleStepClick = (step: number) => {
    if (canNavigateToStep(step)) {
      setStep(step);
    }
  };

  // Handle next button
  const handleNext = () => {
    const isValid = validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  // Handle start over
  const handleStartOver = () => {
    if (confirm('Tem certeza que deseja recomeçar? Todos os dados serão perdidos.')) {
      resetState();
      clearAutoSave();
    }
  };

  // Handle payment
  const handlePayment = async () => {
    const isValid = validateCurrentStep();
    if (isValid) {
      await onPaymentClick();
      clearAutoSave();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container px-4 md:px-8 py-6 md:py-8 max-w-screen-2xl mx-auto">
        {/* Auto-save indicator */}
        <div className="mb-4 md:mb-6">
          <WizardAutoSaveIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            onStartOver={handleStartOver}
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left: Wizard Steps */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 space-y-6">
              {/* Wizard Stepper - Inside the box */}
              <div className="pb-4 border-b">
                <WizardStepper
                  currentStep={currentStep}
                  totalSteps={7}
                  completedSteps={completedSteps}
                  onStepClick={handleStepClick}
                  stepLabels={STEP_LABELS}
                />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-serif font-bold text-text-main">
                  {STEP_LABELS[currentStep - 1]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Passo {currentStep} de 7
                </p>
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                {currentStep === 1 && <Step1PageTitleURL />}
                {currentStep === 2 && <Step2SpecialDate />}
                {currentStep === 3 && <Step3MainMessage />}
                {currentStep === 4 && <Step4PhotoUpload />}
                {currentStep === 5 && <Step5ThemeCustomization />}
                {currentStep === 6 && <Step6MusicSelection />}
                {currentStep === 7 && <Step7ContactInfo />}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t gap-3">
                <Button
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 1}
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="Voltar para etapa anterior"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
                  Voltar
                </Button>

                {currentStep < 7 ? (
                  <Button
                    onClick={handleNext}
                    className="min-h-[44px] min-w-[44px]"
                    aria-label="Avançar para próxima etapa"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    onClick={handlePayment}
                    disabled={isCreatingCheckout}
                    className="min-h-[44px] min-w-[44px]"
                    aria-label="Continuar para pagamento"
                    aria-busy={isCreatingCheckout}
                  >
                    {isCreatingCheckout ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Processando...
                      </>
                    ) : (
                      <>
                        Ir para Pagamento
                        <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Mobile Preview Button */}
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  onClick={() => setShowMobilePreview(!showMobilePreview)}
                  className="w-full min-h-[44px]"
                  aria-label={showMobilePreview ? 'Ocultar visualização' : 'Mostrar visualização'}
                >
                  {showMobilePreview ? 'Ocultar' : 'Ver'} Visualização
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Preview Panel - Hidden on mobile unless toggled */}
          <div className={`lg:col-span-7 xl:col-span-8 ${showMobilePreview ? 'block' : 'hidden lg:block'}`}>
            <PreviewPanel
              data={data}
              uploads={uploads}
              viewMode={ui.previewMode}
              onViewModeChange={(mode) => updateUIState({ previewMode: mode })}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
