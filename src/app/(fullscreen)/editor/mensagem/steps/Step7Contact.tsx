'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation, useInteractiveWizardAutoSave } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';
import { analytics } from '@/lib/analytics';

/**
 * Step 7: Contato
 * Contact info and checkout finalization
 * 
 * @see Requirements 5.2, 5.4, 5.5, 5.7
 */
export function Step7Contact() {
  const { prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { clearDraft } = useInteractiveWizardAutoSave();
  const { data, updateField, ui, resetState } = useWizard();
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Format phone number
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) {
      return digits.length > 0 ? `(${digits}` : '';
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Validate fields
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!data.contactName.trim()) {
      newErrors.contactName = 'Nome é obrigatório';
    } else if (data.contactName.length > 100) {
      newErrors.contactName = 'Nome deve ter no máximo 100 caracteres';
    }
    
    if (!data.contactEmail.trim()) {
      newErrors.contactEmail = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
      newErrors.contactEmail = 'Email inválido';
    }
    
    if (!data.contactPhone.trim()) {
      newErrors.contactPhone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(data.contactPhone)) {
      newErrors.contactPhone = 'Telefone deve estar no formato (XX) XXXXX-XXXX';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation(6, { isValid, errors: newErrors });
    return isValid;
  };

  // Update validation when data changes
  useEffect(() => {
    if (data.contactName || data.contactEmail || data.contactPhone) {
      validateFields();
    }
  }, [data.contactName, data.contactEmail, data.contactPhone]);

  const handlePhoneChange = (value: string) => {
    updateField('contactPhone', formatPhone(value));
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleFinalize = async () => {
    if (!validateFields()) return;

    // Track: Completou o editor e iniciou pagamento
    analytics.completeEditor('message');
    analytics.initiatePayment('message', data.urlSlug);

    setIsCheckingOut(true);

    try {
      // Create the message first
      const messageResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageTitle: data.pageTitle,
          urlSlug: data.urlSlug,
          specialDate: data.specialDate,
          showTimeCounter: data.showTimeCounter,
          timeCounterLabel: data.timeCounterLabel,
          recipientName: data.recipientName,
          senderName: data.senderName,
          mainMessage: data.mainMessage,
          backgroundColor: data.backgroundColor,
          theme: data.theme,
          youtubeUrl: data.youtubeUrl,
          musicStartTime: data.musicStartTime,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
        }),
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json();
        throw new Error(errorData.error || 'Falha ao criar mensagem');
      }

      const { id: messageId } = await messageResponse.json();

      // Create checkout session
      const checkoutResponse = await fetch('/api/checkout/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });

      if (!checkoutResponse.ok) {
        throw new Error('Falha ao criar checkout');
      }

      const { url } = await checkoutResponse.json();

      // Clear local storage before redirecting
      clearDraft();
      resetState();

      // Redirect to checkout
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create checkout:', err);
      analytics.error('checkout_error', err instanceof Error ? err.message : 'Falha ao criar checkout', {
        productType: 'message',
        urlSlug: data.urlSlug,
      });
      alert(err instanceof Error ? err.message : 'Erro ao processar pagamento. Tente novamente.');
      setIsCheckingOut(false);
    }
  };

  const canCheckout = !errors.contactName && !errors.contactEmail && !errors.contactPhone && 
                      !!data.contactName && !!data.contactEmail && !!data.contactPhone;

  return (
    <FullscreenStep
      emoji="📧"
      title="Dados para Contato"
      subtitle="Informe seus dados para finalizar a compra"
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Contact Name */}
        <div className="space-y-2">
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
            Seu Nome Completo *
          </label>
          <input
            id="contactName"
            type="text"
            value={data.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
            placeholder="Ex: João da Silva"
            maxLength={100}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.contactName 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
            } transition-colors`}
          />
          {errors.contactName && (
            <p className="text-sm text-red-600">{errors.contactName}</p>
          )}
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            id="contactEmail"
            type="email"
            value={data.contactEmail}
            onChange={(e) => updateField('contactEmail', e.target.value)}
            placeholder="seu@email.com"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.contactEmail 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
            } transition-colors`}
          />
          {errors.contactEmail && (
            <p className="text-sm text-red-600">{errors.contactEmail}</p>
          )}
          <p className="text-xs text-gray-500">
            Enviaremos o link da sua mensagem para este email
          </p>
        </div>

        {/* Contact Phone */}
        <div className="space-y-2">
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
            Telefone/WhatsApp *
          </label>
          <input
            id="contactPhone"
            type="tel"
            value={data.contactPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(11) 99999-9999"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.contactPhone 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
            } transition-colors`}
          />
          {errors.contactPhone && (
            <p className="text-sm text-red-600">{errors.contactPhone}</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border">
          <h3 className="font-medium mb-4">Resumo do Pedido</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Mensagem digital personalizada</p>
            <p>• URL exclusiva: paperbloom.com/m/{data.urlSlug || '...'}</p>
            <p>• Entrega digital instantânea</p>
            {data.youtubeUrl && <p>• Música de fundo incluída</p>}
          </div>
        </div>

        <WizardNavigation
          onPrev={handlePrev}
          onFinalize={handleFinalize}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={ui.isAutoSaving || isCheckingOut}
          canProceed={canCheckout}
          finalizeLabel="Finalizar Compra →"
        />
      </div>
    </FullscreenStep>
  );
}
