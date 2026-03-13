'use client';

import React, { useState } from 'react';
import { WizardStepper } from '@/components/wizard';

/**
 * Test page for WizardStepper component
 * Demonstrates the stepper functionality with interactive controls
 */
export default function TestWizardStepperPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.add(currentStep);
        return newSet;
      });
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            WizardStepper Component Test
          </h1>
          <p className="text-gray-600 mb-8">
            Test the wizard stepper navigation component with interactive controls
          </p>

          {/* Stepper Component */}
          <div className="mb-8">
            <WizardStepper
              currentStep={currentStep}
              totalSteps={7}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Current Step Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-indigo-900 mb-2">
              Current Step: {currentStep}
            </h2>
            <p className="text-indigo-700">
              Completed Steps: {completedSteps.size > 0 ? (() => {
                const steps: number[] = [];
                completedSteps.forEach(step => steps.push(step));
                return steps.join(', ');
              })() : 'None'}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === 7}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors ml-auto"
            >
              Reset
            </button>
          </div>

          {/* Feature List */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Demonstrated:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Visual stepper showing all 7 steps with progress visualization</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Click handlers for step navigation (completed and current steps)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Different styling for active, completed, and pending steps</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Progress bar showing completion percentage</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Responsive design (desktop horizontal, mobile vertical)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Accessibility features (ARIA labels, keyboard navigation)</span>
              </li>
            </ul>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use "Next" to progress through steps and mark them as completed</li>
              <li>• Click on completed steps to navigate back</li>
              <li>• Pending steps (not yet reached) are not clickable</li>
              <li>• Resize your browser to see the responsive mobile layout</li>
              <li>• Use "Reset" to start over</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
