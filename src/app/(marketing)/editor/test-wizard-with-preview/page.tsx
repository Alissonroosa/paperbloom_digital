'use client';

import { WizardProvider, useWizard } from '@/contexts/WizardContext';
import { WizardStepper } from '@/components/wizard/WizardStepper';
import { PreviewPanel } from '@/components/wizard/PreviewPanel';
import { STEP_LABELS } from '@/types/wizard';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

/**
 * Wizard Content Component
 * Demonstrates full integration of wizard steps with preview panel
 */
function WizardContent() {
  const {
    currentStep,
    data,
    uploads,
    ui,
    updateField,
    updateUIState,
    nextStep,
    previousStep,
  } = useWizard();

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Wizard with Preview Panel</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Complete wizard integration with real-time preview
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-6 md:mb-8">
          <WizardStepper
            currentStep={currentStep}
            totalSteps={7}
            completedSteps={new Set()}
            onStepClick={() => {}}
            stepLabels={STEP_LABELS}
          />
        </div>

        {/* Main Content Grid - Stacks vertically on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Wizard Steps - Full width on mobile, half on desktop */}
          <div className="w-full">
            <Card className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
                Step {currentStep}: {STEP_LABELS[currentStep - 1]}
              </h2>

              {/* Step 1: Title and URL */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pageTitle" className="text-sm md:text-base">Page Title</Label>
                    <Input
                      id="pageTitle"
                      value={data.pageTitle}
                      onChange={(e) => updateField('pageTitle', e.target.value)}
                      placeholder="Enter page title"
                      className="min-h-[44px] text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="urlSlug" className="text-sm md:text-base">URL Slug</Label>
                    <Input
                      id="urlSlug"
                      value={data.urlSlug}
                      onChange={(e) => updateField('urlSlug', e.target.value)}
                      placeholder="enter-url-slug"
                      className="min-h-[44px] text-base"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Special Date */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="specialDate" className="text-sm md:text-base">Special Date</Label>
                    <Input
                      id="specialDate"
                      type="date"
                      value={data.specialDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) =>
                        updateField('specialDate', e.target.value ? new Date(e.target.value) : null)
                      }
                      className="min-h-[44px] text-base"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Main Message */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipientName" className="text-sm md:text-base">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      value={data.recipientName}
                      onChange={(e) => updateField('recipientName', e.target.value)}
                      placeholder="Enter recipient name"
                      className="min-h-[44px] text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderName" className="text-sm md:text-base">Your Name</Label>
                    <Input
                      id="senderName"
                      value={data.senderName}
                      onChange={(e) => updateField('senderName', e.target.value)}
                      placeholder="Enter your name"
                      className="min-h-[44px] text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mainMessage" className="text-sm md:text-base">Main Message</Label>
                    <Textarea
                      id="mainMessage"
                      value={data.mainMessage}
                      onChange={(e) => updateField('mainMessage', e.target.value)}
                      placeholder="Enter your message"
                      rows={6}
                      className="min-h-[120px] text-base"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.mainMessage.length}/500 characters
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Photos */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Photo upload functionality would go here
                  </p>
                </div>
              )}

              {/* Step 5: Theme */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backgroundColor" className="text-sm md:text-base">Background Color</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={data.backgroundColor}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="min-h-[44px] w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-sm md:text-base">Theme</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {['gradient', 'bright', 'matte', 'pastel', 'neon', 'vintage'].map((theme) => (
                        <Button
                          key={theme}
                          variant={data.theme === theme ? 'primary' : 'outline'}
                          onClick={() => updateField('theme', theme)}
                          className="capitalize min-h-[44px] min-w-[44px] flex-1 sm:flex-none"
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Music */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="youtubeUrl" className="text-sm md:text-base">YouTube URL (optional)</Label>
                    <Input
                      id="youtubeUrl"
                      value={data.youtubeUrl}
                      onChange={(e) => updateField('youtubeUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="min-h-[44px] text-base"
                    />
                  </div>
                </div>
              )}

              {/* Step 7: Contact Info */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactName" className="text-sm md:text-base">Name</Label>
                    <Input
                      id="contactName"
                      value={data.contactName}
                      onChange={(e) => updateField('contactName', e.target.value)}
                      placeholder="Enter your name"
                      className="min-h-[44px] text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail" className="text-sm md:text-base">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={data.contactEmail}
                      onChange={(e) => updateField('contactEmail', e.target.value)}
                      placeholder="your@email.com"
                      className="min-h-[44px] text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone" className="text-sm md:text-base">Phone</Label>
                    <Input
                      id="contactPhone"
                      value={data.contactPhone}
                      onChange={(e) => updateField('contactPhone', e.target.value)}
                      placeholder="(XX) XXXXX-XXXX"
                      className="min-h-[44px] text-base"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons - Touch-friendly on mobile */}
              <div className="flex justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t gap-3">
                <Button
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 1}
                  className="min-h-[44px] min-w-[44px] flex-1 md:flex-none"
                >
                  Previous
                </Button>
                <Button 
                  onClick={nextStep} 
                  disabled={currentStep === 7}
                  className="min-h-[44px] min-w-[44px] flex-1 md:flex-none"
                >
                  {currentStep === 7 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </Card>

            {/* Info Card - Hidden on mobile to save space */}
            <Card className="p-4 md:p-6 mt-4 md:mt-6 hidden md:block">
              <h3 className="font-semibold mb-3">Preview Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Real-time updates within 300ms</li>
                <li>✓ Toggle between Card and Cinema views</li>
                <li>✓ Sticky preview on desktop</li>
                <li>✓ Floating button on mobile</li>
                <li>✓ View mode persists across steps</li>
              </ul>
            </Card>
          </div>

          {/* Right: Preview Panel */}
          <PreviewPanel
            data={data}
            uploads={uploads}
            viewMode={ui.previewMode}
            onViewModeChange={(mode) => updateUIState({ previewMode: mode })}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Test page for complete wizard with preview integration
 */
export default function TestWizardWithPreviewPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
