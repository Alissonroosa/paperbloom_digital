'use client';

import { useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';
import { Eye, Calendar, Heart } from 'lucide-react';

/**
 * Step 3: Data Especial
 * Optional special date with time counter
 */
export function Step3Date() {
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
    setStepValidation(2, { isValid: true, errors: {} });
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
      return `${diffYears} ano${diffYears > 1 ? 's' : ''} ${isPast ? 'juntos' : 'para o grande dia'}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths > 1 ? 'meses' : 'mês'} ${isPast ? 'juntos' : 'para o grande dia'}`;
    } else {
      return `${diffDays} dia${diffDays !== 1 ? 's' : ''} ${isPast ? 'juntos' : 'para o grande dia'}`;
    }
  };

  // Date suggestions
  const dateSuggestions = [
    { label: 'Aniversário de namoro', icon: '💑' },
    { label: 'Aniversário de casamento', icon: '💍' },
    { label: 'Primeiro encontro', icon: '✨' },
    { label: 'Data do pedido', icon: '💝' },
  ];

  return (
    <FullscreenStep
      emoji="📅"
      title="Existe uma data especial?"
      subtitle="Marque uma data importante para vocês e mostre quanto tempo de amor já construíram juntos"
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Date Field */}
        <div className="space-y-2">
          <label htmlFor="specialDate" className="block text-sm font-medium text-gray-700">
            Qual é a data especial? 💕
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="specialDate"
              type="date"
              value={formatDateForInput(data.specialDate)}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-pink-500 focus:border-pink-500 transition-colors text-lg"
            />
          </div>
          <p className="text-xs text-gray-500">
            Pode ser uma data no passado (quando começaram) ou no futuro (casamento, viagem...)
          </p>
        </div>

        {/* Date Suggestions */}
        {!data.specialDate && (
          <div className="flex flex-wrap gap-2">
            {dateSuggestions.map((suggestion, index) => (
              <span
                key={index}
                className="text-xs px-3 py-2 bg-gray-50 text-gray-600 rounded-full border border-gray-200"
              >
                {suggestion.icon} {suggestion.label}
              </span>
            ))}
          </div>
        )}

        {/* Time Counter Toggle */}
        {data.specialDate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div>
                <p className="font-medium text-gray-800 flex items-center gap-2">
                  <Heart size={16} className="text-pink-500" />
                  Mostrar contador de tempo
                </p>
                <p className="text-sm text-gray-500">
                  Exibe quanto tempo de amor vocês já têm
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
                  Nome para essa data (opcional)
                </label>
                <input
                  id="counterLabel"
                  type="text"
                  value={data.timeCounterLabel}
                  onChange={(e) => handleCounterLabelChange(e.target.value)}
                  placeholder="Ex: Nosso aniversário, Primeiro beijo..."
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>
            )}

            {/* Preview */}
            {data.showTimeCounter && (
              <div className="p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200 text-center">
                <p className="text-sm text-pink-600 mb-1">
                  {data.timeCounterLabel || 'Nossa história de amor'}
                </p>
                <p className="text-2xl font-semibold text-pink-700">
                  {getTimeDifference()}
                </p>
                <p className="text-xs text-pink-500 mt-2">
                  E contando... 💕
                </p>
              </div>
            )}
          </div>
        )}

        {/* Skip message */}
        <p className="text-center text-sm text-gray-500">
          {data.specialDate 
            ? 'Que lindo! Essa data vai deixar sua mensagem ainda mais especial ✨'
            : 'Esta etapa é opcional, você pode pular se preferir'
          }
        </p>

        {/* Demo Link */}
        <div className="text-center">
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
          canProceed={true}
          nextLabel="Continuar →"
        />
      </div>
    </FullscreenStep>
  );
}
