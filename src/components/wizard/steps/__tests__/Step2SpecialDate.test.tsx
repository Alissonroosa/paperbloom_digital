import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Step2SpecialDate } from '../Step2SpecialDate';
import { WizardProvider } from '@/contexts/WizardContext';

/**
 * Test suite for Step2SpecialDate component
 * Tests date selection, formatting, and skip functionality
 */
describe('Step2SpecialDate', () => {
  const renderWithProvider = () => {
    return render(
      <WizardProvider>
        <Step2SpecialDate />
      </WizardProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the component with title and description', () => {
      renderWithProvider();
      
      expect(screen.getByText('Data Especial')).toBeInTheDocument();
      expect(screen.getByText(/Adicione uma data especial à sua mensagem/)).toBeInTheDocument();
    });

    it('should show "Selecionar Data" button initially', () => {
      renderWithProvider();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      expect(selectButton).toBeInTheDocument();
    });

    it('should show skip link initially', () => {
      renderWithProvider();
      
      const skipButton = screen.getByRole('button', { name: /Pular esta etapa/i });
      expect(skipButton).toBeInTheDocument();
    });

    it('should display tip information box', () => {
      renderWithProvider();
      
      expect(screen.getByText('💡 Dica')).toBeInTheDocument();
      expect(screen.getByText(/A data especial aparecerá na sua mensagem/)).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('should show date picker when "Selecionar Data" is clicked', () => {
      renderWithProvider();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i);
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    it('should display formatted date after selection', async () => {
      renderWithProvider();
      
      // Click to show date picker
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      // Select a date
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      
      // Check formatted date appears
      await waitFor(() => {
        expect(screen.getByText(/25 de Dezembro, 2024/i)).toBeInTheDocument();
      });
    });

    it('should show clear button when date is selected', async () => {
      renderWithProvider();
      
      // Show date picker and select date
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      
      // Check clear button appears
      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /Limpar data/i });
        expect(clearButton).toBeInTheDocument();
      });
    });

    it('should clear date when clear button is clicked', async () => {
      renderWithProvider();
      
      // Show date picker and select date
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      
      // Wait for formatted date
      await waitFor(() => {
        expect(screen.getByText(/25 de Dezembro, 2024/i)).toBeInTheDocument();
      });
      
      // Click clear button
      const clearButton = screen.getByRole('button', { name: /Limpar data/i });
      fireEvent.click(clearButton);
      
      // Check date is cleared
      await waitFor(() => {
        expect(screen.queryByText(/25 de Dezembro, 2024/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Selecionar Data/i })).toBeInTheDocument();
      });
    });
  });

  describe('Skip Functionality', () => {
    it('should allow skipping date selection', () => {
      renderWithProvider();
      
      const skipButton = screen.getByRole('button', { name: /Pular esta etapa/i });
      fireEvent.click(skipButton);
      
      // Should still show the select button (component doesn't navigate away)
      expect(screen.getByRole('button', { name: /Selecionar Data/i })).toBeInTheDocument();
    });

    it('should show skip option after date picker is opened', () => {
      renderWithProvider();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      expect(screen.getByRole('button', { name: /Remover data e pular esta etapa/i })).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format January date correctly', async () => {
      renderWithProvider();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
      
      await waitFor(() => {
        expect(screen.getByText(/15 de Janeiro, 2024/i)).toBeInTheDocument();
      });
    });

    it('should format June date correctly', async () => {
      renderWithProvider();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-06-20' } });
      
      await waitFor(() => {
        expect(screen.getByText(/20 de Junho, 2024/i)).toBeInTheDocument();
      });
    });

    it('should format December date correctly', async () => {
      renderWithProvider();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      
      await waitFor(() => {
        expect(screen.getByText(/31 de Dezembro, 2024/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for date input', () => {
      renderWithProvider();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i);
      expect(dateInput).toHaveAttribute('aria-label', 'Selecione a data especial');
    });

    it('should have accessible clear button', async () => {
      renderWithProvider();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      fireEvent.click(selectButton);
      
      const dateInput = screen.getByLabelText(/Selecione a data especial/i) as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      
      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /Limpar data/i });
        expect(clearButton).toHaveAttribute('aria-label', 'Limpar data');
      });
    });

    it('should have keyboard accessible buttons', () => {
      renderWithProvider();
      
      const selectButton = screen.getByRole('button', { name: /Selecionar Data/i });
      expect(selectButton).toHaveAttribute('type', 'button');
      
      const skipButton = screen.getByRole('button', { name: /Pular esta etapa/i });
      expect(skipButton).toHaveAttribute('type', 'button');
    });
  });
});
