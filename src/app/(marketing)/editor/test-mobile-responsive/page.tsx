'use client';

import { WizardProvider, useWizard } from '@/contexts/WizardContext';
import { WizardStepper } from '@/components/wizard/WizardStepper';
import { PreviewPanel } from '@/components/wizard/PreviewPanel';
import {
  Step1PageTitleURL,
  Step2SpecialDate,
  Step3MainMessage,
} from '@/components/wizard/steps';
import { Step4PhotoUpload } from '@/components/wizard/steps/Step4PhotoUpload';
import { Step5ThemeCustomization } from '@/components/wizard/steps/Step5ThemeCustomization';
import { Step6MusicSelection } from '@/components/wizard/steps/Step6MusicSelection';
import { Step7ContactInfo } from '@/components/wizard/steps/Step7ContactInfo';
import { STEP_LABELS } from '@/types/wizard';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, Smartphone, Monitor } from 'lucide-react';

/**
 * Mobile Responsive Wizard Test Page
 * 
 * This page demonstrates the complete mobile-responsive wizard implementation.
 * 
 * Features tested:
 * - Responsive layout (stacks vertically on mobile < 768px)
 * - Touch-friendly targets (minimum 44x44px)
 * - Floating preview button on mobile
 * - Proper text sizing for mobile readability
 * - Optimized spacing for small screens
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */
function MobileResponsiveWizardContent() {
  const {
    currentStep,
    data,
    uploads,
    ui,
    completedSteps,
    updateUIState,
    nextStep,
    previousStep,
    setStep,
  } = useWizard();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1PageTitleURL />;
      case 2:
        return <Step2SpecialDate />;
      case 3:
        return <Step3MainMessage />;
      case 4:
        return <Step4PhotoUpload />;
      case 5:
        return <Step5ThemeCustomization />;
      case 6:
        return <Step6MusicSelection />;
      case 7:
        return <Step7ContactInfo />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile-Optimized Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 md:hidden text-indigo-600" />
              <Monitor className="w-5 h-5 hidden md:block text-indigo-600" />
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                Mobile Wizard Test
              </h1>
            </div>
            <div className="text-xs md:text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Step {currentStep}/7
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Stepper - Responsive */}
        <div className="mb-6 md:mb-8">
          <WizardStepper
            currentStep={currentStep}
            totalSteps={7}
            completedSteps={completedSteps}
            onStepClick={setStep}
            stepLabels={STEP_LABELS}
          />
        </div>

        {/* Main Content Grid - Stacks on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Wizard Form - Full width on mobile */}
          <div className="w-full">
            {/* Step Content Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6 lg:p-8">
              {/* Step Title */}
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  {STEP_LABELS[currentStep - 1]}
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Preencha as informações abaixo
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-6">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons - Touch-friendly */}
              <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 1}
                  className="min-h-[44px] min-w-[44px] flex-1 md:flex-none"
                  aria-label="Voltar para etapa anterior"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">Voltar</span>
                </Button>

                <Button
                  onClick={nextStep}
                  disabled={currentStep === 7}
                  className="min-h-[44px] min-w-[44px] flex-1 md:flex-none"
                  aria-label={currentStep === 7 ? 'Finalizar' : 'Próxima etapa'}
                >
                  <span className="hidden sm:inline">
                    {currentStep === 7 ? 'Finalizar' : 'Próximo'}
                  </span>
                  <span className="sm:hidden">
                    {currentStep === 7 ? 'Fim' : 'Próx'}
                  </span>
                  {currentStep < 7 && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>

            {/* Mobile Tips Card - Only visible on mobile */}
            <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-100 lg:hidden">
              <h3 className="text-sm font-semibold text-indigo-900 mb-2">
                💡 Dica
              </h3>
              <p className="text-xs text-indigo-700">
                Use o botão flutuante no canto inferior direito para visualizar sua mensagem.
              </p>
            </div>

            {/* Desktop Info Card */}
            <div className="hidden lg:block mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                ✨ Recursos Mobile
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Layout responsivo (empilha verticalmente em mobile)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Alvos de toque mínimos de 44x44px</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Botão flutuante de preview em mobile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Texto otimizado para legibilidade mobile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Espaçamento otimizado para telas pequenas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Preview Panel - Hidden on mobile, shown via floating button */}
          <PreviewPanel
            data={data}
            uploads={uploads}
            viewMode={ui.previewMode}
            onViewModeChange={(mode) => updateUIState({ previewMode: mode })}
            className="hidden lg:block"
          />
        </div>

        {/* Mobile Testing Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📱 Como Testar em Mobile
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <p>
                <strong>Redimensione o navegador:</strong> Diminua a largura da janela para menos de 768px
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <p>
                <strong>Use DevTools:</strong> Abra as ferramentas de desenvolvedor (F12) e ative o modo de dispositivo móvel
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <p>
                <strong>Teste em dispositivo real:</strong> Acesse esta página em seu smartphone ou tablet
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <p>
                <strong>Verifique interações:</strong> Teste toques, rolagem e navegação entre etapas
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Mobile Responsive Wizard Test Page
 */
export default function TestMobileResponsivePage() {
  return (
    <WizardProvider>
      <MobileResponsiveWizardContent />
    </WizardProvider>
  );
}
