'use client';

import React, { useState } from 'react';
import { MomentNavigation } from '@/components/card-editor/MomentNavigation';
import { THEMATIC_MOMENTS, MomentCompletionStatus } from '@/contexts/CardCollectionEditorContext';

/**
 * Test page for MomentNavigation component
 * Tests all visual states and interactions
 */
export default function MomentNavigationTestPage() {
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [scenario, setScenario] = useState<'empty' | 'partial' | 'complete'>('empty');

  // Generate completion status based on scenario
  const getCompletionStatus = (): Record<number, MomentCompletionStatus> => {
    switch (scenario) {
      case 'empty':
        return {
          0: { totalCards: 4, completedCards: 0, percentage: 0 },
          1: { totalCards: 4, completedCards: 0, percentage: 0 },
          2: { totalCards: 4, completedCards: 0, percentage: 0 },
        };
      case 'partial':
        return {
          0: { totalCards: 4, completedCards: 4, percentage: 100 },
          1: { totalCards: 4, completedCards: 2, percentage: 50 },
          2: { totalCards: 4, completedCards: 0, percentage: 0 },
        };
      case 'complete':
        return {
          0: { totalCards: 4, completedCards: 4, percentage: 100 },
          1: { totalCards: 4, completedCards: 4, percentage: 100 },
          2: { totalCards: 4, completedCards: 4, percentage: 100 },
        };
    }
  };

  const completionStatus = getCompletionStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MomentNavigation Component Test
          </h1>
          <p className="text-gray-600">
            Test page for the MomentNavigation component with different scenarios
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Controls</h2>
          
          {/* Scenario Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Scenario
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setScenario('empty')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scenario === 'empty'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Empty
              </button>
              <button
                onClick={() => setScenario('partial')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scenario === 'partial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Partial Progress
              </button>
              <button
                onClick={() => setScenario('complete')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scenario === 'complete'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Complete
              </button>
            </div>
          </div>

          {/* Current State Display */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current State</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-xs text-gray-500 mb-1">Active Moment</div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentMomentIndex + 1} - {THEMATIC_MOMENTS[currentMomentIndex].title}
                </div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-xs text-gray-500 mb-1">Scenario</div>
                <div className="text-lg font-semibold text-gray-900 capitalize">
                  {scenario}
                </div>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-xs text-gray-500 mb-1">Overall Progress</div>
                <div className="text-lg font-semibold text-gray-900">
                  {Object.values(completionStatus).reduce((sum, s) => sum + s.completedCards, 0)}/12 cards
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Test */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Component</h2>
          
          <MomentNavigation
            moments={THEMATIC_MOMENTS}
            currentMomentIndex={currentMomentIndex}
            onMomentChange={setCurrentMomentIndex}
            completionStatus={completionStatus}
          />
        </div>

        {/* Completion Status Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Completion Status Details
          </h2>
          <div className="space-y-4">
            {THEMATIC_MOMENTS.map((moment) => {
              const status = completionStatus[moment.index];
              return (
                <div
                  key={moment.index}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {moment.index + 1}. {moment.title}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {status.completedCards}/{status.totalCards} cards ({status.percentage}%)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{moment.description}</p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Responsive Test Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Testing Instructions
          </h2>
          <div className="space-y-2 text-sm text-blue-800">
            <p>✓ Click different moment buttons to test navigation</p>
            <p>✓ Try different scenarios to see progress indicators</p>
            <p>✓ Resize browser window to test responsive layout</p>
            <p>✓ Use Tab key to test keyboard navigation</p>
            <p>✓ Use screen reader to test accessibility</p>
            <p>✓ Check that active moment is clearly highlighted</p>
            <p>✓ Verify progress bars update correctly</p>
            <p>✓ Confirm completion icons show for 100% moments</p>
          </div>
        </div>

        {/* Requirements Validation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">
            Requirements Validation
          </h2>
          <div className="space-y-2 text-sm text-green-800">
            <p>✓ <strong>7.1</strong>: Display navigation buttons for 3 thematic moments</p>
            <p>✓ <strong>7.2</strong>: Navigate between moments on click</p>
            <p>✓ <strong>7.4</strong>: Visual indicator of active moment</p>
            <p>✓ <strong>9.5</strong>: Display moment progress (X/4 cards)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
