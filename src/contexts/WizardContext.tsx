'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWizardState } from '@/hooks/useWizardState';
import {
  WizardState,
  WizardFormData,
  WizardUploadStates,
  WizardUIState,
} from '@/types/wizard';

/**
 * Wizard Context Type
 * Defines the shape of the wizard context
 */
interface WizardContextType {
  // State
  state: WizardState;
  currentStep: number;
  data: WizardFormData;
  uploads: WizardUploadStates;
  ui: WizardUIState;
  stepValidation: WizardState['stepValidation'];
  completedSteps: Set<number>;

  // Actions
  setStep: (step: number) => void;
  updateField: (field: keyof WizardFormData, value: any) => void;
  updateMainImageUpload: (state: Partial<WizardUploadStates['mainImage']>) => void;
  updateGalleryImageUpload: (index: number, state: Partial<WizardUploadStates['mainImage']>) => void;
  updateUIState: (uiState: Partial<WizardUIState>) => void;
  validateCurrentStep: () => boolean;
  nextStep: () => boolean;
  previousStep: () => boolean;
  markStepCompleted: (step: number) => void;
  restoreState: (savedState: WizardState) => void;
  resetState: () => void;
  canNavigateToStep: (targetStep: number) => boolean;
}

/**
 * Create the Wizard Context
 */
const WizardContext = createContext<WizardContextType | undefined>(undefined);

/**
 * Wizard Provider Props
 */
interface WizardProviderProps {
  children: ReactNode;
}

/**
 * Wizard Provider Component
 * Provides wizard state and actions to all child components
 */
export function WizardProvider({ children }: WizardProviderProps) {
  const wizardState = useWizardState();

  return (
    <WizardContext.Provider value={wizardState}>
      {children}
    </WizardContext.Provider>
  );
}

/**
 * Custom hook to use the Wizard Context
 * Throws an error if used outside of WizardProvider
 */
export function useWizard(): WizardContextType {
  const context = useContext(WizardContext);
  
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  
  return context;
}

/**
 * Hook to get only the wizard state (read-only)
 */
export function useWizardData() {
  const { data, uploads, ui } = useWizard();
  return { data, uploads, ui };
}

/**
 * Hook to get only wizard actions
 */
export function useWizardActions() {
  const {
    setStep,
    updateField,
    updateMainImageUpload,
    updateGalleryImageUpload,
    updateUIState,
    validateCurrentStep,
    nextStep,
    previousStep,
    markStepCompleted,
    restoreState,
    resetState,
    canNavigateToStep,
  } = useWizard();

  return {
    setStep,
    updateField,
    updateMainImageUpload,
    updateGalleryImageUpload,
    updateUIState,
    validateCurrentStep,
    nextStep,
    previousStep,
    markStepCompleted,
    restoreState,
    resetState,
    canNavigateToStep,
  };
}

/**
 * Hook to get current step information
 */
export function useWizardStep() {
  const { currentStep, stepValidation, completedSteps, canNavigateToStep } = useWizard();
  
  return {
    currentStep,
    validation: stepValidation[currentStep],
    isCompleted: completedSteps.has(currentStep),
    canNavigateToStep,
  };
}
