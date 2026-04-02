'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';
import { Eye } from 'lucide-react';

/**
 * Step 1: Para Quem?
 * Recipient and sender names - the heart of the message
 */
export function Step1Recipient() {
  const { nextStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
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
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation(0, { isValid, errors: newErrors });
    return isValid;
  };

  // Update validation when data changes
  useEffect(() => {
    if (data.recipientName || data.senderName) {
      validateFields();
    }
  }, [data.recipientName, data.senderName]);

  const handleNext = () => {
    if (validateFields()) {
      nextStep();
    }
  };

  return (
    <FullscreenStep
      emoji="💝"
      title="Para quem é essa mensagem especial?"
      subtitle="Vamos começar com o mais importante: quem vai receber todo esse carinho?"
      showProgress={true}
      showBackLink={true}
      backLinkHref="/"
      backLinkText="← Voltar ao início"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Recipient Name */}
        <div className="space-y-2">
          <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
            Para quem você está escrevendo? 💕
          </label>
          <input
            id="recipientName"
            type="text"
            value={data.recipientName}
            onChange={(e) => updateField('recipientName', e.target.value)}
            placeholder="Ex: Maria, Amor, Mãe, Pai..."
            maxLength={100}
            className={`w-full px-4 py-4 rounded-xl border text-lg ${
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
            E quem está enviando? ✨
          </label>
          <input
            id="senderName"
            type="text"
            value={data.senderName}
            onChange={(e) => updateField('senderName', e.target.value)}
            placeholder="Ex: João, Seu amor, Sua filha..."
            maxLength={100}
            className={`w-full px-4 py-4 rounded-xl border text-lg ${
              errors.senderName 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
            } transition-colors`}
          />
          {errors.senderName && (
            <p className="text-sm text-red-600">{errors.senderName}</p>
          )}
        </div>

        {/* Preview Card */}
        {data.recipientName && data.senderName && (
          <div className="p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200 shadow-sm text-center">
            <p className="text-gray-600 text-sm mb-2">Sua mensagem será de:</p>
            <p className="text-xl font-medium text-pink-700">
              {data.senderName} → {data.recipientName}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Uma mensagem cheia de amor e carinho 💌
            </p>
          </div>
        )}

        {/* Demo Link */}
        <div className="text-center pt-2">
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
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={ui.isAutoSaving}
          canProceed={!errors.recipientName && !errors.senderName && !!data.recipientName && !!data.senderName}
          nextLabel="Continuar →"
        />
      </div>
    </FullscreenStep>
  );
}
