'use client';

import React from 'react';
import { WizardProvider } from '@/contexts/WizardContext';
import { Step3MainMessage } from '@/components/wizard/steps/Step3MainMessage';
import { Card } from '@/components/ui/Card';

/**
 * Test page for Step 3: Main Message component
 * Allows isolated testing of the main message step
 */
export default function TestStep3Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test: Step 3 - Main Message
          </h1>
          <p className="text-gray-600">
            Testing the main message component with recipient, sender, and message fields.
          </p>
        </div>

        <WizardProvider>
          <Card className="p-6">
            <Step3MainMessage />
          </Card>
        </WizardProvider>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Test Instructions
          </h2>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Enter recipient and sender names (required fields)</li>
            <li>Write a message in the textarea (max 500 characters)</li>
            <li>Click "Sugestões" to open the text suggestion panel</li>
            <li>Select a suggestion to populate the message field</li>
            <li>Verify character counter updates in real-time</li>
            <li>Test validation by leaving fields empty</li>
            <li>Verify color changes as character count approaches limit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
