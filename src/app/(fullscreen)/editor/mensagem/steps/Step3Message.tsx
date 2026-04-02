'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';

/**
 * Step 3: Mensagem
 * Main message text, recipient and sender names
 * 
 * @see Requirements 5.2, 5.4, 5.5, 5.7
 */
export function Step3Message() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { data, updateField, ui } = useWizard();
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate fields
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!data.recipientName.trim()) {
      newErrors.recipientName = 'Nome do destinatário é obrigatório';
    } else if (data.recipientName.length > 100) {
      newErrors.recipientName = 'Nome deve ter no máximo 100 caracteres';
    }
    
    if (!data.senderName.trim()) {
      newErrors.senderName = 'Seu nome é obrigatório';
    } else if (data.senderName.length > 100) {
      newErrors.senderName = 'Nome deve ter no máximo 100 caracteres';
    }
    
    if (!data.mainMessage.trim()) {
      newErrors.mainMessage = 'Mensagem é obrigatória';
    } else if (data.mainMessage.length > 500) {
      newErrors.mainMessage = 'Mensagem deve ter no máximo 500 caracteres';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation(2, { isValid, errors: newErrors });
    return isValid;
  };

  // Update validation when data changes
  useEffect(() => {
    if (data.recipientName || data.senderName || data.mainMessage) {
      validateFields();
    }
  }, [data.recipientName, data.senderName, data.mainMessage]);

  const handleNext = () => {
    if (validateFields()) {
      nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  return (
    <FullscreenStep
      emoji="💬"
      title="Sua Mensagem"
      subtitle="Escreva uma mensagem especial para quem você ama"
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Recipient Name */}
        <div className="space-y-2">
          <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
            Para quem é essa mensagem? *
          </label>
          <input
            id="recipientName"
            type="text"
            value={data.recipientName}
            onChange={(e) => updateField('recipientName', e.target.value)}
            placeholder="Ex: Maria, Amor, Mãe"
            maxLength={100}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.recipientName 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
            } transition-colors`}
          />
          {errors.recipientName && (
            <p className="text-sm text-red-600">{errors.recipientName}</p>
          )}
        </div>

        {/* Sender Name */}
        <div className="space-y-2">
          <label htmlFor="senderName" className="block text-sm font-medium text-gray-700">
            Seu nome *
          </label>
          <input
            id="senderName"
            type="text"
            value={data.senderName}
            onChange={(e) => updateField('senderName', e.target.value)}
            placeholder="Ex: João, Seu amor"
            maxLength={100}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.senderName 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
            } transition-colors`}
          />
          {errors.senderName && (
            <p className="text-sm text-red-600">{errors.senderName}</p>
          )}
        </div>

        {/* Main Message */}
        <div className="space-y-2">
          <label htmlFor="mainMessage" className="block text-sm font-medium text-gray-700">
            Sua mensagem *
          </label>
          <textarea
            id="mainMessage"
            value={data.mainMessage}
            onChange={(e) => updateField('mainMessage', e.target.value)}
            placeholder="Escreva aqui sua mensagem especial..."
            maxLength={500}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              errors.mainMessage 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
            } transition-colors`}
          />
          {errors.mainMessage && (
            <p className="text-sm text-red-600">{errors.mainMessage}</p>
          )}
          <p className="text-xs text-gray-500 text-right">
            {data.mainMessage.length}/500 caracteres
          </p>
        </div>

        {/* Preview Card */}
        {data.recipientName && data.mainMessage && (
          <div className="p-4 bg-white/80 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">Prévia:</p>
            <p className="text-pink-600 font-medium mb-2">
              Para: {data.recipientName}
            </p>
            <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-3">
              {data.mainMessage}
            </p>
            {data.senderName && (
              <p className="text-gray-600 text-sm mt-2 text-right">
                — {data.senderName}
              </p>
            )}
          </div>
        )}

        <WizardNavigation
          onNext={handleNext}
          onPrev={handlePrev}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={ui.isAutoSaving}
          canProceed={!errors.recipientName && !errors.senderName && !errors.mainMessage && !!data.recipientName && !!data.senderName && !!data.mainMessage}
          nextLabel="Continuar →"
        />
      </div>
    </FullscreenStep>
  );
}
