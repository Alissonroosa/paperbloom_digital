'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';

/**
 * Step 1: Título e URL
 * Page title and custom URL slug configuration
 * 
 * @see Requirements 5.2, 5.4, 5.5, 5.7
 */
export function Step1TitleURL() {
  const { nextStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { data, updateField, ui } = useWizard();
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate fields
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!data.pageTitle.trim()) {
      newErrors.pageTitle = 'Título é obrigatório';
    } else if (data.pageTitle.length > 100) {
      newErrors.pageTitle = 'Título deve ter no máximo 100 caracteres';
    }
    
    if (!data.urlSlug.trim()) {
      newErrors.urlSlug = 'URL é obrigatória';
    } else if (data.urlSlug.length < 3) {
      newErrors.urlSlug = 'URL deve ter no mínimo 3 caracteres';
    } else if (data.urlSlug.length > 50) {
      newErrors.urlSlug = 'URL deve ter no máximo 50 caracteres';
    } else if (!/^[a-z0-9-]+$/.test(data.urlSlug)) {
      newErrors.urlSlug = 'URL deve conter apenas letras minúsculas, números e hífens';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation(0, { isValid, errors: newErrors });
    return isValid;
  };

  // Update validation when data changes
  useEffect(() => {
    if (data.pageTitle || data.urlSlug) {
      validateFields();
    }
  }, [data.pageTitle, data.urlSlug]);

  // Generate URL slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .slice(0, 50);
  };

  const handleTitleChange = (value: string) => {
    updateField('pageTitle', value);
    // Auto-generate slug if slug is empty or was auto-generated
    if (!data.urlSlug || data.urlSlug === generateSlug(data.pageTitle)) {
      updateField('urlSlug', generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    // Only allow valid slug characters
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    updateField('urlSlug', sanitized);
  };

  const handleNext = () => {
    if (validateFields()) {
      nextStep();
    }
  };

  return (
    <FullscreenStep
      emoji="💌"
      title="Título e URL"
      subtitle="Escolha um título e uma URL personalizada para sua mensagem"
      showProgress={true}
      showBackLink={true}
      backLinkHref="/"
      backLinkText="← Voltar ao início"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Page Title Field */}
        <div className="space-y-2">
          <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700">
            Título da Página *
          </label>
          <input
            id="pageTitle"
            type="text"
            value={data.pageTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ex: Para meu amor"
            maxLength={100}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.pageTitle 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
            } transition-colors`}
          />
          {errors.pageTitle && (
            <p className="text-sm text-red-600">{errors.pageTitle}</p>
          )}
          <p className="text-xs text-gray-500">
            {data.pageTitle.length}/100 caracteres
          </p>
        </div>

        {/* URL Slug Field */}
        <div className="space-y-2">
          <label htmlFor="urlSlug" className="block text-sm font-medium text-gray-700">
            URL Personalizada *
          </label>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-3 rounded-l-lg border border-r-0 border-gray-300">
              paperbloom.com/m/
            </span>
            <input
              id="urlSlug"
              type="text"
              value={data.urlSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="minha-mensagem"
              maxLength={50}
              className={`flex-1 px-4 py-3 rounded-r-lg border ${
                errors.urlSlug 
                  ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
              } transition-colors`}
            />
          </div>
          {errors.urlSlug && (
            <p className="text-sm text-red-600">{errors.urlSlug}</p>
          )}
          <p className="text-xs text-gray-500">
            Use apenas letras minúsculas, números e hífens
          </p>
        </div>

        <WizardNavigation
          onNext={handleNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={ui.isAutoSaving}
          canProceed={!errors.pageTitle && !errors.urlSlug && !!data.pageTitle && !!data.urlSlug}
          nextLabel="Continuar →"
        />
      </div>
    </FullscreenStep>
  );
}
