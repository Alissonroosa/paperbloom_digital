import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWizardAutoSave } from '../useWizardAutoSave';
import { WizardState, initialWizardState } from '@/types/wizard';

describe('useWizardAutoSave', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should save wizard state to localStorage after debounce delay', async () => {
    const testState: WizardState = {
      ...initialWizardState,
      currentStep: 3,
      data: {
        ...initialWizardState.data,
        pageTitle: 'Test Title',
        recipientName: 'John',
      },
    };

    const { result } = renderHook(() =>
      useWizardAutoSave({
        key: 'test-wizard',
        state: testState,
        debounceMs: 2000,
        enabled: true,
      })
    );

    // Initially not saving
    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBeNull();

    // Fast-forward time to trigger save
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
    });

    // Should have saved
    expect(result.current.lastSaved).not.toBeNull();

    // Check localStorage
    const saved = localStorage.getItem('test-wizard');
    expect(saved).not.toBeNull();
    
    const parsed = JSON.parse(saved!);
    expect(parsed.state.currentStep).toBe(3);
    expect(parsed.state.data.pageTitle).toBe('Test Title');
    expect(parsed.state.data.recipientName).toBe('John');
  });

  it('should restore wizard state from localStorage', () => {
    const testState: WizardState = {
      ...initialWizardState,
      currentStep: 5,
      data: {
        ...initialWizardState.data,
        pageTitle: 'Restored Title',
        urlSlug: 'restored-slug',
      },
      completedSteps: new Set([1, 2, 3, 4]),
    };

    // Manually save to localStorage
    const serializedState = {
      ...testState,
      completedSteps: Array.from(testState.completedSteps),
    };
    
    localStorage.setItem(
      'test-restore',
      JSON.stringify({
        state: serializedState,
        savedAt: new Date().toISOString(),
      })
    );

    const { result } = renderHook(() =>
      useWizardAutoSave({
        key: 'test-restore',
        state: initialWizardState,
        enabled: false, // Don't auto-save during test
      })
    );

    // Restore the state
    const restored = result.current.restore();

    expect(restored).not.toBeNull();
    expect(restored!.currentStep).toBe(5);
    expect(restored!.data.pageTitle).toBe('Restored Title');
    expect(restored!.data.urlSlug).toBe('restored-slug');
    expect(restored!.completedSteps).toBeInstanceOf(Set);
    expect(restored!.completedSteps.has(1)).toBe(true);
    expect(restored!.completedSteps.has(4)).toBe(true);
  });

  it('should clear wizard state from localStorage', async () => {
    const testState: WizardState = {
      ...initialWizardState,
      currentStep: 2,
    };

    const { result } = renderHook(() =>
      useWizardAutoSave({
        key: 'test-clear',
        state: testState,
        debounceMs: 1000,
        enabled: true,
      })
    );

    // Trigger save
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    // Verify saved
    expect(result.current.lastSaved).not.toBeNull();
    expect(localStorage.getItem('test-clear')).not.toBeNull();

    // Clear
    act(() => {
      result.current.clear();
    });

    // Verify cleared
    expect(localStorage.getItem('test-clear')).toBeNull();
    expect(result.current.lastSaved).toBeNull();
  });

  it('should handle Date serialization and deserialization', async () => {
    const testDate = new Date('2024-12-25T00:00:00.000Z');
    const testState: WizardState = {
      ...initialWizardState,
      data: {
        ...initialWizardState.data,
        specialDate: testDate,
      },
    };

    const { result } = renderHook(() =>
      useWizardAutoSave({
        key: 'test-date',
        state: testState,
        debounceMs: 1000,
        enabled: true,
      })
    );

    // Trigger save
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    expect(result.current.lastSaved).not.toBeNull();

    // Restore and check date
    const restored = result.current.restore();
    expect(restored).not.toBeNull();
    expect(restored!.data.specialDate).toBeInstanceOf(Date);
    expect(restored!.data.specialDate?.toISOString()).toBe(testDate.toISOString());
  });

  it('should handle null dates correctly', async () => {
    const testState: WizardState = {
      ...initialWizardState,
      data: {
        ...initialWizardState.data,
        specialDate: null,
      },
    };

    const { result } = renderHook(() =>
      useWizardAutoSave({
        key: 'test-null-date',
        state: testState,
        debounceMs: 1000,
        enabled: true,
      })
    );

    // Trigger save
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    expect(result.current.lastSaved).not.toBeNull();

    // Restore and check null date
    const restored = result.current.restore();
    expect(restored).not.toBeNull();
    expect(restored!.data.specialDate).toBeNull();
  });

  it('should not save when enabled is false', async () => {
    const testState: WizardState = {
      ...initialWizardState,
      currentStep: 3,
    };

    const { result } = renderHook(() =>
      useWizardAutoSave({
        key: 'test-disabled',
        state: testState,
        debounceMs: 1000,
        enabled: false,
      })
    );

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should not have saved
    expect(result.current.lastSaved).toBeNull();
    expect(localStorage.getItem('test-disabled')).toBeNull();
  });

  it('should debounce multiple rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ state }) =>
        useWizardAutoSave({
          key: 'test-debounce',
          state,
          debounceMs: 2000,
          enabled: true,
        }),
      {
        initialProps: {
          state: { ...initialWizardState, currentStep: 1 },
        },
      }
    );

    // Make multiple rapid changes
    rerender({ state: { ...initialWizardState, currentStep: 2 } });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender({ state: { ...initialWizardState, currentStep: 3 } });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender({ state: { ...initialWizardState, currentStep: 4 } });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should not have saved yet (only 1500ms passed)
    expect(result.current.lastSaved).toBeNull();

    // Complete the debounce
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
    });

    // Now should have saved
    expect(result.current.lastSaved).not.toBeNull();

    // Should have saved the latest state (step 4)
    const restored = result.current.restore();
    expect(restored!.currentStep).toBe(4);
  });

  it('should return null when restoring non-existent data', () => {
    const { result } = renderHook(() =>
      useWizardAutoSave({
        key: 'non-existent',
        state: initialWizardState,
        enabled: false,
      })
    );

    const restored = result.current.restore();
    expect(restored).toBeNull();
  });

  it('should handle corrupted localStorage data gracefully', () => {
    // Save corrupted data
    localStorage.setItem('test-corrupted', 'invalid json {{{');

    const { result } = renderHook(() =>
      useWizardAutoSave({
        key: 'test-corrupted',
        state: initialWizardState,
        enabled: false,
      })
    );

    const restored = result.current.restore();
    expect(restored).toBeNull();
  });

  it('should preserve completedSteps Set correctly', async () => {
    const testState: WizardState = {
      ...initialWizardState,
      currentStep: 4,
      completedSteps: new Set([1, 2, 3]),
    };

    const { result } = renderHook(() =>
      useWizardAutoSave({
        key: 'test-completed-steps',
        state: testState,
        debounceMs: 1000,
        enabled: true,
      })
    );

    // Trigger save
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    expect(result.current.lastSaved).not.toBeNull();

    // Restore and verify Set
    const restored = result.current.restore();
    expect(restored).not.toBeNull();
    expect(restored!.completedSteps).toBeInstanceOf(Set);
    expect(restored!.completedSteps.size).toBe(3);
    expect(restored!.completedSteps.has(1)).toBe(true);
    expect(restored!.completedSteps.has(2)).toBe(true);
    expect(restored!.completedSteps.has(3)).toBe(true);
    expect(restored!.completedSteps.has(4)).toBe(false);
  });

  it('should update lastSaved timestamp after each save', async () => {
    const { result, rerender } = renderHook(
      ({ state }) =>
        useWizardAutoSave({
          key: 'test-timestamp',
          state,
          debounceMs: 1000,
          enabled: true,
        }),
      {
        initialProps: {
          state: { ...initialWizardState, currentStep: 1 },
        },
      }
    );

    // First save
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    expect(result.current.lastSaved).not.toBeNull();
    const firstSaveTime = result.current.lastSaved;

    // Wait a bit
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Make a change
    rerender({ state: { ...initialWizardState, currentStep: 2 } });

    // Second save
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
    });

    expect(result.current.lastSaved).not.toBe(firstSaveTime);
    expect(result.current.lastSaved!.getTime()).toBeGreaterThan(
      firstSaveTime!.getTime()
    );
  });
});
