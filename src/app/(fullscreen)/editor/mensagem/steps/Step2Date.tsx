'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';

/**
 * Step 2: Data Especial
 * Special date selection with time counter option
 * 
 * @see Requirements 5.2, 5.4, 5.5, 5.7
 */
export function Step2Date() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { data, updateField, ui } = useWizard();

  // Format date for input
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Parse date from input
  const parseDateFromInput = (value: string): Date | null => {
    if (!value) return null;
    return new Date(value + 'T00:00:00');
  };

  // This step is optional, so always valid
  useEffect(() => {
    setStepValidation(1, { isValid: true, errors: {} });
  }, []);

  const handleDateChange = (value: string) => {
    updateField('specialDate', parseDateFromInput(value));
  };

  const handleShowCounterChange = (checked: boolean) => {
    updateField('showTimeCounter', checked);
  };

  const handleCounterLabelChange = (value: string) => {
    updateField('timeCounterLabel', value);
  };

  const handleNext = () => {
    nextStep();
  };

  const handlePrev = () => {
    prevStep();
  };

  // Calculate time difference for preview
  const getTimeDifference = () => {
    if (!data.specialDate) return null;
    
    const now = new Date();
    const special = new Date(data.specialDate);
    const diffMs = special.getTime() - now.getTime();
    const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    const isPast = diffMs < 0;
    
    if (diffYears > 0) {
      return `${diffYears} ano${diffYears > 1 ? 's' : ''} ${isPast ? 'atrás' : 'restantes'}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths > 1 ? 'meses' : 'mês'} ${isPast ? 'atrás' : 'restantes'}`;
    } else {
      return `${diffDays} dia${diffDays !== 1 ? 's' : ''} ${isPast ? 'atrás' : 'restantes'}`;
    }
  };

  return (
    <FullscreenStep
      emoji="📅"
      title="Data Especial"
      subtitle="Adicione uma data especial para sua mensagem (opcional)"
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Date Field */}
        <div className="space-y-2">
          <label htmlFor="specialDate" className="block text-sm font-medium text-gray-700">
            Data Especial
          </label>
          <input
            id="specialDate"
            type="date"
            value={formatDateForInput(data.specialDate)}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500 transition-colors"
          />
          <p className="text-xs text-gray-500">
            Pode ser uma data no passado (aniversário de namoro) ou no futuro (casamento)
          </p>
        </div>

        {/* Time Counter Toggle */}
        {data.specialDate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-800">Mostrar contador de tempo</p>
                <p className="text-sm text-gray-500">
                  Exibe quanto tempo passou ou falta para a data
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.showTimeCounter}
                  onChange={(e) => handleShowCounterChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* Counter Label */}
            {data.showTimeCounter && (
              <div className="space-y-2">
                <label htmlFor="counterLabel" className="block text-sm font-medium text-gray-700">
                  Nome da Data (opcional)
                </label>
                <input
                  id="counterLabel"
                  type="text"
                  value={data.timeCounterLabel}
                  onChange={(e) => handleCounterLabelChange(e.target.value)}
                  placeholder="Ex: Nosso aniversário"
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>
            )}

            {/* Preview */}
            {data.showTimeCounter && (
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200 text-center">
                <p className="text-sm text-pink-600 mb-1">
                  {data.timeCounterLabel || 'Data especial'}
                </p>
                <p className="text-lg font-semibold text-pink-700">
                  {getTimeDifference()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Skip message */}
        {!data.specialDate && (
          <p className="text-center text-sm text-gray-500">
            Você pode pular esta etapa se preferir
          </p>
        )}

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
