import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WizardStepper } from '../WizardStepper';
import { STEP_LABELS } from '@/types/wizard';

describe('WizardStepper', () => {
  const defaultProps = {
    currentStep: 1,
    totalSteps: 7,
    completedSteps: new Set<number>(),
    onStepClick: vi.fn(),
  };

  it('renders all step labels', () => {
    render(<WizardStepper {...defaultProps} />);
    
    STEP_LABELS.forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  it('highlights the current step', () => {
    render(<WizardStepper {...defaultProps} currentStep={3} />);
    
    const currentStepButtons = screen.getAllByLabelText(/Mensagem - Atual/);
    expect(currentStepButtons.length).toBeGreaterThan(0);
  });

  it('shows completed steps with check icon', () => {
    const completedSteps = new Set([1, 2]);
    render(<WizardStepper {...defaultProps} completedSteps={completedSteps} currentStep={3} />);
    
    // Check icons should be present for completed steps
    const checkIcons = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('Concluído')
    );
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('calls onStepClick when clicking a completed step', () => {
    const onStepClick = vi.fn();
    const completedSteps = new Set([1, 2]);
    
    render(
      <WizardStepper
        {...defaultProps}
        currentStep={3}
        completedSteps={completedSteps}
        onStepClick={onStepClick}
      />
    );
    
    // Find and click the first step button (should be clickable as it's completed)
    const step1Buttons = screen.getAllByLabelText(/Título e URL - Concluído/);
    fireEvent.click(step1Buttons[0]);
    
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('does not call onStepClick when clicking a pending step', () => {
    const onStepClick = vi.fn();
    
    render(
      <WizardStepper
        {...defaultProps}
        currentStep={2}
        completedSteps={new Set([1])}
        onStepClick={onStepClick}
      />
    );
    
    // Try to click step 5 (should be disabled)
    const step5Buttons = screen.getAllByLabelText(/Tema - Pendente/);
    fireEvent.click(step5Buttons[0]);
    
    // Should not be called because step 5 is not accessible
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it('displays progress bar with correct width', () => {
    const completedSteps = new Set([1, 2, 3]);
    render(
      <WizardStepper
        {...defaultProps}
        currentStep={4}
        completedSteps={completedSteps}
      />
    );
    
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
    
    // Check that progress bar has correct aria attributes
    const progressBar = progressBars[0];
    expect(progressBar.getAttribute('aria-valuenow')).toBe('3');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('7');
  });

  it('allows navigation to current step', () => {
    const onStepClick = vi.fn();
    
    render(
      <WizardStepper
        {...defaultProps}
        currentStep={3}
        completedSteps={new Set([1, 2])}
        onStepClick={onStepClick}
      />
    );
    
    // Click current step
    const currentStepButtons = screen.getAllByLabelText(/Mensagem - Atual/);
    fireEvent.click(currentStepButtons[0]);
    
    expect(onStepClick).toHaveBeenCalledWith(3);
  });

  it('uses custom step labels when provided', () => {
    const customLabels = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
    render(
      <WizardStepper
        {...defaultProps}
        stepLabels={customLabels}
      />
    );
    
    customLabels.forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  it('renders mobile and desktop versions', () => {
    const { container } = render(<WizardStepper {...defaultProps} />);
    
    // Desktop version should have hidden class on mobile
    const desktopStepper = container.querySelector('.hidden.md\\:block');
    expect(desktopStepper).toBeTruthy();
    
    // Mobile version should have md:hidden class
    const mobileStepper = container.querySelector('.md\\:hidden');
    expect(mobileStepper).toBeTruthy();
  });

  it('displays step numbers for pending steps', () => {
    render(
      <WizardStepper
        {...defaultProps}
        currentStep={1}
        completedSteps={new Set()}
      />
    );
    
    // Step 2 should show number "2"
    const step2Buttons = screen.getAllByRole('button').filter(button =>
      button.textContent === '2'
    );
    expect(step2Buttons.length).toBeGreaterThan(0);
  });

  it('shows correct accessibility labels', () => {
    const completedSteps = new Set([1]);
    render(
      <WizardStepper
        {...defaultProps}
        currentStep={2}
        completedSteps={completedSteps}
      />
    );
    
    // Check for completed step label
    expect(screen.getAllByLabelText(/Concluído/).length).toBeGreaterThan(0);
    
    // Check for current step label
    expect(screen.getAllByLabelText(/Atual/).length).toBeGreaterThan(0);
    
    // Check for pending step label
    expect(screen.getAllByLabelText(/Pendente/).length).toBeGreaterThan(0);
  });
});
