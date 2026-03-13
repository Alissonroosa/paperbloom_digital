import { useReducer, useCallback } from 'react';
import {
  WizardState,
  WizardAction,
  WizardFormData,
  initialWizardState,
  validateStepBeforeNavigation,
  WizardUIState,
  WizardUploadStates,
} from '@/types/wizard';

/**
 * Wizard State Reducer
 * Manages all state transitions for the wizard
 */
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'UPDATE_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.field]: action.payload.value,
        },
      };

    case 'UPDATE_UPLOAD_STATE':
      if (action.payload.type === 'main') {
        return {
          ...state,
          uploads: {
            ...state.uploads,
            mainImage: {
              ...state.uploads.mainImage,
              ...action.payload.state,
            },
          },
        };
      } else {
        const index = action.payload.index ?? 0;
        const newGalleryImages = [...state.uploads.galleryImages];
        newGalleryImages[index] = {
          ...newGalleryImages[index],
          ...action.payload.state,
        };
        return {
          ...state,
          uploads: {
            ...state.uploads,
            galleryImages: newGalleryImages,
          },
        };
      }

    case 'UPDATE_UI_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload,
        },
      };

    case 'SET_STEP_VALIDATION':
      return {
        ...state,
        stepValidation: {
          ...state.stepValidation,
          [action.payload.step]: {
            isValid: action.payload.isValid,
            errors: action.payload.errors,
          },
        },
      };

    case 'MARK_STEP_COMPLETED':
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(action.payload);
      return {
        ...state,
        completedSteps: newCompletedSteps,
      };

    case 'RESTORE_STATE':
      return action.payload;

    case 'RESET_STATE':
      return initialWizardState;

    default:
      return state;
  }
}

/**
 * Custom hook for managing wizard state
 * Provides state and actions for the multi-step wizard
 */
export function useWizardState() {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);

  /**
   * Navigate to a specific step
   */
  const setStep = useCallback((step: number) => {
    if (step >= 1 && step <= 7) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  }, []);

  /**
   * Update a form field
   */
  const updateField = useCallback((field: keyof WizardFormData, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  }, []);

  /**
   * Update upload state for main image
   */
  const updateMainImageUpload = useCallback(
    (state: Partial<WizardUploadStates['mainImage']>) => {
      dispatch({
        type: 'UPDATE_UPLOAD_STATE',
        payload: { type: 'main', state },
      });
    },
    []
  );

  /**
   * Update upload state for gallery image
   */
  const updateGalleryImageUpload = useCallback(
    (index: number, state: Partial<WizardUploadStates['mainImage']>) => {
      dispatch({
        type: 'UPDATE_UPLOAD_STATE',
        payload: { type: 'gallery', index, state },
      });
    },
    []
  );

  /**
   * Update UI state
   */
  const updateUIState = useCallback((uiState: Partial<WizardUIState>) => {
    dispatch({ type: 'UPDATE_UI_STATE', payload: uiState });
  }, []);

  /**
   * Validate current step
   */
  const validateCurrentStep = useCallback(() => {
    const validation = validateStepBeforeNavigation(state.currentStep, state.data);
    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        step: state.currentStep,
        isValid: validation.isValid,
        errors: validation.errors,
      },
    });
    return validation.isValid;
  }, [state.currentStep, state.data]);

  /**
   * Navigate to next step with validation
   */
  const nextStep = useCallback(() => {
    const isValid = validateCurrentStep();
    if (isValid && state.currentStep < 7) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.currentStep });
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
      return true;
    }
    return false;
  }, [state.currentStep, validateCurrentStep]);

  /**
   * Navigate to previous step
   */
  const previousStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
      return true;
    }
    return false;
  }, [state.currentStep]);

  /**
   * Mark a step as completed
   */
  const markStepCompleted = useCallback((step: number) => {
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: step });
  }, []);

  /**
   * Restore wizard state (for auto-save)
   */
  const restoreState = useCallback((savedState: WizardState) => {
    dispatch({ type: 'RESTORE_STATE', payload: savedState });
  }, []);

  /**
   * Reset wizard to initial state
   */
  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  /**
   * Check if a step can be navigated to
   */
  const canNavigateToStep = useCallback(
    (targetStep: number) => {
      // Can always go back to previous steps
      if (targetStep < state.currentStep) {
        return true;
      }
      // Can go to next step if current step is completed
      if (targetStep === state.currentStep + 1) {
        return state.completedSteps.has(state.currentStep);
      }
      // Can go to any completed step
      return state.completedSteps.has(targetStep - 1);
    },
    [state.currentStep, state.completedSteps]
  );

  return {
    // State
    state,
    currentStep: state.currentStep,
    data: state.data,
    uploads: state.uploads,
    ui: state.ui,
    stepValidation: state.stepValidation,
    completedSteps: state.completedSteps,

    // Actions
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
