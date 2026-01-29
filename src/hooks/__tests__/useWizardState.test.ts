import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizardState } from '../useWizardState';

describe('useWizardState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWizardState());
    
    expect(result.current.currentStep).toBe(1);
    expect(result.current.data.pageTitle).toBe('');
    expect(result.current.data.urlSlug).toBe('');
    expect(result.current.completedSteps.size).toBe(0);
  });

  it('should update form fields', () => {
    const { result } = renderHook(() => useWizardState());
    
    act(() => {
      result.current.updateField('pageTitle', 'Test Title');
    });
    
    expect(result.current.data.pageTitle).toBe('Test Title');
  });

  it('should navigate to next step when validation passes', () => {
    const { result } = renderHook(() => useWizardState());
    
    // Fill in required fields for step 1
    act(() => {
      result.current.updateField('pageTitle', 'Test Title');
      result.current.updateField('urlSlug', 'test-title');
    });
    
    // Try to move to next step
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(2);
    expect(result.current.completedSteps.has(1)).toBe(true);
  });

  it('should not navigate to next step when validation fails', () => {
    const { result } = renderHook(() => useWizardState());
    
    // Don't fill in required fields
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(1);
    expect(result.current.completedSteps.has(1)).toBe(false);
  });

  it('should navigate to previous step', () => {
    const { result } = renderHook(() => useWizardState());
    
    // Fill step 1 and move to step 2
    act(() => {
      result.current.updateField('pageTitle', 'Test Title');
      result.current.updateField('urlSlug', 'test-title');
    });
    
    act(() => {
      const moved = result.current.nextStep();
      expect(moved).toBe(true);
    });
    
    expect(result.current.currentStep).toBe(2);
    
    // Go back to step 1
    act(() => {
      const moved = result.current.previousStep();
      expect(moved).toBe(true);
    });
    
    expect(result.current.currentStep).toBe(1);
  });

  it('should preserve data when navigating between steps', () => {
    const { result } = renderHook(() => useWizardState());
    
    // Fill step 1
    act(() => {
      result.current.updateField('pageTitle', 'Test Title');
      result.current.updateField('urlSlug', 'test-title');
      result.current.nextStep();
    });
    
    // Fill step 2
    act(() => {
      result.current.updateField('specialDate', new Date('2024-12-25'));
      result.current.nextStep();
    });
    
    // Go back to step 1
    act(() => {
      result.current.setStep(1);
    });
    
    // Data should be preserved
    expect(result.current.data.pageTitle).toBe('Test Title');
    expect(result.current.data.urlSlug).toBe('test-title');
    
    // Go to step 2
    act(() => {
      result.current.setStep(2);
    });
    
    // Step 2 data should be preserved
    expect(result.current.data.specialDate).toEqual(new Date('2024-12-25'));
  });

  it('should update UI state', () => {
    const { result } = renderHook(() => useWizardState());
    
    act(() => {
      result.current.updateUIState({ previewMode: 'cinema' });
    });
    
    expect(result.current.ui.previewMode).toBe('cinema');
  });

  it('should update upload states', () => {
    const { result } = renderHook(() => useWizardState());
    
    act(() => {
      result.current.updateMainImageUpload({
        url: 'https://example.com/image.jpg',
        isUploading: false,
        error: null,
      });
    });
    
    expect(result.current.uploads.mainImage.url).toBe('https://example.com/image.jpg');
    expect(result.current.uploads.mainImage.isUploading).toBe(false);
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useWizardState());
    
    // Make some changes
    act(() => {
      result.current.updateField('pageTitle', 'Test Title');
      result.current.updateField('urlSlug', 'test-title');
    });
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(2);
    expect(result.current.data.pageTitle).toBe('Test Title');
    
    // Reset
    act(() => {
      result.current.resetState();
    });
    
    expect(result.current.currentStep).toBe(1);
    expect(result.current.data.pageTitle).toBe('');
    expect(result.current.completedSteps.size).toBe(0);
  });

  it('should validate step before navigation', () => {
    const { result } = renderHook(() => useWizardState());
    
    // Step 1 should be invalid initially
    let isValid: boolean = false;
    act(() => {
      isValid = result.current.validateCurrentStep();
    });
    
    expect(isValid).toBe(false);
    expect(result.current.stepValidation[1].isValid).toBe(false);
    expect(Object.keys(result.current.stepValidation[1].errors).length).toBeGreaterThan(0);
    
    // Fill required fields
    act(() => {
      result.current.updateField('pageTitle', 'Test Title');
      result.current.updateField('urlSlug', 'test-title');
    });
    
    act(() => {
      isValid = result.current.validateCurrentStep();
    });
    
    expect(isValid).toBe(true);
    expect(result.current.stepValidation[1].isValid).toBe(true);
    expect(Object.keys(result.current.stepValidation[1].errors).length).toBe(0);
  });
});
