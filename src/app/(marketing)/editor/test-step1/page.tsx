'use client';

import React from 'react';
import { WizardProvider } from '@/contexts/WizardContext';
import { Step1PageTitleURL } from '@/components/wizard/steps';
import { Button } from '@/components/ui/Button';
import { useWizard } from '@/contexts/WizardContext';

/**
 * Test Page Content Component
 * Wrapped in WizardProvider to access wizard context
 */
function TestPageContent() {
  const { data, stepValidation, validateCurrentStep } = useWizard();

  const handleValidate = () => {
    const isValid = validateCurrentStep();
    console.log('Validation result:', isValid);
    console.log('Current data:', data);
    console.log('Validation errors:', stepValidation[1]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test: Step 1 - Page Title and URL
            </h1>
            <p className="text-gray-600">
              Testing the first step of the wizard with title and URL slug inputs.
            </p>
          </div>

          <Step1PageTitleURL />

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button onClick={handleValidate} className="w-full">
              Validate Step
            </Button>
          </div>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Debug Info:</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify({ 
                pageTitle: data.pageTitle,
                urlSlug: data.urlSlug,
                validation: stepValidation[1]
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Test Page for Step 1 Component
 */
export default function TestStep1Page() {
  return (
    <WizardProvider>
      <TestPageContent />
    </WizardProvider>
  );
}
