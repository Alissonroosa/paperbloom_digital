'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';
import { Eye, Sparkles } from 'lucide-react';

/**
 * Step 2: Sua Mensagem
 * The heart of the experience - the main message
 */
export function Step2Message() {
  const { nextStep, prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { data, updateField, ui } = useWizard();
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate fields
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!data.mainMessage.trim()) {
      newErrors.mainMessage = 'Sua mensagem é obrigatória';
    } else if (data.mainMessage.length > 500) {
      newErrors.mainMessage = 'Mensagem deve ter no máximo 500 caracteres';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation(1, { isValid, errors: newErrors });
    return isValid;
  };

  // Update validation when data changes
  useEffect(() => {
    if (data.mainMessage) {
      validateFields();
    }
  }, [data.mainMessage]);

  const handleNext = () => {
    if (validateFields()) {
      nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  // Suggestions for inspiration
  const suggestions = [
    "Você é a pessoa mais especial da minha vida...",
    "Desde que você entrou na minha vida...",
    "Obrigado(a) por estar sempre ao meu lado...",
    "Cada momento com você é único...",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    if (!data.mainMessage) {
      updateField('mainMessage', suggestion);
    }
  };

  return (
    <FullscreenStep
      emoji="💬"
      title="Agora, abra seu coração..."
      subtitle={`O que você gostaria de dizer para ${data.recipientName || 'essa pessoa especial'}?`}
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Main Message */}
        <div className="space-y-2">
          <label htmlFor="mainMessage" className="block text-sm font-medium text-gray-700">
            Sua mensagem especial ✨
          </label>
          <textarea
            id="mainMessage"
            value={data.mainMessage}
            onChange={(e) => updateField('mainMessage', e.target.value)}
            placeholder="Escreva aqui tudo que você sente... Não tenha medo de demonstrar seus sentimentos!"
            maxLength={500}
            rows={8}
            className={`w-full px-4 py-4 rounded-xl border resize-none text-base leading-relaxed ${
              errors.mainMessage 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
            } transition-colors`}
          />
          {errors.mainMessage && (
            <p className="text-sm text-red-600">{errors.mainMessage}</p>
          )}
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Dica: Seja autêntico(a), as palavras mais simples são as mais tocantes
            </p>
            <p className="text-xs text-gray-500">
              {data.mainMessage.length}/500
            </p>
          </div>
        </div>

        {/* Inspiration Suggestions */}
        {!data.mainMessage && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Sparkles size={14} className="text-pink-500" />
              Precisa de inspiração? Clique para começar:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-2 bg-pink-50 text-pink-700 rounded-full hover:bg-pink-100 transition-colors border border-pink-200"
                >
                  {suggestion.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview Card */}
        {data.mainMessage && (
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <p className="text-pink-600 font-medium mb-2 text-sm">
              Para: {data.recipientName}
            </p>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {data.mainMessage}
            </p>
            <p className="text-gray-500 text-sm mt-3 text-right italic">
              — Com amor, {data.senderName}
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
          onPrev={handlePrev}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={ui.isAutoSaving}
          canProceed={!errors.mainMessage && !!data.mainMessage}
          nextLabel="Continuar →"
        />
      </div>
    </FullscreenStep>
  );
}
