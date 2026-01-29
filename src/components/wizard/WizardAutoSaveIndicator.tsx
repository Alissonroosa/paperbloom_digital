'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface WizardAutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  onStartOver?: () => void;
}

/**
 * Visual indicator for wizard auto-save status
 * Shows saving state, last saved time, and "Start Over" button
 */
export function WizardAutoSaveIndicator({
  isSaving,
  lastSaved,
  onStartOver,
}: WizardAutoSaveIndicatorProps) {
  const getStatusText = () => {
    if (isSaving) {
      return 'Salvando...';
    }
    
    if (lastSaved) {
      const timeAgo = formatDistanceToNow(lastSaved, {
        addSuffix: true,
        locale: ptBR,
      });
      return `Salvo ${timeAgo}`;
    }
    
    return 'Não salvo';
  };

  const getStatusColor = () => {
    if (isSaving) {
      return 'text-blue-600';
    }
    
    if (lastSaved) {
      return 'text-green-600';
    }
    
    return 'text-gray-400';
  };

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2">
        {/* Status Icon */}
        <div className={`flex items-center gap-1.5 ${getStatusColor()}`}>
          {isSaving ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : lastSaved ? (
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span className="font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Start Over Button */}
      {onStartOver && lastSaved && (
        <button
          onClick={onStartOver}
          className="text-gray-600 hover:text-gray-900 underline transition-colors"
          type="button"
        >
          Começar do Zero
        </button>
      )}
    </div>
  );
}
