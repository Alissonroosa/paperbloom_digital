'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useWizard } from '@/contexts/WizardContext';
import { generateSlugFromTitle, checkSlugAvailability } from '@/lib/wizard-utils';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

/**
 * Step 1: Page Title and URL Component
 * Allows users to enter page title and custom URL slug
 * Features:
 * - Auto-generates slug from title
 * - Real-time slug availability check
 * - Inline validation errors
 * - Updates preview in real-time
 */
export function Step1PageTitleURL() {
  const { data, updateField, stepValidation, currentStep } = useWizard();
  const [slugCheckStatus, setSlugCheckStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);
  const [isManualSlug, setIsManualSlug] = useState(false);

  const errors = stepValidation[currentStep]?.errors || {};

  // Debounced slug availability check
  useEffect(() => {
    if (!data.urlSlug || data.urlSlug.length < 3) {
      setSlugCheckStatus('idle');
      return;
    }

    // Don't check if there are validation errors
    if (errors.urlSlug) {
      setSlugCheckStatus('idle');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSlugCheckStatus('checking');
      const result = await checkSlugAvailability(data.urlSlug);
      
      if (result.available) {
        setSlugCheckStatus('available');
        setSlugSuggestion(null);
      } else {
        setSlugCheckStatus('unavailable');
        setSlugSuggestion(result.suggestion || null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [data.urlSlug, errors.urlSlug]);

  // Auto-generate slug from title
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    updateField('pageTitle', newTitle);

    // Only auto-generate if user hasn't manually edited the slug
    if (!isManualSlug && newTitle) {
      const generatedSlug = generateSlugFromTitle(newTitle);
      updateField('urlSlug', generatedSlug);
    }
  }, [updateField, isManualSlug]);

  // Handle manual slug editing
  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value;
    setIsManualSlug(true);
    updateField('urlSlug', newSlug);
  }, [updateField]);

  // Use suggested slug
  const useSuggestion = useCallback(() => {
    if (slugSuggestion) {
      updateField('urlSlug', slugSuggestion);
      setIsManualSlug(true);
    }
  }, [slugSuggestion, updateField]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Título e URL da Mensagem
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Escolha um título para sua mensagem e personalize a URL de acesso.
        </p>
      </div>

      {/* Page Title Input */}
      <div className="space-y-2">
        <Label htmlFor="pageTitle" className="text-sm md:text-base">
          Título da Página <span className="text-red-500">*</span>
        </Label>
        <Input
          id="pageTitle"
          type="text"
          value={data.pageTitle}
          onChange={handleTitleChange}
          placeholder="Ex: Feliz Aniversário Maria"
          maxLength={100}
          className={`min-h-[44px] text-base ${errors.pageTitle ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          aria-invalid={!!errors.pageTitle}
          aria-describedby={errors.pageTitle ? 'pageTitle-error' : undefined}
        />
        <div className="flex justify-between items-center">
          {errors.pageTitle && (
            <p id="pageTitle-error" className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {errors.pageTitle}
            </p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {data.pageTitle.length}/100
          </p>
        </div>
      </div>

      {/* URL Slug Input */}
      <div className="space-y-2">
        <Label htmlFor="urlSlug" className="text-sm md:text-base">
          URL Personalizada <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="flex items-center">
            <span className="text-xs md:text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-2 md:px-3 py-2 min-h-[44px] flex items-center">
              <span className="hidden sm:inline">paperbloom.com/mensagem/</span>
              <span className="sm:hidden">...mensagem/</span>
            </span>
            <Input
              id="urlSlug"
              type="text"
              value={data.urlSlug}
              onChange={handleSlugChange}
              placeholder="minha-mensagem"
              maxLength={50}
              className={`rounded-l-none min-h-[44px] text-base ${errors.urlSlug ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              aria-invalid={!!errors.urlSlug}
              aria-describedby={errors.urlSlug ? 'urlSlug-error' : 'urlSlug-status'}
            />
            {slugCheckStatus === 'checking' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
            {slugCheckStatus === 'available' && !errors.urlSlug && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            )}
            {slugCheckStatus === 'unavailable' && !errors.urlSlug && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          {errors.urlSlug && (
            <p id="urlSlug-error" className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {errors.urlSlug}
            </p>
          )}
          
          {!errors.urlSlug && slugCheckStatus === 'available' && (
            <p id="urlSlug-status" className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              URL disponível!
            </p>
          )}
          
          {!errors.urlSlug && slugCheckStatus === 'unavailable' && (
            <div className="space-y-2">
              <p className="text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Esta URL já está em uso
              </p>
              {slugSuggestion && (
                <button
                  type="button"
                  onClick={useSuggestion}
                  className="text-sm text-blue-600 hover:text-blue-700 underline flex items-center gap-1 min-h-[44px] py-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Usar sugestão: {slugSuggestion}
                </button>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Use apenas letras minúsculas, números e hífens ({data.urlSlug.length}/50)
          </p>
        </div>
      </div>

      {/* Preview URL */}
      {data.urlSlug && !errors.urlSlug && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-1">
            Prévia da URL:
          </p>
          <p className="text-sm text-blue-700 font-mono break-all">
            https://paperbloom.com/mensagem/{data.urlSlug}
          </p>
        </div>
      )}
    </div>
  );
}
