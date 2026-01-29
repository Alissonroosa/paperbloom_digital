'use client';

import React, { useEffect, useState } from 'react';
import { WizardProvider, useWizard } from '@/contexts/WizardContext';
import { useWizardAutoSave } from '@/hooks/useWizardAutoSave';
import { WizardAutoSaveIndicator } from '@/components/wizard';
import { WizardStepper } from '@/components/wizard';
import { Button } from '@/components/ui/Button';

/**
 * Test page for wizard auto-save functionality
 * Demonstrates:
 * - Auto-save after 2 seconds of inactivity
 * - Visual auto-save indicator
 * - Restore on page load
 * - Start Over button to clear progress
 */
function WizardAutoSaveTest() {
  const { state, updateField, setStep, restoreState, resetState } = useWizard();
  const [hasRestoredOnMount, setHasRestoredOnMount] = useState(false);
  
  // Auto-save hook
  const { isSaving, lastSaved, restore, clear } = useWizardAutoSave({
    key: 'wizard-autosave-test',
    state,
    debounceMs: 2000,
    enabled: true,
  });

  // Restore saved state on mount
  useEffect(() => {
    if (!hasRestoredOnMount) {
      const savedState = restore();
      if (savedState) {
        restoreState(savedState);
        console.log('Restored wizard state from localStorage:', savedState);
      }
      setHasRestoredOnMount(true);
    }
  }, [hasRestoredOnMount, restore, restoreState]);

  // Handle Start Over
  const handleStartOver = () => {
    if (confirm('Tem certeza que deseja começar do zero? Todo o progresso será perdido.')) {
      clear();
      resetState();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Teste de Auto-Save do Wizard
          </h1>
          <p className="text-gray-600 mb-4">
            Esta página demonstra a funcionalidade de auto-save do wizard.
            Preencha os campos e aguarde 2 segundos para ver o auto-save em ação.
          </p>
          
          {/* Auto-save Indicator */}
          <WizardAutoSaveIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            onStartOver={handleStartOver}
          />
        </div>

        {/* Wizard Stepper */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <WizardStepper
            currentStep={state.currentStep}
            totalSteps={7}
            completedSteps={state.completedSteps}
            onStepClick={setStep}
            stepLabels={[
              'Título e URL',
              'Data Especial',
              'Mensagem',
              'Fotos',
              'Tema',
              'Música',
              'Contato',
            ]}
          />
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Etapa {state.currentStep}: Teste de Campos
          </h2>

          <div className="space-y-4">
            {/* Step 1 Fields */}
            {state.currentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título da Página
                  </label>
                  <input
                    type="text"
                    value={state.data.pageTitle}
                    onChange={(e) => updateField('pageTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o título..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={state.data.urlSlug}
                    onChange={(e) => updateField('urlSlug', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o slug..."
                  />
                </div>
              </>
            )}

            {/* Step 3 Fields */}
            {state.currentStep === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Destinatário
                  </label>
                  <input
                    type="text"
                    value={state.data.recipientName}
                    onChange={(e) => updateField('recipientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o nome..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem Principal
                  </label>
                  <textarea
                    value={state.data.mainMessage}
                    onChange={(e) => updateField('mainMessage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Digite a mensagem..."
                  />
                </div>
              </>
            )}

            {/* Step 7 Fields */}
            {state.currentStep === 7 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome de Contato
                  </label>
                  <input
                    type="text"
                    value={state.data.contactName}
                    onChange={(e) => updateField('contactName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o nome..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={state.data.contactEmail}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o email..."
                  />
                </div>
              </>
            )}

            {/* Other steps */}
            {![1, 3, 7].includes(state.currentStep) && (
              <p className="text-gray-600">
                Navegue para as etapas 1, 3 ou 7 para testar campos específicos.
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              onClick={() => setStep(Math.max(1, state.currentStep - 1))}
              disabled={state.currentStep === 1}
              variant="outline"
            >
              Anterior
            </Button>
            <Button
              onClick={() => setStep(Math.min(7, state.currentStep + 1))}
              disabled={state.currentStep === 7}
            >
              Próximo
            </Button>
          </div>
        </div>

        {/* State Debug Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Estado Atual (Debug)
          </h3>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">
            {JSON.stringify(
              {
                currentStep: state.currentStep,
                completedSteps: Array.from(state.completedSteps),
                data: state.data,
                autoSave: {
                  isSaving,
                  lastSaved: lastSaved?.toISOString(),
                },
              },
              null,
              2
            )}
          </pre>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Como Testar
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Preencha alguns campos e aguarde 2 segundos</li>
            <li>Observe o indicador mudar de "Salvando..." para "Salvo"</li>
            <li>Recarregue a página (F5) e veja os dados serem restaurados</li>
            <li>Clique em "Começar do Zero" para limpar o progresso</li>
            <li>Navegue entre as etapas e veja o estado ser preservado</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function WizardAutoSaveTestPage() {
  return (
    <WizardProvider>
      <WizardAutoSaveTest />
    </WizardProvider>
  );
}
