'use client';

import { WizardProvider } from '@/contexts/WizardContext';
import { WizardEditor } from '@/components/wizard';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Test page for the complete wizard integration
 * This demonstrates the full wizard flow without actual payment processing
 */
function TestWizardContent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleMockPayment = async () => {
    setIsProcessing(true);
    setMessage('Processing payment...');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setMessage('✅ Payment successful! In production, this would redirect to Stripe.');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-screen-2xl mx-auto">
          <Link 
            href="/" 
            className="font-serif text-xl font-bold tracking-tight text-text-main"
          >
            Paper Bloom - Test Wizard
          </Link>
          <div className="text-sm text-muted-foreground hidden md:block">
            Full Wizard Integration Test
          </div>
          <Link href="/editor">
            <Button size="sm" variant="ghost">
              Back to Editor
            </Button>
          </Link>
        </div>
      </header>

      {/* Success Message */}
      {message && (
        <div className="container px-4 md:px-8 max-w-screen-2xl mx-auto mt-4">
          <div className={`p-4 rounded-lg border ${
            message.includes('✅') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* Wizard */}
      <WizardEditor
        onPaymentClick={handleMockPayment}
        isCreatingCheckout={isProcessing}
      />

      {/* Info Footer */}
      <div className="container px-4 md:px-8 max-w-screen-2xl mx-auto pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Test Mode</h3>
          <p className="text-sm text-blue-800 mb-4">
            This is a test page for the complete wizard integration. The payment button will simulate processing without actually charging anything.
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ All 7 wizard steps are functional</li>
            <li>✓ Real-time preview updates</li>
            <li>✓ Auto-save functionality</li>
            <li>✓ Form validation</li>
            <li>✓ Mobile responsive design</li>
            <li>✓ Step navigation with validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Test page wrapper with WizardProvider
 */
export default function TestFullWizardPage() {
  return (
    <WizardProvider>
      <TestWizardContent />
    </WizardProvider>
  );
}
