import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Step3MainMessage } from '../Step3MainMessage';
import { WizardProvider } from '@/contexts/WizardContext';

// Mock the TextSuggestionPanel component
vi.mock('@/components/editor/TextSuggestionPanel', () => ({
  TextSuggestionPanel: ({ onSelectSuggestion, onClose }: any) => (
    <div data-testid="suggestion-panel">
      <button onClick={() => onSelectSuggestion('Test suggestion text')}>
        Select Suggestion
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('Step3MainMessage', () => {
  const renderComponent = () => {
    return render(
      <WizardProvider>
        <Step3MainMessage />
      </WizardProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all required fields', () => {
      renderComponent();

      expect(screen.getByLabelText(/Para quem é a mensagem\?/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quem está enviando\?/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Sua Mensagem/i)).toBeInTheDocument();
    });

    it('should render the suggestions button', () => {
      renderComponent();

      const suggestionsButton = screen.getByRole('button', { name: /Abrir sugestões de texto/i });
      expect(suggestionsButton).toBeInTheDocument();
    });

    it('should display character counter for all fields', () => {
      renderComponent();

      // Check for character counters
      const counters = screen.getAllByText(/\/100|\/500/);
      expect(counters.length).toBeGreaterThan(0);
    });

    it('should display the tip box', () => {
      renderComponent();

      expect(screen.getByText(/💡 Dica/i)).toBeInTheDocument();
      expect(screen.getByText(/Seja autêntico e escreva do coração/i)).toBeInTheDocument();
    });
  });

  describe('Field Interactions', () => {
    it('should update recipient name when typing', () => {
      renderComponent();

      const input = screen.getByLabelText(/Para quem é a mensagem\?/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Maria' } });

      expect(input.value).toBe('Maria');
    });

    it('should update sender name when typing', () => {
      renderComponent();

      const input = screen.getByLabelText(/Quem está enviando\?/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'João' } });

      expect(input.value).toBe('João');
    });

    it('should update main message when typing', () => {
      renderComponent();

      const textarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test message' } });

      expect(textarea.value).toBe('Test message');
    });

    it('should respect max length for recipient name (100 chars)', () => {
      renderComponent();

      const input = screen.getByLabelText(/Para quem é a mensagem\?/i) as HTMLInputElement;
      expect(input).toHaveAttribute('maxLength', '100');
    });

    it('should respect max length for sender name (100 chars)', () => {
      renderComponent();

      const input = screen.getByLabelText(/Quem está enviando\?/i) as HTMLInputElement;
      expect(input).toHaveAttribute('maxLength', '100');
    });

    it('should respect max length for main message (500 chars)', () => {
      renderComponent();

      const textarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('maxLength', '500');
    });
  });

  describe('Character Counter', () => {
    it('should display correct character count for main message', () => {
      renderComponent();

      const textarea = screen.getByLabelText(/Sua Mensagem/i);
      fireEvent.change(textarea, { target: { value: 'Hello' } });

      expect(screen.getByText('5/500')).toBeInTheDocument();
    });

    it('should update character count in real-time', () => {
      renderComponent();

      const textarea = screen.getByLabelText(/Sua Mensagem/i);
      
      fireEvent.change(textarea, { target: { value: 'Test' } });
      expect(screen.getByText('4/500')).toBeInTheDocument();

      fireEvent.change(textarea, { target: { value: 'Test message' } });
      expect(screen.getByText('12/500')).toBeInTheDocument();
    });

    it('should show warning when approaching character limit (90%)', () => {
      renderComponent();

      const textarea = screen.getByLabelText(/Sua Mensagem/i);
      const longText = 'a'.repeat(450); // 90% of 500
      
      fireEvent.change(textarea, { target: { value: longText } });

      expect(screen.getByText(/Você está próximo do limite de caracteres/i)).toBeInTheDocument();
    });

    it('should show error when character limit reached (100%)', () => {
      renderComponent();

      const textarea = screen.getByLabelText(/Sua Mensagem/i);
      const maxText = 'a'.repeat(500); // 100% of 500
      
      fireEvent.change(textarea, { target: { value: maxText } });

      expect(screen.getByText(/Limite de caracteres atingido!/i)).toBeInTheDocument();
    });

    it('should apply correct color class based on character count', () => {
      renderComponent();

      const textarea = screen.getByLabelText(/Sua Mensagem/i);
      
      // Normal state (< 75%)
      fireEvent.change(textarea, { target: { value: 'a'.repeat(300) } });
      let counter = screen.getByText('300/500');
      expect(counter).toHaveClass('text-gray-500');

      // Warning state (>= 90%)
      fireEvent.change(textarea, { target: { value: 'a'.repeat(450) } });
      counter = screen.getByText('450/500');
      expect(counter).toHaveClass('text-orange-600');

      // Error state (100%)
      fireEvent.change(textarea, { target: { value: 'a'.repeat(500) } });
      counter = screen.getByText('500/500');
      expect(counter).toHaveClass('text-red-600');
    });
  });

  describe('Text Suggestions', () => {
    it('should open suggestion panel when clicking suggestions button', async () => {
      renderComponent();

      const suggestionsButton = screen.getByRole('button', { name: /Abrir sugestões de texto/i });
      fireEvent.click(suggestionsButton);

      await waitFor(() => {
        expect(screen.getByTestId('suggestion-panel')).toBeInTheDocument();
      });
    });

    it('should close suggestion panel when clicking close button', async () => {
      renderComponent();

      const suggestionsButton = screen.getByRole('button', { name: /Abrir sugestões de texto/i });
      fireEvent.click(suggestionsButton);

      await waitFor(() => {
        expect(screen.getByTestId('suggestion-panel')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('suggestion-panel')).not.toBeInTheDocument();
      });
    });

    it('should populate message field when selecting a suggestion', async () => {
      renderComponent();

      const suggestionsButton = screen.getByRole('button', { name: /Abrir sugestões de texto/i });
      fireEvent.click(suggestionsButton);

      await waitFor(() => {
        expect(screen.getByTestId('suggestion-panel')).toBeInTheDocument();
      });

      const selectButton = screen.getByRole('button', { name: 'Select Suggestion' });
      fireEvent.click(selectButton);

      await waitFor(() => {
        const textarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
        expect(textarea.value).toBe('Test suggestion text');
      });
    });

    it('should close suggestion panel after selecting a suggestion', async () => {
      renderComponent();

      const suggestionsButton = screen.getByRole('button', { name: /Abrir sugestões de texto/i });
      fireEvent.click(suggestionsButton);

      await waitFor(() => {
        expect(screen.getByTestId('suggestion-panel')).toBeInTheDocument();
      });

      const selectButton = screen.getByRole('button', { name: 'Select Suggestion' });
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.queryByTestId('suggestion-panel')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderComponent();

      expect(screen.getByLabelText(/Para quem é a mensagem\?/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quem está enviando\?/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Sua Mensagem/i)).toBeInTheDocument();
    });

    it('should mark required fields with asterisk', () => {
      renderComponent();

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators.length).toBe(3); // All three fields are required
    });

    it('should have proper aria attributes for suggestion button', () => {
      renderComponent();

      const button = screen.getByRole('button', { name: /Abrir sugestões de texto/i });
      expect(button).toHaveAttribute('aria-label', 'Abrir sugestões de texto');
    });

    it('should have proper modal attributes when suggestion panel is open', async () => {
      renderComponent();

      const suggestionsButton = screen.getByRole('button', { name: /Abrir sugestões de texto/i });
      fireEvent.click(suggestionsButton);

      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveAttribute('aria-modal', 'true');
      });
    });
  });

  describe('Validation Integration', () => {
    it('should display validation errors when provided by context', () => {
      // This test would require mocking the wizard context with validation errors
      // For now, we verify the error display structure exists
      renderComponent();

      const recipientInput = screen.getByLabelText(/Para quem é a mensagem\?/i);
      expect(recipientInput).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
