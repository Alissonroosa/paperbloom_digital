'use client';

import React, { useEffect } from 'react';
import { WizardProvider, useWizard } from '@/contexts/WizardContext';
import { Step4PhotoUpload } from '@/components/wizard/steps/Step4PhotoUpload';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Inner component that sets the step
 */
function TestStep4Content() {
  const { setStep } = useWizard();

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <Step4PhotoUpload />
    </div>
  );
}

/**
 * Test page for Step 4: Photo Upload
 * Allows testing the photo upload component in isolation
 */
export default function TestStep4Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/editor">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste: Step 4 - Photo Upload
          </h1>
          <p className="text-gray-600">
            Página de teste para o componente de upload de fotos do wizard.
          </p>
        </div>

        {/* Wizard Provider with Step 4 */}
        <WizardProvider>
          <TestStep4Content />

          {/* Debug Info */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Estado do Wizard (Debug)
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Instruções:</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Teste o upload de imagem principal (arraste ou clique)</li>
                  <li>Teste o upload de até 3 imagens da galeria</li>
                  <li>Teste a validação de formato (apenas JPEG, PNG, WebP)</li>
                  <li>Teste a validação de tamanho (máximo 5MB)</li>
                  <li>Teste a remoção de imagens</li>
                  <li>Teste a substituição de imagens</li>
                  <li>Abra o console do navegador para ver logs de upload</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Funcionalidades:</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>✅ Drag and drop para upload</li>
                  <li>✅ Validação de formato de imagem</li>
                  <li>✅ Validação de tamanho de arquivo</li>
                  <li>✅ Indicadores de progresso de upload</li>
                  <li>✅ Remoção e substituição de imagens</li>
                  <li>✅ Preview de imagens carregadas</li>
                  <li>✅ Mensagens de erro descritivas</li>
                </ul>
              </div>
            </div>
          </div>
        </WizardProvider>
      </div>
    </div>
  );
}
