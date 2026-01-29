'use client';

import React from 'react';
import { WizardProvider } from '@/contexts/WizardContext';
import { Step7ContactInfo } from '@/components/wizard/steps/Step7ContactInfo';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Test page for Step 7: Contact Info and Summary
 * Allows isolated testing of the contact information and summary component
 */
export default function TestStep7Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test: Step 7 - Contact Info and Summary
          </h1>
          <p className="text-gray-600">
            Testing the contact information collection and summary display component
          </p>
        </div>

        <WizardProvider>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Step7ContactInfo />

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                className="flex items-center gap-2"
              >
                Prosseguir para Pagamento
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Testing Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              Testing Instructions
            </h2>
            <div className="space-y-4 text-sm text-blue-800">
              <div>
                <h3 className="font-semibold mb-1">Contact Information:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Test name input with character limit (100 chars)</li>
                  <li>Test email validation with valid/invalid formats</li>
                  <li>Test phone auto-formatting (try: 11987654321)</li>
                  <li>Verify all fields show required indicators</li>
                  <li>Check error messages display correctly</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Summary Display:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Verify page title and URL are shown</li>
                  <li>Check special date formatting (if set)</li>
                  <li>Confirm message details display correctly</li>
                  <li>Verify photo count is accurate</li>
                  <li>Check theme color preview</li>
                  <li>Confirm music info shows when URL is set</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Phone Formatting:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>11987654321 → (11) 98765-4321</li>
                  <li>1133334444 → (11) 3333-4444</li>
                  <li>Test partial input handling</li>
                  <li>Verify non-digit characters are removed</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Validation:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Empty fields should show errors</li>
                  <li>Invalid email format should be rejected</li>
                  <li>Invalid phone format should be rejected</li>
                  <li>Valid data should clear all errors</li>
                </ul>
              </div>
            </div>
          </div>
        </WizardProvider>
      </div>
    </div>
  );
}
