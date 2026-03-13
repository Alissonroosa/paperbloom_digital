import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step3MainMessage } from '../Step3MainMessage';
import { WizardProvider } from '@/contexts/WizardContext';

// Mock the TextSuggestionPanel component
vi.mock('@/components/editor/TextSuggestionPanel', () => ({
  TextSuggestionPanel: ({ onSelectSuggestion, onClose }: any) => (
    <div data-testid="suggestion-panel">
      <button onClick={() => onSelectSuggestion('Romantic suggestion text')}>
        Select Romantic
      </button>
      <button onClick={() => onSelectSuggestion('Friendly suggestion text')}>
        Select Friendly
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('Step3MainMessage Integration Tests', () => {
  const renderComponent = () => {
    return render(
      <WizardProvider>
        <Step3MainMessage />
      </WizardProvider>
    );
  };

  describe('Complete User Flow', () => {
    it('should allow user to complete all fields in step 3', async () => {
      renderComponent();

      // Fill recipient name
      const recipientInput = screen.getByLabelText(/Para quem é a mensagem\?/i) as HTMLInputElement;
      fireEvent.change(recipientInput, { target: { value: 'Maria Silva' } });
      expect(recipientInput.value).toBe('Maria Silva');

      // Fill sender name
      const senderInput = screen.getByLabelText(/Quem está enviando\?/i) as HTMLInputElement;
      fireEvent.change(senderInput, { target: { value: 'João Santos' } });
      expect(senderInput.value).toBe('João Santos');

      // Fill main message
      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      const message = 'Esta é uma mensagem especial para você. Obrigado por tudo!';
      fireEvent.change(messageTextarea, { target: { value: message } });
      expect(messageTextarea.value).toBe(message);

      // Verify character count
      expect(screen.getByText(`${message.length}/500`)).toBeInTheDocument();
    });

    it('should allow user to use text suggestions', async () => {
      renderComponent();

      // Open suggestions
      const suggestionsButton = screen.getByRole('button', { name: /Abrir sugestões de texto/i });
      fireEvent.click(suggestionsButton);

      await waitFor(() => {
        expect(screen.getByTestId('suggestion-panel')).toBeInTheDocument();
      });

      // Select a suggestion
      const selectButton = screen.getByRole('button', { name: 'Select Romantic' });
      fireEvent.click(selectButton);

      await waitFor(() => {
        const textarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
        expect(textarea.value).toBe('Romantic suggestion text');
      });

      // Verify panel closed
      expect(screen.queryByTestId('suggestion-panel')).not.toBeInTheDocument();
    });

    it('should allow user to replace message with different suggestion', async () => {
      renderComponent();

      // First, add some text
      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      fireEvent.change(messageTextarea, { target: { value: 'Initial message' } });
      expect(messageTextarea.value).toBe('Initial message');

      // Open suggestions
      const suggestionsButton = screen.getByRole('button', { name: /Abrir sugestões de texto/i });
      fireEvent.click(suggestionsButton);

      await waitFor(() => {
        expect(screen.getByTestId('suggestion-panel')).toBeInTheDocument();
      });

      // Select a different suggestion
      const selectButton = screen.getByRole('button', { name: 'Select Friendly' });
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(messageTextarea.value).toBe('Friendly suggestion text');
      });
    });

    it('should handle long messages correctly', async () => {
      renderComponent();

      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      
      // Type a long message (400 characters - 80%)
      const longMessage = 'a'.repeat(400);
      fireEvent.change(messageTextarea, { target: { value: longMessage } });
      
      expect(messageTextarea.value).toBe(longMessage);
      expect(screen.getByText('400/500')).toBeInTheDocument();
      
      // Should not show warning yet (< 90%)
      expect(screen.queryByText(/Você está próximo do limite/i)).not.toBeInTheDocument();
    });

    it('should show progressive warnings as character limit approaches', async () => {
      renderComponent();

      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      
      // 90% - should show warning
      fireEvent.change(messageTextarea, { target: { value: 'a'.repeat(450) } });
      expect(screen.getByText(/Você está próximo do limite de caracteres/i)).toBeInTheDocument();
      
      // 100% - should show error
      fireEvent.change(messageTextarea, { target: { value: 'a'.repeat(500) } });
      expect(screen.getByText(/Limite de caracteres atingido!/i)).toBeInTheDocument();
    });

    it('should maintain state when switching between fields', async () => {
      renderComponent();

      // Fill all fields
      const recipientInput = screen.getByLabelText(/Para quem é a mensagem\?/i) as HTMLInputElement;
      const senderInput = screen.getByLabelText(/Quem está enviando\?/i) as HTMLInputElement;
      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;

      fireEvent.change(recipientInput, { target: { value: 'Ana' } });
      fireEvent.change(senderInput, { target: { value: 'Pedro' } });
      fireEvent.change(messageTextarea, { target: { value: 'Test message' } });

      // Verify all values are maintained
      expect(recipientInput.value).toBe('Ana');
      expect(senderInput.value).toBe('Pedro');
      expect(messageTextarea.value).toBe('Test message');

      // Change focus between fields
      recipientInput.focus();
      senderInput.focus();
      messageTextarea.focus();

      // Values should still be there
      expect(recipientInput.value).toBe('Ana');
      expect(senderInput.value).toBe('Pedro');
      expect(messageTextarea.value).toBe('Test message');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty fields gracefully', () => {
      renderComponent();

      const recipientInput = screen.getByLabelText(/Para quem é a mensagem\?/i) as HTMLInputElement;
      const senderInput = screen.getByLabelText(/Quem está enviando\?/i) as HTMLInputElement;
      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;

      expect(recipientInput.value).toBe('');
      expect(senderInput.value).toBe('');
      expect(messageTextarea.value).toBe('');
    });

    it('should handle special characters in names', () => {
      renderComponent();

      const recipientInput = screen.getByLabelText(/Para quem é a mensagem\?/i) as HTMLInputElement;
      const specialName = "Maria José O'Connor-Silva";
      
      fireEvent.change(recipientInput, { target: { value: specialName } });
      expect(recipientInput.value).toBe(specialName);
    });

    it('should handle unicode characters in message', () => {
      renderComponent();

      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      const unicodeMessage = 'Olá! 你好 🎉 Привет';
      
      fireEvent.change(messageTextarea, { target: { value: unicodeMessage } });
      expect(messageTextarea.value).toBe(unicodeMessage);
    });

    it('should handle line breaks in message', () => {
      renderComponent();

      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      
      fireEvent.change(messageTextarea, { target: { value: multilineMessage } });
      expect(messageTextarea.value).toBe(multilineMessage);
    });

    it('should handle rapid typing', async () => {
      renderComponent();

      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      
      // Simulate rapid typing
      for (let i = 1; i <= 10; i++) {
        fireEvent.change(messageTextarea, { target: { value: 'a'.repeat(i * 10) } });
      }

      // Final value should be correct
      expect(messageTextarea.value).toBe('a'.repeat(100));
      expect(screen.getByText('100/500')).toBeInTheDocument();
    });
  });

  describe('Accessibility in Real Usage', () => {
    it('should support keyboard navigation', () => {
      renderComponent();

      const recipientInput = screen.getByLabelText(/Para quem é a mensagem\?/i);
      const senderInput = screen.getByLabelText(/Quem está enviando\?/i);
      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i);
      const suggestionsButton = screen.getByRole('button', { name: /Abrir sugestões de texto/i });

      // Tab through fields
      recipientInput.focus();
      expect(document.activeElement).toBe(recipientInput);

      // All elements should be focusable
      senderInput.focus();
      expect(document.activeElement).toBe(senderInput);

      messageTextarea.focus();
      expect(document.activeElement).toBe(messageTextarea);

      suggestionsButton.focus();
      expect(document.activeElement).toBe(suggestionsButton);
    });

    it('should announce character count changes to screen readers', () => {
      renderComponent();

      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i);
      const counter = screen.getByText('0/500');

      // Counter should have an ID that can be referenced
      expect(counter).toHaveAttribute('id', 'mainMessage-counter');
      
      // Textarea should reference the counter
      expect(messageTextarea).toHaveAttribute('aria-describedby', 'mainMessage-counter');
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid updates efficiently', () => {
      renderComponent();

      const messageTextarea = screen.getByLabelText(/Sua Mensagem/i) as HTMLTextAreaElement;
      
      const startTime = performance.now();
      
      // Perform 50 rapid updates
      for (let i = 0; i < 50; i++) {
        fireEvent.change(messageTextarea, { target: { value: `Message ${i}` } });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
      
      // Final value should be correct
      expect(messageTextarea.value).toBe('Message 49');
    });
  });
});
