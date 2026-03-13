'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useWizard } from '@/contexts/WizardContext';
import { XCircle, User, Mail, Phone, CheckCircle2, Calendar, Image as ImageIcon, Palette, Music } from 'lucide-react';

/**
 * Step 7: Contact Info and Summary Component
 * Collects contact information and displays a summary of all entered data
 * Features:
 * - Name, email, and phone input fields
 * - Email format validation
 * - Brazilian phone format validation
 * - Summary of all wizard steps
 * - Enables "Proceed to Payment" button when valid
 */
export function Step7ContactInfo() {
  const { data, updateField, stepValidation, currentStep } = useWizard();

  const errors = stepValidation[currentStep]?.errors || {};

  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    let formatted = '';
    if (digits.length > 0) {
      formatted = '(' + digits.substring(0, 2);
      if (digits.length > 2) {
        formatted += ') ' + digits.substring(2, digits.length <= 10 ? 6 : 7);
      }
      if (digits.length > 6) {
        formatted += '-' + digits.substring(digits.length <= 10 ? 6 : 7, 11);
      }
    }
    
    updateField('contactPhone', formatted);
  };

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Não informada';
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  };

  // Get theme display name
  const getThemeName = (theme: string): string => {
    const themeMap: Record<string, string> = {
      light: 'Claro',
      dark: 'Escuro',
      gradient: 'Gradiente',
    };
    return themeMap[theme] || theme;
  };

  // Count uploaded images
  const uploadedImagesCount = [
    data.mainImage,
    ...data.galleryImages.filter(img => img !== null),
  ].filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informações de Contato
        </h2>
        <p className="text-gray-600">
          Para finalizar, precisamos de suas informações para enviar o link e QR Code da mensagem.
        </p>
      </div>

      {/* Contact Information Form */}
      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="contactName">
            Seu Nome Completo <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="contactName"
              type="text"
              value={data.contactName}
              onChange={(e) => updateField('contactName', e.target.value)}
              placeholder="Ex: João Silva"
              maxLength={100}
              className={`pl-10 ${errors.contactName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              aria-invalid={!!errors.contactName}
              aria-describedby={errors.contactName ? 'contactName-error' : undefined}
            />
          </div>
          <div className="flex justify-between items-center">
            {errors.contactName && (
              <p id="contactName-error" className="text-sm text-red-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.contactName}
              </p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {data.contactName.length}/100
            </p>
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="contactEmail">
            Seu Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="contactEmail"
              type="email"
              value={data.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="seu@email.com"
              className={`pl-10 ${errors.contactEmail ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              aria-invalid={!!errors.contactEmail}
              aria-describedby={errors.contactEmail ? 'contactEmail-error' : undefined}
            />
          </div>
          {errors.contactEmail && (
            <p id="contactEmail-error" className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {errors.contactEmail}
            </p>
          )}
          <p className="text-sm text-gray-600">
            Enviaremos o link e QR Code da sua mensagem para este email.
          </p>
        </div>

        {/* Phone Input */}
        <div className="space-y-2">
          <Label htmlFor="contactPhone">
            Seu Telefone <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="contactPhone"
              type="tel"
              value={data.contactPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(11) 98765-4321"
              maxLength={15}
              className={`pl-10 ${errors.contactPhone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              aria-invalid={!!errors.contactPhone}
              aria-describedby={errors.contactPhone ? 'contactPhone-error' : undefined}
            />
          </div>
          {errors.contactPhone && (
            <p id="contactPhone-error" className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {errors.contactPhone}
            </p>
          )}
          <p className="text-sm text-gray-600">
            Formato: (XX) XXXXX-XXXX
          </p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumo da Sua Mensagem
        </h3>
        <div className="space-y-4">
          {/* Page Title */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Título da Página</p>
              <p className="text-sm text-gray-700 truncate">{data.pageTitle || 'Não informado'}</p>
              <p className="text-xs text-gray-500 mt-1">URL: /{data.urlSlug || 'não-definida'}</p>
            </div>
          </div>

          {/* Special Date */}
          {data.specialDate && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Data Especial</p>
                <p className="text-sm text-gray-700">{formatDate(data.specialDate)}</p>
              </div>
            </div>
          )}

          {/* Main Message */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Mensagem</p>
              <p className="text-sm text-gray-700">
                De <span className="font-medium">{data.senderName || '...'}</span> para{' '}
                <span className="font-medium">{data.recipientName || '...'}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {data.mainMessage || 'Nenhuma mensagem escrita'}
              </p>
            </div>
          </div>

          {/* Photos */}
          {uploadedImagesCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <ImageIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Fotos</p>
                <p className="text-sm text-gray-700">
                  {uploadedImagesCount} {uploadedImagesCount === 1 ? 'foto adicionada' : 'fotos adicionadas'}
                </p>
              </div>
            </div>
          )}

          {/* Theme */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Palette className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Tema</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: data.backgroundColor }}
                  aria-label={`Cor de fundo: ${data.backgroundColor}`}
                />
                <p className="text-sm text-gray-700">
                  {getThemeName(data.theme)}
                </p>
              </div>
              {data.customEmoji && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl" role="img" aria-label="Emoji selecionado">
                    {data.customEmoji}
                  </span>
                  <p className="text-xs text-gray-600">
                    Emoji animado
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Music */}
          {data.youtubeUrl && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Music className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Música</p>
                <p className="text-sm text-gray-700">
                  Música do YouTube adicionada
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Início: {Math.floor(data.musicStartTime / 60)}:{(data.musicStartTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          🔒 Privacidade e Segurança
        </h3>
        <p className="text-sm text-blue-800">
          Suas informações são seguras conosco. Usaremos seu email apenas para enviar 
          o link e QR Code da sua mensagem. Não compartilharemos seus dados com terceiros.
        </p>
      </div>

      {/* Next Steps Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          📋 Próximos Passos
        </h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Clique em "Prosseguir para Pagamento" abaixo</li>
          <li>Complete o pagamento de forma segura via Stripe</li>
          <li>Receba o link e QR Code por email imediatamente</li>
          <li>Compartilhe sua mensagem especial!</li>
        </ol>
      </div>
    </div>
  );
}
