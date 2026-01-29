import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step7ContactInfo } from '../Step7ContactInfo';
import { WizardProvider } from '@/contexts/WizardContext';

/**
 * Unit tests for Step7ContactInfo component
 * Tests contact information collection and summary display
 */

// Helper to render component with context
function renderWithContext() {
  return render(
    <WizardProvider>
      <Step7ContactInfo />
    </WizardProvider>
  );
}

describe('Step7ContactInfo', () => {
  beforeEach(() => {
    // Clear any localStorage before each test
    localStorage.clear();
  });

  describe('Component Rendering', () => {
    it('should render the component with heading', () => {
      renderWithContext();
      
      expect(screen.getByText('Informações de Contato')).toBeInTheDocument();
      expect(screen.getByText(/Para finalizar, precisamos de suas informações/)).toBeInTheDocument();
    });

    it('should render all three contact input fields', () => {
      renderWithContext();
      
      expect(screen.getByLabelText(/Seu Nome Completo/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Seu Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Seu Telefone/)).toBeInTheDocument();
    });

    it('should show required indicators on all fields', () => {
      renderWithContext();
      
      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(3);
    });

    it('should render summary section', () => {
      renderWithContext();
      
      expect(screen.getByText('Resumo da Sua Mensagem')).toBeInTheDocument();
    });

    it('should render privacy notice', () => {
      renderWithContext();
      
      expect(screen.getByText(/Privacidade e Segurança/)).toBeInTheDocument();
    });

    it('should render next steps information', () => {
      renderWithContext();
      
      expect(screen.getByText(/Próximos Passos/)).toBeInTheDocument();
    });
  });

  describe('Contact Name Input', () => {
    it('should allow typing in name field', () => {
      renderWithContext();
      
      const nameInput = screen.getByLabelText(/Seu Nome Completo/) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      
      expect(nameInput.value).toBe('João Silva');
    });

    it('should show character count for name', () => {
      renderWithContext();
      
      const nameInput = screen.getByLabelText(/Seu Nome Completo/);
      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      
      expect(screen.getByText('10/100')).toBeInTheDocument();
    });

    it('should enforce 100 character limit', () => {
      renderWithContext();
      
      const nameInput = screen.getByLabelText(/Seu Nome Completo/) as HTMLInputElement;
      expect(nameInput).toHaveAttribute('maxLength', '100');
    });
  });

  describe('Email Input', () => {
    it('should allow typing in email field', () => {
      renderWithContext();
      
      const emailInput = screen.getByLabelText(/Seu Email/) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
      
      expect(emailInput.value).toBe('joao@example.com');
    });

    it('should have email type attribute', () => {
      renderWithContext();
      
      const emailInput = screen.getByLabelText(/Seu Email/);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should show helper text about email usage', () => {
      renderWithContext();
      
      expect(screen.getByText(/Enviaremos o link e QR Code/)).toBeInTheDocument();
    });
  });

  describe('Phone Input', () => {
    it('should allow typing in phone field', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: '11987654321' } });
      
      // Should be formatted
      expect(phoneInput.value).toBe('(11) 98765-4321');
    });

    it('should format 11-digit mobile number correctly', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: '11987654321' } });
      
      expect(phoneInput.value).toBe('(11) 98765-4321');
    });

    it('should format 10-digit landline number correctly', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: '1133334444' } });
      
      expect(phoneInput.value).toBe('(11) 3333-4444');
    });

    it('should remove non-digit characters', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: '(11) 98765-4321' } });
      
      // Should maintain formatting
      expect(phoneInput.value).toBe('(11) 98765-4321');
    });

    it('should handle partial phone input', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      
      // Type digits one by one
      fireEvent.change(phoneInput, { target: { value: '11' } });
      expect(phoneInput.value).toBe('(11');
      
      fireEvent.change(phoneInput, { target: { value: '119' } });
      expect(phoneInput.value).toBe('(11) 9');
    });

    it('should enforce 15 character limit', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      expect(phoneInput).toHaveAttribute('maxLength', '15');
    });

    it('should show format helper text', () => {
      renderWithContext();
      
      expect(screen.getByText('Formato: (XX) XXXXX-XXXX')).toBeInTheDocument();
    });
  });

  describe('Summary Display', () => {
    it('should display page title in summary', () => {
      renderWithContext();
      
      expect(screen.getByText('Título da Página')).toBeInTheDocument();
    });

    it('should display message section in summary', () => {
      renderWithContext();
      
      expect(screen.getByText('Mensagem')).toBeInTheDocument();
    });

    it('should display theme section in summary', () => {
      renderWithContext();
      
      expect(screen.getByText('Tema')).toBeInTheDocument();
    });

    it('should show "Não informado" for empty page title', () => {
      renderWithContext();
      
      expect(screen.getByText('Não informado')).toBeInTheDocument();
    });

    it('should display sender and recipient placeholders', () => {
      renderWithContext();
      
      // Should show ellipsis for empty names
      const messageSection = screen.getByText('Mensagem').closest('div');
      expect(messageSection).toHaveTextContent('De ... para ...');
    });
  });

  describe('Icons and Visual Elements', () => {
    it('should render input field icons', () => {
      renderWithContext();
      
      // Check for icon presence by checking parent elements
      const nameInput = screen.getByLabelText(/Seu Nome Completo/);
      const emailInput = screen.getByLabelText(/Seu Email/);
      const phoneInput = screen.getByLabelText(/Seu Telefone/);
      
      expect(nameInput.parentElement).toHaveClass('relative');
      expect(emailInput.parentElement).toHaveClass('relative');
      expect(phoneInput.parentElement).toHaveClass('relative');
    });

    it('should render theme color preview in summary', () => {
      renderWithContext();
      
      // Look for the color preview div
      const colorPreview = document.querySelector('[aria-label*="Cor de fundo"]');
      expect(colorPreview).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderWithContext();
      
      expect(screen.getByLabelText(/Seu Nome Completo/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Seu Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Seu Telefone/)).toBeInTheDocument();
    });

    it('should have proper input types', () => {
      renderWithContext();
      
      const nameInput = screen.getByLabelText(/Seu Nome Completo/);
      const emailInput = screen.getByLabelText(/Seu Email/);
      const phoneInput = screen.getByLabelText(/Seu Telefone/);
      
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(phoneInput).toHaveAttribute('type', 'tel');
    });

    it('should have placeholders for all inputs', () => {
      renderWithContext();
      
      expect(screen.getByPlaceholderText('Ex: João Silva')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('(11) 98765-4321')).toBeInTheDocument();
    });
  });

  describe('Information Boxes', () => {
    it('should render privacy notice box', () => {
      renderWithContext();
      
      expect(screen.getByText(/Privacidade e Segurança/)).toBeInTheDocument();
      expect(screen.getByText(/Suas informações são seguras conosco/)).toBeInTheDocument();
    });

    it('should render next steps box', () => {
      renderWithContext();
      
      expect(screen.getByText(/Próximos Passos/)).toBeInTheDocument();
      expect(screen.getByText(/Clique em "Prosseguir para Pagamento"/)).toBeInTheDocument();
    });
  });

  describe('Integration with Wizard Context', () => {
    it('should update context when name changes', async () => {
      renderWithContext();
      
      const nameInput = screen.getByLabelText(/Seu Nome Completo/);
      fireEvent.change(nameInput, { target: { value: 'Maria Santos' } });
      
      await waitFor(() => {
        expect((nameInput as HTMLInputElement).value).toBe('Maria Santos');
      });
    });

    it('should update context when email changes', async () => {
      renderWithContext();
      
      const emailInput = screen.getByLabelText(/Seu Email/);
      fireEvent.change(emailInput, { target: { value: 'maria@example.com' } });
      
      await waitFor(() => {
        expect((emailInput as HTMLInputElement).value).toBe('maria@example.com');
      });
    });

    it('should update context when phone changes', async () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/);
      fireEvent.change(phoneInput, { target: { value: '21987654321' } });
      
      await waitFor(() => {
        expect((phoneInput as HTMLInputElement).value).toBe('(21) 98765-4321');
      });
    });
  });
});
