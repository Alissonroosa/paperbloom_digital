import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Step2SpecialDate } from '../Step2SpecialDate';
import { WizardProvider, useWizard } from '@/contexts/WizardContext';
import { formatDateInPortuguese } from '@/lib/wizard-utils';

/**
 * Integration tests for Step2SpecialDate component
 * Tests integration with WizardContext and state management
 */
describe('Step2SpecialDate Integration', () => {
  // Helper component to access wizard state
  function WizardStateDisplay() {
    const { data } = useWizard();
    return (
      <div data-testid="wizard-state">
        {data.specialDate ? formatDateInPortuguese(data.specialDate) : 'No date'}
      </div>
    );
  }

  const renderWithWizard = () => {
    return render(
      <WizardProvider>
        <Step2SpecialDate />
        <WizardStateDisplay />
      </WizardProvider>
    );
  };

  beforeEach(() => {
    // Clear any localStorage
    localStorage.clear();
  });

  describe('Wizard State Integration', () => {
    it('should update wizard state when date is selected', async () => {
      renderWithWizard();
      
      // Click to show date picker
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      // Select a date
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      
      // Verify wizard state is updated
      await waitFor(() => {
        const stateDisplay = screen.getByTestId('wizard-state');
        expect(stateDisplay).toHaveTextContent('25 de Dezembro, 2024');
      });
    });

    it('should clear wizard state when date is cleared', async () => {
      renderWithWizard();
      
      // Select a date
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      
      // Wait for date to be set
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('25 de Dezembro, 2024');
      });
      
      // Clear the date
      const clearButton = screen.getByRole('button', { name: /Limpar data/i });
      fireEvent.click(clearButton);
      
      // Verify wizard state is cleared
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('No date');
      });
    });

    it('should set wizard state to null when skipping', async () => {
      renderWithWizard();
      
      // First select a date
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('25 de Dezembro, 2024');
      });
      
      // Skip the step
      const skipButton = screen.getByRole('button', { name: /Remover data e pular esta etapa/i });
      fireEvent.click(skipButton);
      
      // Verify state is null
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('No date');
      });
    });
  });

  describe('Date Persistence', () => {
    it('should maintain date across multiple changes', async () => {
      renderWithWizard();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      
      // Change date multiple times
      fireEvent.change(dateInput, { target: { value: '2024-01-01' } });
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('1 de Janeiro, 2024');
      });
      
      fireEvent.change(dateInput, { target: { value: '2024-06-15' } });
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('15 de Junho, 2024');
      });
      
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('31 de Dezembro, 2024');
      });
    });
  });

  describe('Date Validation', () => {
    it('should handle valid dates correctly', async () => {
      renderWithWizard();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      
      // Test various valid dates
      const validDates = [
        { input: '2024-01-01', expected: '1 de Janeiro, 2024' },
        { input: '2024-02-29', expected: '29 de Fevereiro, 2024' }, // Leap year
        { input: '2024-12-31', expected: '31 de Dezembro, 2024' },
      ];
      
      for (const { input, expected } of validDates) {
        fireEvent.change(dateInput, { target: { value: input } });
        await waitFor(() => {
          expect(screen.getByTestId('wizard-state')).toHaveTextContent(expected);
        });
      }
    });

    it('should handle empty date input', async () => {
      renderWithWizard();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      
      // Set a date first
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('25 de Dezembro, 2024');
      });
      
      // Clear by setting empty value
      fireEvent.change(dateInput, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('No date');
      });
    });
  });

  describe('UI State Transitions', () => {
    it('should transition from initial state to date picker', () => {
      renderWithWizard();
      
      // Initial state
      expect(screen.getByRole('button', { name: /Selecionar Data/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/Selecione a data especial/i)).not.toBeInTheDocument();
      
      // Click to show date picker
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      // Date picker state
      expect(screen.getByLabelText(/Selecione a data especial/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Selecionar Data$/i })).not.toBeInTheDocument();
    });

    it('should transition back to initial state after clearing', async () => {
      renderWithWizard();
      
      // Show date picker and select date
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('wizard-state')).toHaveTextContent('25 de Dezembro, 2024');
      });
      
      // Clear the date
      const clearButton = screen.getByRole('button', { name: /Limpar data/i });
      fireEvent.click(clearButton);
      
      // Should return to initial state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selecionar Data/i })).toBeInTheDocument();
        expect(screen.queryByLabelText(/Selecione a data especial/i)).not.toBeInTheDocument();
      });
    });
  });
});
