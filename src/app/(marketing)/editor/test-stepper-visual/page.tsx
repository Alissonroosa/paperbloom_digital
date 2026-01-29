'use client';

import { useState } from 'react';
import { WizardStepper } from '@/components/wizard/WizardStepper';
import { STEP_LABELS } from '@/types/wizard';

export default function TestStepperVisualPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-text-main">
            Teste Visual do Stepper
          </h1>
          <p className="text-text-accent">
            Novo design com identidade visual Paper Bloom
          </p>
        </div>

        {/* Stepper dentro de uma box similar ao editor */}
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 space-y-6">
          {/* Stepper - Agora no topo da box */}
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

          {/* Controles de teste */}
          <div className="pt-6 border-t space-y-4">
            <div className="flex justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-4 py-2 bg-gray-100 text-text-main rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === 7}
                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo →
              </button>
            </div>
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-primary text-text-main rounded-lg hover:bg-secondary hover:text-white transition-colors"
            >
              Resetar
            </button>
          </div>

          {/* Info */}
          <div className="bg-primary/10 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-text-accent">Mudanças aplicadas:</h3>
            <ul className="text-sm text-text-main space-y-1 list-disc list-inside">
              <li>Design ultra minimalista - apenas círculos numerados</li>
              <li>Cores da identidade visual Paper Bloom (rosa/bege)</li>
              <li>Círculos mini: 6px (24px) com números pequenos</li>
              <li>Sem labels de texto - apenas tooltip no hover</li>
              <li>Linhas conectoras muito finas entre os steps</li>
              <li>Posicionado dentro da box, acima do título</li>
              <li>Centralizado horizontalmente</li>
              <li>Mesmo design para mobile e desktop</li>
            </ul>
          </div>
        </div>

        {/* Comparação de cores */}
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 space-y-4">
          <h3 className="text-lg font-serif font-bold text-text-main">
            Paleta de Cores
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="w-full h-16 bg-primary rounded-lg border"></div>
              <p className="text-xs text-center text-text-main">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-secondary rounded-lg border"></div>
              <p className="text-xs text-center text-text-main">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-text-accent rounded-lg border"></div>
              <p className="text-xs text-center text-white">Text Accent</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-text-main rounded-lg border"></div>
              <p className="text-xs text-center text-white">Text Main</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-background rounded-lg border"></div>
              <p className="text-xs text-center text-text-main">Background</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
