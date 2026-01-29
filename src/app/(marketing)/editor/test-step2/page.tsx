'use client';

import React from 'react';
import { WizardProvider } from '@/contexts/WizardContext';
import { Step2SpecialDate } from '@/components/wizard/steps';

/**
 * Test page for Step 2: Special Date component
 * Allows testing the date picker functionality in isolation
 */
export default function TestStep2Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test: Step 2 - Special Date
            </h1>
            <p className="text-gray-600">
              Testing the special date selection component
            </p>
          </div>

          <WizardProvider>
            <Step2SpecialDate />
          </WizardProvider>
        </div>
      </div>
    </div>
  );
}
