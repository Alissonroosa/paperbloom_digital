'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation } from '@/contexts/InteractiveWizardContext';
import { useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { PriceBadge } from '@/components/interactive-wizard/PriceBadge';
import { motion } from 'framer-motion';

/**
 * Step 1: Informações Básicas
 * Collect recipient name (Para:) and sender name (De:)
 */
export function Step1BasicInfo() {
  const { nextStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { collection, updateCollection, isSaving } = useCardCollectionEditor();

  const [recipientName, setRecipientName] = useState(collection?.recipientName || '');
  const [senderName, setSenderName] = useState(collection?.senderName || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (collection) {
      if (collection.recipientName && collection.recipientName !== 'Destinatário') {
        setRecipientName(collection.recipientName);
      }
      if (collection.senderName && collection.senderName !== 'Remetente') {
        setSenderName(collection.senderName);
      }
    }
  }, [collection]);

  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!recipientName.trim()) {
      newErrors.recipientName = 'Digite o nome de quem vai receber';
    } else if (recipientName.length > 100) {
      newErrors.recipientName = 'Nome deve ter no máximo 100 caracteres';
    }

    if (!senderName.trim()) {
      newErrors.senderName = 'Digite seu nome';
    } else if (senderName.length > 100) {
      newErrors.senderName = 'Nome deve ter no máximo 100 caracteres';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setStepValidation(0, { isValid, errors: newErrors });
    return isValid;
  };

  useEffect(() => {
    if (recipientName || senderName) {
      validateFields();
    }
  }, [recipientName, senderName]);

  const handleNext = async () => {
    if (!validateFields() || !collection) return;

    try {
      await updateCollection(collection.id, {
        recipientName: recipientName.trim(),
        senderName: senderName.trim(),
      });
      nextStep();
    } catch (error) {
      console.error('Failed to save basic info:', error);
    }
  };

  const canProceed = !errors.recipientName && !errors.senderName && 
                     !!recipientName.trim() && !!senderName.trim();

  return (
    <FullscreenStep
      emoji="💌"
      title="Vamos criar algo especial!"
      subtitle="12 cartas cheias de amor para momentos únicos da pessoa que você ama"
      showProgress={true}
      showBackLink={true}
      backLinkHref="/"
      backLinkText="← Voltar"
      showDemoLink={true}
      demoLinkHref="/demo/card-collection"
      showPriceBadge={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">

        {/* How it works + trust block */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden"
        >
          {/* 3 bullets — como funciona */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
            <div className="px-3 py-4 space-y-1.5">
              <div className="text-2xl">✍️</div>
              <p className="text-xs font-semibold text-gray-700">Você personaliza</p>
              <p className="text-[11px] text-gray-500 leading-tight">mensagem e foto em cada carta</p>
            </div>
            <div className="px-3 py-4 space-y-1.5">
              <div className="text-2xl">🎁</div>
              <p className="text-xs font-semibold text-gray-700">Você decide quando e como enviar</p>
              <p className="text-[11px] text-gray-500 leading-tight">com QRCode ou link, no momento certo</p>
            </div>
            <div className="px-3 py-4 space-y-1.5">
              <div className="text-2xl">💌</div>
              <p className="text-xs font-semibold text-gray-700">12 momentos únicos</p>
              <p className="text-[11px] text-gray-500 leading-tight">cada carta abre uma vez, para sempre</p>
            </div>
          </div>

          {/* Social proof */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500">
            <span>⭐⭐⭐⭐⭐</span>
            <span>+800 presentes entregues</span>
            <span>·</span>
            <span>🔒 Pagamento seguro</span>
          </div>

          {/* Price */}
          <div className="px-5 py-3 border-t border-gray-100 flex justify-center">
            <PriceBadge productType="card-collection" variant="compact" contextLine="Acesso para sempre" />
          </div>
        </motion.div>

        {/* Recipient Name */}
        <div className="space-y-2">
          <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
            💝 Para quem são essas cartas?
          </label>
          <input
            id="recipientName"
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Ex: Maria, Amor, Mãe..."
            maxLength={100}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.recipientName 
                ? 'border-red-300 bg-red-50' 
                : 'border-pink-200 focus:border-pink-400'
            }`}
          />
          {errors.recipientName && (
            <p className="text-sm text-red-600">{errors.recipientName}</p>
          )}
        </div>

        {/* Sender Name */}
        <div className="space-y-2">
          <label htmlFor="senderName" className="block text-sm font-medium text-gray-700">
            💜 E quem está enviando todo esse carinho?
          </label>
          <input
            id="senderName"
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Ex: João, Seu amor, Filha..."
            maxLength={100}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-300 ${
              errors.senderName 
                ? 'border-red-300 bg-red-50' 
                : 'border-purple-200 focus:border-purple-400'
            }`}
          />
          {errors.senderName && (
            <p className="text-sm text-red-600">{errors.senderName}</p>
          )}
        </div>

        <WizardNavigation
          onNext={handleNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={isSaving}
          canProceed={canProceed}
          nextLabel="Criar o presente →"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-gray-400 text-center"
        >
          Cada carta será personalizada com esses nomes 💕
        </motion.p>
      </div>
    </FullscreenStep>
  );
}
