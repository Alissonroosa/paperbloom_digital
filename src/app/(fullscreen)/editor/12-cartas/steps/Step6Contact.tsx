'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation, useInteractiveWizardAutoSave } from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { analytics } from '@/lib/analytics';

/**
 * Step 7: Dados para Envio (Contact)
 * Final step for contact information and checkout
 */
export function Step6Contact() {
  const { prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { clearDraft } = useInteractiveWizardAutoSave();
  const { collection, updateCollection, canProceedToCheckout, clearLocalStorage, isSaving } = useCardCollectionEditor();
  
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Sync with collection data
  useEffect(() => {
    if (collection) {
      setContactName(collection.contactName || '');
      setContactEmail(collection.contactEmail || '');
      setContactPhone(collection.contactPhone || '');
    }
  }, [collection]);

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
    
    if (!contactName.trim()) {
      newErrors.contactName = 'Nome é obrigatório';
    } else if (contactName.length > 100) {
      newErrors.contactName = 'Nome deve ter no máximo 100 caracteres';
    }
    
    if (!contactEmail.trim()) {
      newErrors.contactEmail = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.contactEmail = 'Email inválido';
    }
    
    if (!contactPhone.trim()) {
      newErrors.contactPhone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(contactPhone)) {
      newErrors.contactPhone = 'Telefone deve estar no formato (XX) XXXXX-XXXX';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation(5, { isValid, errors: newErrors });
    return isValid;
  };

  // Update validation when data changes
  useEffect(() => {
    if (contactName || contactEmail || contactPhone) {
      validateFields();
    }
  }, [contactName, contactEmail, contactPhone]);

  const handlePhoneChange = (value: string) => {
    setContactPhone(formatPhone(value));
  };

  const handlePrev = () => {
    prevStep();
  };

  const handleFinalize = async () => {
    if (!validateFields() || !collection) return;

    // Track: Completou o editor e iniciou pagamento
    analytics.completeEditor('card-collection');
    analytics.initiatePayment('card-collection', collection.id);

    setIsCheckingOut(true);

    try {
      // Save contact info first
      await updateCollection(collection.id, {
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
      });

      // Create checkout session
      const response = await fetch('/api/checkout/card-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: collection.id }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar checkout');
      }

      const { url } = await response.json();

      // Clear local storage before redirecting
      clearLocalStorage();
      clearDraft();

      // Redirect to checkout
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create checkout:', err);
      analytics.error('checkout_error', 'Falha ao criar checkout', {
        productType: 'card-collection',
        collectionId: collection.id,
      });
      alert('Erro ao processar pagamento. Tente novamente.');
      setIsCheckingOut(false);
    }
  };

  const canCheckout = !errors.contactName && !errors.contactEmail && !errors.contactPhone && 
                      !!contactName.trim() && !!contactEmail.trim() && !!contactPhone.trim() &&
                      canProceedToCheckout();

  return (
    <FullscreenStep
      emoji="📧"
      title="Quase lá! Só mais um passo"
      subtitle="Informe seus dados para receber o link das cartas"
      showProgress={true}
      showBackLink={false}
      showDemoLink={true}
      demoLinkHref="/demo/card-collection"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Contact Name */}
        <div className="space-y-2">
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
            👤 Seu nome completo
          </label>
          <input
            id="contactName"
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Ex: João da Silva"
            maxLength={100}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.contactName 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.contactName && (
            <p className="text-sm text-red-600">{errors.contactName}</p>
          )}
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
            📩 Seu melhor email
          </label>
          <input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="seu@email.com"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.contactEmail 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.contactEmail && (
            <p className="text-sm text-red-600">{errors.contactEmail}</p>
          )}
          <p className="text-xs text-gray-500">
            Enviaremos o link das cartas para este email 💌
          </p>
        </div>

        {/* Contact Phone */}
        <div className="space-y-2">
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
            📱 WhatsApp para contato
          </label>
          <input
            id="contactPhone"
            type="tel"
            value={contactPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(11) 99999-9999"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.contactPhone 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.contactPhone && (
            <p className="text-sm text-red-600">{errors.contactPhone}</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border">
          <h3 className="font-medium mb-4 text-center">✨ Resumo do seu presente</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>💌 12 cartas personalizadas</p>
            <p>💝 Para: {collection?.recipientName || '...'}</p>
            <p>💜 De: {collection?.senderName || '...'}</p>
            <p>⚡ Entrega digital instantânea</p>
            <p>🔗 Link exclusivo para compartilhar</p>
          </div>
        </div>

        {!canProceedToCheckout() && (
          <p className="text-sm text-amber-600 text-center bg-amber-50 p-3 rounded-lg">
            ⚠️ Complete todas as cartas antes de finalizar
          </p>
        )}

        <WizardNavigation
          onPrev={handlePrev}
          onFinalize={handleFinalize}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={isSaving || isCheckingOut}
          canProceed={canCheckout}
          finalizeLabel="💳 Finalizar Compra"
        />
      </div>
    </FullscreenStep>
  );
}
