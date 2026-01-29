'use client';

import React from 'react';
import { WizardProvider } from '@/contexts/WizardContext';
import { Step6MusicSelection } from '@/components/wizard/steps/Step6MusicSelection';
import { Card } from '@/components/ui/Card';

/**
 * Test page for Step 6: Music Selection
 * Allows isolated testing of the music selection component
 */
export default function TestStep6Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test: Step 6 - Music Selection
          </h1>
          <p className="text-gray-600">
            Isolated testing environment for the music selection component
          </p>
        </div>

        <WizardProvider>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Component Test Area */}
            <Card className="p-6">
              <Step6MusicSelection />
            </Card>

            {/* Testing Instructions */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Testing Checklist
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="test1" className="mt-1" />
                    <label htmlFor="test1" className="text-sm text-gray-700">
                      <strong>URL Input:</strong> Enter various YouTube URL formats
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="test2" className="mt-1" />
                    <label htmlFor="test2" className="text-sm text-gray-700">
                      <strong>Validation:</strong> Test with invalid URLs (non-YouTube)
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="test3" className="mt-1" />
                    <label htmlFor="test3" className="text-sm text-gray-700">
                      <strong>Video ID:</strong> Verify video ID extraction works
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="test4" className="mt-1" />
                    <label htmlFor="test4" className="text-sm text-gray-700">
                      <strong>Start Time:</strong> Adjust slider and verify time display
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="test5" className="mt-1" />
                    <label htmlFor="test5" className="text-sm text-gray-700">
                      <strong>Preview:</strong> Check if YouTube player loads correctly
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="test6" className="mt-1" />
                    <label htmlFor="test6" className="text-sm text-gray-700">
                      <strong>Clear Button:</strong> Test clearing the URL
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="test7" className="mt-1" />
                    <label htmlFor="test7" className="text-sm text-gray-700">
                      <strong>Optional Skip:</strong> Verify empty URL is accepted
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="test8" className="mt-1" />
                    <label htmlFor="test8" className="text-sm text-gray-700">
                      <strong>Accessibility:</strong> Test keyboard navigation
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Test URLs
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Valid URLs:</p>
                    <ul className="space-y-1 text-gray-700 font-mono text-xs">
                      <li className="break-all">
                        https://www.youtube.com/watch?v=dQw4w9WgXcQ
                      </li>
                      <li className="break-all">
                        https://youtu.be/dQw4w9WgXcQ
                      </li>
                      <li className="break-all">
                        https://www.youtube.com/embed/dQw4w9WgXcQ
                      </li>
                      <li className="break-all">
                        https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Invalid URLs:</p>
                    <ul className="space-y-1 text-gray-700 font-mono text-xs">
                      <li className="break-all">
                        https://vimeo.com/123456789
                      </li>
                      <li className="break-all">
                        https://www.example.com/video
                      </li>
                      <li className="break-all">
                        not-a-url
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <h2 className="text-lg font-bold text-blue-900 mb-2">
                  Requirements Coverage
                </h2>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>✓ 7.1: YouTube URL input field</li>
                  <li>✓ 7.2: YouTube URL validation</li>
                  <li>✓ 7.3: Video ID extraction</li>
                  <li>✓ 7.4: Start time slider (0-300s)</li>
                  <li>✓ 7.5: Optional skip functionality</li>
                  <li>✓ 7.6: Music preview player</li>
                </ul>
              </Card>
            </div>
          </div>
        </WizardProvider>
      </div>
    </div>
  );
}
