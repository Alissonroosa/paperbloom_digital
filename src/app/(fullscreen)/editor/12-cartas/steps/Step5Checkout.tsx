'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { PriceBadge } from '@/components/interactive-wizard/PriceBadge';
import {
  useInteractiveWizardNavigation,
  useInteractiveWizardValidation,
  useInteractiveWizardAutoSave,
} from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { analytics } from '@/lib/analytics';

const CHECKOUT_STEP_INDEX = 4;

export function Step5Checkout() {
  const { prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { clearDraft } = useInteractiveWizardAutoSave();
  const {
    collection,
    updateCollection,
    canProceedToCheckout,
    clearLocalStorage,
    isSaving,
  } = useCardCollectionEditor();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const recipientName = collection?.recipientName?.trim() || 'a pessoa';
  const senderName = collection?.senderName?.trim() || 'Alguém especial';
  const truncatedName = recipientName.length > 30 ? recipientName.slice(0, 30) + '…' : recipientName;

  useEffect(() => {
    if (collection) {
      setContactName(collection.contactName || '');
      setContactEmail(collection.contactEmail || '');
    }
  }, [collection]);

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
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation(CHECKOUT_STEP_INDEX, { isValid, errors: newErrors });
    return isValid;
  };

  useEffect(() => {
    if (contactName || contactEmail) validateFields();
  }, [contactName, contactEmail]);

  const handleFinalize = async () => {
    if (!validateFields() || !collection) return;

    analytics.completeEditor('card-collection');
    analytics.initiatePayment('card-collection', collection.id);
    setIsCheckingOut(true);

    try {
      await updateCollection(collection.id, {
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
      });

      const response = await fetch('/api/checkout/card-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: collection.id }),
      });

      if (!response.ok) throw new Error('Falha ao criar checkout');

      const { url } = await response.json();
      clearLocalStorage();
      clearDraft();
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

  const canCheckout =
    !errors.contactName &&
    !errors.contactEmail &&
    !!contactName.trim() &&
    !!contactEmail.trim() &&
    canProceedToCheckout();

  return (
    <FullscreenStep
      emoji="💌"
      title={`Falta pouco pra liberar pra ${truncatedName}`}
      subtitle="Liberação imediata após o pagamento. Você decide quando enviar."
      showProgress={true}
      showBackLink={false}
      showPriceBadge={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* 1. Como funciona + price + social proof */}
        <div className="rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-2 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-center text-gray-800">
              ✨ Presente para {recipientName}
            </h3>
            <p className="text-xs text-center text-gray-500 mt-0.5">
              De: {senderName}, com carinho
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
            <div className="px-3 py-4 space-y-1.5">
              <div className="text-2xl">📩</div>
              <p className="text-xs font-semibold text-gray-700">Você recebe o link</p>
              <p className="text-[11px] text-gray-500 leading-tight">no seu email, na hora</p>
            </div>
            <div className="px-3 py-4 space-y-1.5">
              <div className="text-2xl">🎁</div>
              <p className="text-xs font-semibold text-gray-700">Você decide quando enviar</p>
              <p className="text-[11px] text-gray-500 leading-tight">{recipientName} não recebe nada agora</p>
            </div>
            <div className="px-3 py-4 space-y-1.5">
              <div className="text-2xl">💌</div>
              <p className="text-xs font-semibold text-gray-700">12 cartas desbloqueadas</p>
              <p className="text-[11px] text-gray-500 leading-tight">acesso para sempre</p>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 flex justify-center">
            <PriceBadge productType="card-collection" variant="compact" contextLine="Acesso para sempre" />
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500">
            <span>⭐⭐⭐⭐⭐</span>
            <span>+800 presentes entregues</span>
            <span>·</span>
            <span>🔒 Pagamento seguro</span>
          </div>
        </div>

        {/* 2. Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
              👤 Seu nome completo
            </label>
            <input
              id="contactName"
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Ex: João da Silva"
              maxLength={100}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                errors.contactName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
              }`}
            />
            {errors.contactName && <p className="text-sm text-red-600">{errors.contactName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
              📩 Seu email (o link cai aqui)
            </label>
            <input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder="seu@email.com"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                errors.contactEmail ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
              }`}
            />
            {errors.contactEmail && <p className="text-sm text-red-600">{errors.contactEmail}</p>}
            <p className="text-xs text-gray-500">
              Você gerencia tudo pelo painel. {recipientName} só recebe quando você decidir.
            </p>
          </div>
        </div>

        {!canProceedToCheckout() && (
          <p className="text-sm text-amber-600 text-center bg-amber-50 p-3 rounded-lg">
            ⚠️ Complete todas as cartas antes de finalizar
          </p>
        )}

        {/* 3. Botão de voltar + finalize */}
        <WizardNavigation
          onPrev={prevStep}
          onFinalize={handleFinalize}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={isSaving || isCheckingOut}
          canProceed={canCheckout}
          finalizeLabel={`💌 Presentear ${truncatedName} agora`}
          prevLabel="← Quero ajustar algo antes"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-[11px] text-gray-400"
        >
          Entrega instantânea · Sem assinatura · Cancele quando quiser
        </motion.p>
      </div>
    </FullscreenStep>
  );
}
