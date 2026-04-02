'use client';

import { useState, useEffect } from 'react';
import { FullscreenStep } from '@/components/interactive-wizard/FullscreenStep';
import { WizardNavigation } from '@/components/interactive-wizard/WizardNavigation';
import { useInteractiveWizardNavigation, useInteractiveWizardValidation, useInteractiveWizardAutoSave } from '@/contexts/InteractiveWizardContext';
import { useWizard } from '@/contexts/WizardContext';
import { analytics } from '@/lib/analytics';
import { Eye, Gift, Mail, Phone, User, CheckCircle, Image as ImageIcon } from 'lucide-react';

/**
 * Step 6: Finalizar
 * Contact info and checkout finalization
 */
export function Step6Finalize() {
  const { prevStep, isFirstStep, isLastStep } = useInteractiveWizardNavigation();
  const { setStepValidation } = useInteractiveWizardValidation();
  const { clearDraft } = useInteractiveWizardAutoSave();
  const { data, updateField, uploads, ui, resetState } = useWizard();
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

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
    setStepValidation(5, { isValid, errors: newErrors });
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
    analytics.initiatePayment('message', `${data.senderName}-para-${data.recipientName}`);

    setIsCheckingOut(true);

    try {
      // Get uploaded image URLs from uploads state (already uploaded in Step4)
      const mainImageUrl = uploads.mainImage.url || null;
      const galleryImageUrls = uploads.galleryImages
        .filter(img => img?.url)
        .map(img => img.url as string);

      console.log('[Step6Finalize] Using uploaded images:', { mainImageUrl, galleryImageUrls });

      setUploadProgress('Criando sua mensagem...');

      // Prepare payload - ensure empty strings become null for optional fields
      const payload = {
        recipientName: data.recipientName.trim(),
        senderName: data.senderName.trim(),
        messageText: data.mainMessage.trim(),
        title: `De ${data.senderName.trim()} para ${data.recipientName.trim()}`,
        specialDate: data.specialDate || null,
        showTimeCounter: data.showTimeCounter || false,
        timeCounterLabel: data.timeCounterLabel?.trim() || null,
        backgroundColor: data.backgroundColor || null,
        theme: data.theme || null,
        customEmoji: data.customEmoji || null,
        youtubeUrl: data.youtubeUrl?.trim() || null,
        musicStartTime: data.musicStartTime || 0,
        contactName: data.contactName.trim(),
        contactEmail: data.contactEmail.trim(),
        contactPhone: data.contactPhone.trim(),
        imageUrl: mainImageUrl,
        galleryImages: galleryImageUrls,
      };
      
      console.log('[Step6Finalize] Sending payload:', JSON.stringify(payload, null, 2));
      
      // Create the message first
      const messageResponse = await fetch('/api/messages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json();
        console.error('Message creation failed:', errorData);
        
        // Show detailed validation errors
        if (errorData.error?.details) {
          const details = Object.entries(errorData.error.details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n');
          throw new Error(`Erro de validação:\n${details}`);
        }
        
        throw new Error(errorData.error?.message || errorData.error || 'Falha ao criar mensagem');
      }

      const { id: messageId } = await messageResponse.json();

      // Create checkout session
      const checkoutResponse = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messageId,
          contactName: data.contactName.trim(),
          contactEmail: data.contactEmail.trim(),
          contactPhone: data.contactPhone.trim(),
        }),
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
      });
      alert(err instanceof Error ? err.message : 'Erro ao processar pagamento. Tente novamente.');
      setIsCheckingOut(false);
      setUploadProgress(null);
    }
  };

  const canCheckout = !errors.contactName && !errors.contactEmail && !errors.contactPhone && 
                      !!data.contactName && !!data.contactEmail && !!data.contactPhone;

  // Count photos
  const mainPhotoCount = data.mainImage ? 1 : 0;
  const galleryPhotoCount = data.galleryImages.filter(f => f !== null).length;
  const totalPhotos = mainPhotoCount + galleryPhotoCount;

  return (
    <FullscreenStep
      emoji="✨"
      title="Quase lá! Só mais um passo..."
      subtitle="Informe seus dados para receber o link da sua mensagem"
      showProgress={true}
      showBackLink={false}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200">
          <div className="flex items-center gap-3 mb-3">
            <Gift className="w-6 h-6 text-pink-600" />
            <h3 className="font-semibold text-gray-800">Sua mensagem está pronta!</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              De: {data.senderName} → Para: {data.recipientName}
            </p>
            {totalPhotos > 0 && (
              <p className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                {totalPhotos} foto{totalPhotos > 1 ? 's' : ''} incluída{totalPhotos > 1 ? 's' : ''}
              </p>
            )}
            {data.youtubeUrl && (
              <p className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                Música de fundo incluída
              </p>
            )}
            {data.specialDate && (
              <p className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                Data especial com contador
              </p>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">{uploadProgress}</span>
            </div>
          </div>
        )}

        {/* Contact Name */}
        <div className="space-y-2">
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
            Seu Nome Completo *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="contactName"
              type="text"
              value={data.contactName}
              onChange={(e) => updateField('contactName', e.target.value)}
              placeholder="Ex: João da Silva"
              maxLength={100}
              className={`w-full pl-12 pr-4 py-4 rounded-xl border ${
                errors.contactName 
                  ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
              } transition-colors`}
            />
          </div>
          {errors.contactName && (
            <p className="text-sm text-red-600">{errors.contactName}</p>
          )}
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="contactEmail"
              type="email"
              value={data.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="seu@email.com"
              className={`w-full pl-12 pr-4 py-4 rounded-xl border ${
                errors.contactEmail 
                  ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
              } transition-colors`}
            />
          </div>
          {errors.contactEmail && (
            <p className="text-sm text-red-600">{errors.contactEmail}</p>
          )}
          <p className="text-xs text-gray-500">
            📧 Enviaremos o link e QR Code da sua mensagem para este email
          </p>
        </div>

        {/* Contact Phone */}
        <div className="space-y-2">
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
            WhatsApp *
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="contactPhone"
              type="tel"
              value={data.contactPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(11) 99999-9999"
              className={`w-full pl-12 pr-4 py-4 rounded-xl border ${
                errors.contactPhone 
                  ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
              } transition-colors`}
            />
          </div>
          {errors.contactPhone && (
            <p className="text-sm text-red-600">{errors.contactPhone}</p>
          )}
        </div>

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
          onPrev={handlePrev}
          onFinalize={handleFinalize}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isLoading={ui.isAutoSaving || isCheckingOut}
          canProceed={canCheckout}
          finalizeLabel="Finalizar e Pagar →"
        />
      </div>
    </FullscreenStep>
  );
}
