'use client';

import { useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';
import { BACKGROUND_COLORS, THEME_OPTIONS } from '@/types/wizard';
import { Check } from 'lucide-react';

/**
 * Step 5: Tema
 * Theme and color selection
 * 
 * @see Requirements 5.2, 5.4, 5.5, 5.7
 */
export function Step5Theme() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { data, updateField, ui } = useWizard();

  // This step has defaults, so always valid
  useEffect(() => {
    setStepValidation(4, { isValid: true, errors: {} });
  }, []);

  const handleColorSelect = (color: string) => {
    updateField('backgroundColor', color);
  };

  const handleThemeSelect = (theme: typeof data.theme) => {
    updateField('theme', theme);
  };

  const handleNext = () => {
    nextStep();
  };

  const handlePrev = () => {
    prevStep();
  };

  return (
    <FullscreenStep
      emoji="🎨"
      title="Tema e Cores"
      subtitle="Personalize a aparência da sua mensagem"
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Background Color Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Cor de Fundo
          </label>
          
          <div className="grid grid-cols-4 gap-3">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className={`relative aspect-square rounded-lg border-2 transition-all ${
                  data.backgroundColor === color.value
                    ? 'border-pink-500 ring-2 ring-pink-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
                aria-label={`Selecionar cor ${color.name}`}
              >
                {data.backgroundColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-5 h-5 text-pink-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Custom Color Picker */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Cor personalizada:</label>
            <input
              type="color"
              value={data.backgroundColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-mono">
              {data.backgroundColor}
            </span>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Estilo do Tema
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeSelect(theme.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
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

        {/* Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Prévia
          </label>
          <div
            className="p-6 rounded-lg border border-gray-200 text-center"
            style={{ backgroundColor: data.backgroundColor }}
          >
            <p className="text-lg font-serif text-gray-800">
              Sua mensagem aparecerá assim
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Tema: {THEME_OPTIONS.find(t => t.value === data.theme)?.name}
            </p>
          </div>
        </div>

        <WizardNavigation
          onNext={handleNext}
          onPrev={handlePrev}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={ui.isAutoSaving}
          canProceed={true}
          nextLabel="Continuar →"
        />
      </div>
    </FullscreenStep>
  );
}
