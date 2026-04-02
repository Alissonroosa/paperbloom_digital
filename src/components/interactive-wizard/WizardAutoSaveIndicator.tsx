'use client';

import React from 'react';
import { AutoSaveIndicator } from '@/components/editor/AutoSaveIndicator';
import { useInteractiveWizardAutoSave } from '@/contexts/InteractiveWizardContext';

/**
 * WizardAutoSaveIndicator Component
 * 
 * A wrapper around AutoSaveIndicator that automatically connects to the
 * InteractiveWizardContext for auto-save state.
 * 
 * Features:
 * - Visual indicator during saving (spinner)
 * - Last saved timestamp display
 * - Clear draft button
 * 
 * @see Requirements 8.4, 8.5, 8.6
 */
export interface WizardAutoSaveIndicatorProps {
  /** Whether to show the clear draft button */
  showClearDraft?: boolean;
  /** Custom class name for styling */
  className?: string;
}

export function WizardAutoSaveIndicator({
  showClearDraft = true,
  className,
}: WizardAutoSaveIndicatorProps): JSX.Element {
  const { isSaving, lastSaved, clearDraft } = useInteractiveWizardAutoSave();

  return (
    <div className={className}>
      <AutoSaveIndicator
        isSaving={isSaving}
        lastSaved={lastSaved}
        onClearDraft={showClearDraft ? clearDraft : undefined}
      />
    </div>
  );
}
