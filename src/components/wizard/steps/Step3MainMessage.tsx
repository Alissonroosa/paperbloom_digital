'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useWizard } from '@/contexts/WizardContext';
import { TextSuggestionPanel } from '@/components/editor/TextSuggestionPanel';
import { XCircle, Sparkles } from 'lucide-react';

/**
 * Step 3: Main Message Component
 * Allows users to write the main message with recipient and sender names
 * Features:
 * - Recipient and sender name fields
 * - Main message textarea with character counter (500 max)
 * - Text suggestion panel integration
 * - Real-time validation
 * - Updates preview as user types
 */
export function Step3MainMessage() {
  const { data, updateField, stepValidation, currentStep } = useWizard();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const errors = stepValidation[currentStep]?.errors || {};
  const characterCount = data.mainMessage.length;
  const maxCharacters = 500;
  const characterPercentage = (characterCount / maxCharacters) * 100;

  // Determine character counter color based on usage
  const getCharacterCountColor = () => {
    if (characterPercentage >= 100) return 'text-red-600';
    if (characterPercentage >= 90) return 'text-orange-600';
    if (characterPercentage >= 75) return 'text-yellow-600';
    return 'text-gray-500';
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (text: string) => {
    updateField('mainMessage', text);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Mensagem Principal
        </h2>
        <p className="text-gray-600">
          Escreva a mensagem que você quer transmitir ao destinatário.
        </p>
      </div>

      {/* Recipient Name Input */}
      <div className="space-y-2">
        <Label htmlFor="recipientName">
          Para quem é a mensagem? <span className="text-red-500">*</span>
        </Label>
        <Input
          id="recipientName"
          type="text"
          value={data.recipientName}
          onChange={(e) => updateField('recipientName', e.target.value)}
          placeholder="Ex: Maria"
          maxLength={100}
          className={errors.recipientName ? 'border-red-500 focus-visible:ring-red-500' : ''}
          aria-invalid={!!errors.recipientName}
          aria-describedby={errors.recipientName ? 'recipientName-error' : undefined}
        />
        <div className="flex justify-between items-center">
          {errors.recipientName && (
            <p id="recipientName-error" className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {errors.recipientName}
            </p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {data.recipientName.length}/100
          </p>
        </div>
      </div>

      {/* Sender Name Input */}
      <div className="space-y-2">
        <Label htmlFor="senderName">
          Quem está enviando? <span className="text-red-500">*</span>
        </Label>
        <Input
          id="senderName"
          type="text"
          value={data.senderName}
          onChange={(e) => updateField('senderName', e.target.value)}
          placeholder="Ex: João"
          maxLength={100}
          className={errors.senderName ? 'border-red-500 focus-visible:ring-red-500' : ''}
          aria-invalid={!!errors.senderName}
          aria-describedby={errors.senderName ? 'senderName-error' : undefined}
        />
        <div className="flex justify-between items-center">
          {errors.senderName && (
            <p id="senderName-error" className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {errors.senderName}
            </p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {data.senderName.length}/100
          </p>
        </div>
      </div>

      {/* Main Message Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="mainMessage">
            Sua Mensagem <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestions(true)}
            className="flex items-center gap-2"
            aria-label="Abrir sugestões de texto"
          >
            <Sparkles className="w-4 h-4" />
            Sugestões
          </Button>
        </div>
        <Textarea
          id="mainMessage"
          value={data.mainMessage}
          onChange={(e) => updateField('mainMessage', e.target.value)}
          placeholder="Escreva sua mensagem aqui..."
          maxLength={maxCharacters}
          rows={8}
          className={errors.mainMessage ? 'border-red-500 focus-visible:ring-red-500' : ''}
          aria-invalid={!!errors.mainMessage}
          aria-describedby={errors.mainMessage ? 'mainMessage-error' : 'mainMessage-counter'}
        />
        <div className="flex justify-between items-center">
          {errors.mainMessage && (
            <p id="mainMessage-error" className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {errors.mainMessage}
            </p>
          )}
          <p 
            id="mainMessage-counter" 
            className={`text-sm ml-auto font-medium ${getCharacterCountColor()}`}
          >
            {characterCount}/{maxCharacters}
          </p>
        </div>
        {characterPercentage >= 90 && characterPercentage < 100 && (
          <p className="text-sm text-orange-600">
            Você está próximo do limite de caracteres.
          </p>
        )}
        {characterPercentage >= 100 && (
          <p className="text-sm text-red-600 font-medium">
            Limite de caracteres atingido!
          </p>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          💡 Dica
        </h3>
        <p className="text-sm text-gray-700">
          Seja autêntico e escreva do coração. Você pode usar o botão "Sugestões" 
          para se inspirar e depois personalizar a mensagem do seu jeito.
        </p>
      </div>

      {/* Text Suggestion Panel Modal */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuggestions(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="suggestion-panel-title"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <TextSuggestionPanel
              field="message"
              currentValue={data.mainMessage}
              onSelectSuggestion={handleSelectSuggestion}
              onClose={() => setShowSuggestions(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
