import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step7ContactInfo } from '../Step7ContactInfo';
import { WizardProvider } from '@/contexts/WizardContext';
import { validateStepBeforeNavigation } from '@/types/wizard';

/**
 * Integration tests for Step7ContactInfo component
 * Tests validation, error handling, and summary display with real data
 */

// Helper to render component with context
function renderWithContext() {
  return render(
    <WizardProvider>
      <Step7ContactInfo />
    </WizardProvider>
  );
}

describe('Step7ContactInfo Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Complete Contact Form Flow', () => {
    it('should allow filling all contact fields', async () => {
      renderWithContext();
      
      // Fill name
      const nameInput = screen.getByLabelText(/Seu Nome Completo/) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'João Silva Santos' } });
      expect(nameInput.value).toBe('João Silva Santos');
      
      // Fill email
      const emailInput = screen.getByLabelText(/Seu Email/) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'joao.silva@example.com' } });
      expect(emailInput.value).toBe('joao.silva@example.com');
      
      // Fill phone
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: '11987654321' } });
      expect(phoneInput.value).toBe('(11) 98765-4321');
      
      await waitFor(() => {
        expect(nameInput.value).toBe('João Silva Santos');
        expect(emailInput.value).toBe('joao.silva@example.com');
        expect(phoneInput.value).toBe('(11) 98765-4321');
      });
    });

    it('should handle clearing and re-entering data', async () => {
      renderWithContext();
      
      const emailInput = screen.getByLabelText(/Seu Email/) as HTMLInputElement;
      
      // Enter email
      fireEvent.change(emailInput, { target: { value: 'first@example.com' } });
      expect(emailInput.value).toBe('first@example.com');
      
      // Clear and enter new email
      fireEvent.change(emailInput, { target: { value: '' } });
      fireEvent.change(emailInput, { target: { value: 'second@example.com' } });
      
      await waitFor(() => {
        expect(emailInput.value).toBe('second@example.com');
      });
    });
  });

  describe('Phone Number Formatting Edge Cases', () => {
    it('should handle phone with existing formatting', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      
      // User pastes already formatted number
      fireEvent.change(phoneInput, { target: { value: '(11) 98765-4321' } });
      expect(phoneInput.value).toBe('(11) 98765-4321');
    });

    it('should handle phone with spaces and dashes', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      
      // User types with various separators
      fireEvent.change(phoneInput, { target: { value: '11 9 8765 4321' } });
      expect(phoneInput.value).toBe('(11) 98765-4321');
    });

    it('should handle incomplete phone numbers', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      
      // Partial input
      fireEvent.change(phoneInput, { target: { value: '119876' } });
      expect(phoneInput.value).toBe('(11) 9876');
    });

    it('should handle different area codes', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      
      // São Paulo
      fireEvent.change(phoneInput, { target: { value: '11987654321' } });
      expect(phoneInput.value).toBe('(11) 98765-4321');
      
      // Rio de Janeiro
      fireEvent.change(phoneInput, { target: { value: '21987654321' } });
      expect(phoneInput.value).toBe('(21) 98765-4321');
      
      // Brasília
      fireEvent.change(phoneInput, { target: { value: '61987654321' } });
      expect(phoneInput.value).toBe('(61) 98765-4321');
    });

    it('should handle landline vs mobile formatting', () => {
      renderWithContext();
      
      const phoneInput = screen.getByLabelText(/Seu Telefone/) as HTMLInputElement;
      
      // Mobile (11 digits)
      fireEvent.change(phoneInput, { target: { value: '11987654321' } });
      expect(phoneInput.value).toBe('(11) 98765-4321');
      
      // Landline (10 digits)
      fireEvent.change(phoneInput, { target: { value: '1133334444' } });
      expect(phoneInput.value).toBe('(11) 3333-4444');
    });
  });

  describe('Email Validation Scenarios', () => {
    it('should accept valid email formats', () => {
      renderWithContext();
      
      const emailInput = screen.getByLabelText(/Seu Email/) as HTMLInputElement;
      
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
      ];
      
      validEmails.forEach(email => {
        fireEvent.change(emailInput, { target: { value: email } });
        expect(emailInput.value).toBe(email);
      });
    });
  });

  describe('Character Limits', () => {
    it('should enforce name character limit', () => {
      renderWithContext();
      
      const nameInput = screen.getByLabelText(/Seu Nome Completo/) as HTMLInputElement;
      
      // Verify maxLength attribute is set
      expect(nameInput).toHaveAttribute('maxLength', '100');
      
      // In real browser, maxLength prevents typing beyond limit
      // In tests, we verify the attribute is present
      const validName = 'A'.repeat(100);
      fireEvent.change(nameInput, { target: { value: validName } });
      expect(nameInput.value.length).toBe(100);
    });

    it('should show character count updates', () => {
      renderWithContext();
      
      const nameInput = screen.getByLabelText(/Seu Nome Completo/);
      
      fireEvent.change(nameInput, { target: { value: 'João' } });
      expect(screen.getByText('4/100')).toBeInTheDocument();
      
      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      expect(screen.getByText('10/100')).toBeInTheDocument();
    });
  });

  describe('Summary Display with Real Data', () => {
    it('should display all summary sections', () => {
      renderWithContext();
      
      // Check all summary sections are present
      expect(screen.getByText('Resumo da Sua Mensagem')).toBeInTheDocument();
      expect(screen.getByText('Título da Página')).toBeInTheDocument();
      expect(screen.getByText('Mensagem')).toBeInTheDocument();
      expect(screen.getByText('Tema')).toBeInTheDocument();
    });

    it('should show placeholder text for empty fields', () => {
      renderWithContext();
      
      // Empty page title
      expect(screen.getByText('Não informado')).toBeInTheDocument();
      
      // Empty message
      expect(screen.getByText('Nenhuma mensagem escrita')).toBeInTheDocument();
    });

    it('should display theme color preview', () => {
      renderWithContext();
      
      // Check for color preview element
      const colorPreview = document.querySelector('[aria-label*="Cor de fundo"]');
      expect(colorPreview).toBeInTheDocument();
      expect(colorPreview).toHaveStyle({ backgroundColor: '#FFFFFF' });
    });
  });

  describe('Form Validation Integration', () => {
    it('should validate complete valid form data', () => {
      const validData = {
        contactName: 'João Silva',
        contactEmail: 'joao@example.com',
        contactPhone: '(11) 98765-4321',
      };
      
      const result = validateStepBeforeNavigation(7, {
        ...validData,
        pageTitle: '',
        urlSlug: '',
        specialDate: null,
        recipientName: '',
        senderName: '',
        mainMessage: '',
        mainImage: null,
        galleryImages: [null, null, null, null, null, null, null],
        backgroundColor: '#FFFFFF',
        theme: 'light',
        customColor: null,
        youtubeUrl: '',
        musicStartTime: 0,
        signature: '',
        closingMessage: '',
      });
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should reject empty contact name', () => {
      const invalidData = {
        contactName: '',
        contactEmail: 'joao@example.com',
        contactPhone: '(11) 98765-4321',
      };
      
      const result = validateStepBeforeNavigation(7, {
        ...invalidData,
        pageTitle: '',
        urlSlug: '',
        specialDate: null,
        recipientName: '',
        senderName: '',
        mainMessage: '',
        mainImage: null,
        galleryImages: [null, null, null, null, null, null, null],
        backgroundColor: '#FFFFFF',
        theme: 'light',
        customColor: null,
        youtubeUrl: '',
        musicStartTime: 0,
        signature: '',
        closingMessage: '',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.contactName).toBeDefined();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        contactName: 'João Silva',
        contactEmail: 'invalid-email',
        contactPhone: '(11) 98765-4321',
      };
      
      const result = validateStepBeforeNavigation(7, {
        ...invalidData,
        pageTitle: '',
        urlSlug: '',
        specialDate: null,
        recipientName: '',
        senderName: '',
        mainMessage: '',
        mainImage: null,
        galleryImages: [null, null, null, null, null, null, null],
        backgroundColor: '#FFFFFF',
        theme: 'light',
        customColor: null,
        youtubeUrl: '',
        musicStartTime: 0,
        signature: '',
        closingMessage: '',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.contactEmail).toBeDefined();
    });

    it('should reject invalid phone format', () => {
      const invalidData = {
        contactName: 'João Silva',
        contactEmail: 'joao@example.com',
        contactPhone: '123456',
      };
      
      const result = validateStepBeforeNavigation(7, {
        ...invalidData,
        pageTitle: '',
        urlSlug: '',
        specialDate: null,
        recipientName: '',
        senderName: '',
        mainMessage: '',
        mainImage: null,
        galleryImages: [null, null, null, null, null, null, null],
        backgroundColor: '#FFFFFF',
        theme: 'light',
        customColor: null,
        youtubeUrl: '',
        musicStartTime: 0,
        signature: '',
        closingMessage: '',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.contactPhone).toBeDefined();
    });
  });

  describe('User Experience Flow', () => {
    it('should provide clear guidance through helper texts', () => {
      renderWithContext();
      
      // Email helper text
      expect(screen.getByText(/Enviaremos o link e QR Code/)).toBeInTheDocument();
      
      // Phone format helper
      expect(screen.getByText('Formato: (XX) XXXXX-XXXX')).toBeInTheDocument();
      
      // Privacy notice
      expect(screen.getByText(/Suas informações são seguras conosco/)).toBeInTheDocument();
      
      // Next steps
      expect(screen.getByText(/Clique em "Prosseguir para Pagamento"/)).toBeInTheDocument();
    });

    it('should show all required field indicators', () => {
      renderWithContext();
      
      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility Integration', () => {
    it('should have proper ARIA attributes on inputs', () => {
      renderWithContext();
      
      const nameInput = screen.getByLabelText(/Seu Nome Completo/);
      const emailInput = screen.getByLabelText(/Seu Email/);
      const phoneInput = screen.getByLabelText(/Seu Telefone/);
      
      // All inputs should have proper attributes
      expect(nameInput).toHaveAttribute('id');
      expect(emailInput).toHaveAttribute('id');
      expect(phoneInput).toHaveAttribute('id');
    });

    it('should maintain focus management', () => {
      renderWithContext();
      
      const nameInput = screen.getByLabelText(/Seu Nome Completo/);
      const emailInput = screen.getByLabelText(/Seu Email/);
      
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
      
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);
    });
  });
});

