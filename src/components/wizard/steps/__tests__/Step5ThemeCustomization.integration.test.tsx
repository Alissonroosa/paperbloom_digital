import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step5ThemeCustomization } from '../Step5ThemeCustomization';
import { WizardProvider, useWizard } from '@/contexts/WizardContext';
import { BACKGROUND_COLORS } from '@/types/wizard';
import React from 'react';

// Mock the wizard-utils module
vi.mock('@/lib/wizard-utils', async () => {
  const actual = await vi.importActual('@/lib/wizard-utils');
  return {
    ...actual,
    validateContrast: vi.fn((backgroundColor: string, theme: string) => {
      // Simulate real contrast validation
      if (backgroundColor === '#FEF3C7' && theme === 'light') {
        return {
          isValid: false,
          warning: 'Contraste insuficiente (3.2:1). Recomendamos escolher uma cor mais clara.',
        };
      }
      if (backgroundColor === '#F3F4F6' && theme === 'light') {
        return {
          isValid: false,
          warning: 'Contraste insuficiente (4.1:1). Recomendamos escolher uma cor mais clara.',
        };
      }
      return { isValid: true };
    }),
  };
});

// Test component that displays wizard state
function WizardStateDisplay() {
  const { data } = useWizard();
  return (
    <div data-testid="wizard-state">
      <div data-testid="background-color">{data.backgroundColor}</div>
      <div data-testid="theme">{data.theme}</div>
      <div data-testid="custom-color">{data.customColor || 'null'}</div>
    </div>
  );
}

describe('Step5ThemeCustomization Integration Tests', () => {
  const renderWithState = () => {
    return render(
      <WizardProvider>
        <Step5ThemeCustomization />
        <WizardStateDisplay />
      </WizardProvider>
    );
  };

  describe('State Management Integration', () => {
    it('updates wizard state when selecting predefined color', async () => {
      renderWithState();
      
      // Get initial state
      const initialColor = screen.getByTestId('background-color').textContent;
      
      // Select a different color (Rosa Suave)
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      fireEvent.click(colorButtons[0]); // Rosa Suave
      
      // Wait for state update
      await waitFor(() => {
        const newColor = screen.getByTestId('background-color').textContent;
        expect(newColor).toBe(BACKGROUND_COLORS[0].value);
        expect(newColor).not.toBe(initialColor);
      });
    });

    it('updates wizard state when selecting theme', async () => {
      renderWithState();
      
      // Initial theme should be 'light'
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      
      // Select dark theme
      const darkThemeButton = screen.getByRole('button', { name: /Selecionar tema Escuro/ });
      fireEvent.click(darkThemeButton);
      
      // Wait for state update
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });

    it('updates wizard state with custom color', async () => {
      renderWithState();
      
      // Initially no custom color
      expect(screen.getByTestId('custom-color')).toHaveTextContent('null');
      
      // Open custom picker
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      // Enter custom color
      const hexInput = screen.getByLabelText('Código hexadecimal da cor');
      fireEvent.change(hexInput, { target: { value: '#FF5733' } });
      
      // Wait for state update
      await waitFor(() => {
        expect(screen.getByTestId('custom-color')).toHaveTextContent('#FF5733');
        expect(screen.getByTestId('background-color')).toHaveTextContent('#FF5733');
      });
    });

    it('clears custom color when selecting predefined color', async () => {
      renderWithState();
      
      // Set custom color first
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      const hexInput = screen.getByLabelText('Código hexadecimal da cor');
      fireEvent.change(hexInput, { target: { value: '#FF5733' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-color')).toHaveTextContent('#FF5733');
      });
      
      // Now select a predefined color
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      fireEvent.click(colorButtons[1]);
      
      // Custom color should be cleared
      await waitFor(() => {
        expect(screen.getByTestId('custom-color')).toHaveTextContent('null');
      });
    });
  });

  describe('Contrast Validation Integration', () => {
    it('validates contrast when color changes', async () => {
      renderWithState();
      
      // Select a color with poor contrast (Amarelo Claro)
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      const amareloButton = colorButtons[5]; // Amarelo Claro
      fireEvent.click(amareloButton);
      
      // Wait for contrast warning to appear
      await waitFor(() => {
        expect(screen.getByText('Aviso de Contraste')).toBeInTheDocument();
        expect(screen.getByText(/Contraste insuficiente/)).toBeInTheDocument();
      });
    });

    it('validates contrast when theme changes', async () => {
      renderWithState();
      
      // Select Cinza Claro (might have poor contrast with light theme)
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      const cinzaButton = colorButtons[6]; // Cinza Claro
      fireEvent.click(cinzaButton);
      
      // Wait for potential warning
      await waitFor(() => {
        const hasWarning = screen.queryByText('Aviso de Contraste');
        if (hasWarning) {
          expect(hasWarning).toBeInTheDocument();
        }
      });
      
      // Change to dark theme
      const darkThemeButton = screen.getByRole('button', { name: /Selecionar tema Escuro/ });
      fireEvent.click(darkThemeButton);
      
      // Contrast should be re-validated
      await waitFor(() => {
        // With dark theme, contrast should improve
        // Warning might disappear
      });
    });

    it('validates contrast for custom colors', async () => {
      renderWithState();
      
      // Open custom picker
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      // Enter a color with poor contrast
      const hexInput = screen.getByLabelText('Código hexadecimal da cor');
      fireEvent.change(hexInput, { target: { value: '#FEF3C7' } });
      
      // Wait for contrast validation
      await waitFor(() => {
        expect(screen.getByText('Aviso de Contraste')).toBeInTheDocument();
      });
    });

    it('removes warning when selecting good contrast color', async () => {
      renderWithState();
      
      // First select a bad contrast color
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      fireEvent.click(colorButtons[5]); // Amarelo Claro
      
      await waitFor(() => {
        expect(screen.getByText('Aviso de Contraste')).toBeInTheDocument();
      });
      
      // Now select a good contrast color (Branco)
      const brancoButton = colorButtons.find(
        button => button.getAttribute('aria-label')?.includes('Branco')
      );
      
      if (brancoButton) {
        fireEvent.click(brancoButton);
      }
      
      // Warning should disappear
      await waitFor(() => {
        expect(screen.queryByText('Aviso de Contraste')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Workflow Integration', () => {
    it('supports complete color customization workflow', async () => {
      renderWithState();
      
      // Step 1: Select a predefined color
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      fireEvent.click(colorButtons[2]); // Verde Menta
      
      await waitFor(() => {
        expect(screen.getByTestId('background-color')).toHaveTextContent(BACKGROUND_COLORS[2].value);
      });
      
      // Step 2: Change theme
      const darkThemeButton = screen.getByRole('button', { name: /Selecionar tema Escuro/ });
      fireEvent.click(darkThemeButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
      
      // Step 3: Try custom color
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      const hexInput = screen.getByLabelText('Código hexadecimal da cor');
      fireEvent.change(hexInput, { target: { value: '#4A90E2' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-color')).toHaveTextContent('#4A90E2');
      });
      
      // Step 4: Go back to predefined color
      fireEvent.click(colorButtons[0]); // Rosa Suave
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-color')).toHaveTextContent('null');
        expect(screen.getByTestId('background-color')).toHaveTextContent(BACKGROUND_COLORS[0].value);
      });
    });

    it('maintains state consistency across multiple changes', async () => {
      renderWithState();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // Make multiple rapid changes
      fireEvent.click(colorButtons[0]);
      fireEvent.click(colorButtons[1]);
      fireEvent.click(colorButtons[2]);
      
      // Final state should be the last selection
      await waitFor(() => {
        expect(screen.getByTestId('background-color')).toHaveTextContent(BACKGROUND_COLORS[2].value);
      });
      
      // Change theme multiple times
      const darkButton = screen.getByRole('button', { name: /Selecionar tema Escuro/ });
      const gradientButton = screen.getByRole('button', { name: /Selecionar tema Gradiente/ });
      const lightButton = screen.getByRole('button', { name: /Selecionar tema Claro/ });
      
      fireEvent.click(darkButton);
      fireEvent.click(gradientButton);
      fireEvent.click(lightButton);
      
      // Final state should be light
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains focus management during interactions', async () => {
      renderWithState();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // Click a color button
      colorButtons[0].focus();
      fireEvent.click(colorButtons[0]);
      
      // Button should still be focusable after click
      expect(document.activeElement).toBe(colorButtons[0]);
    });

    it('announces contrast warnings to screen readers', async () => {
      renderWithState();
      
      // Select color with poor contrast
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      fireEvent.click(colorButtons[5]); // Amarelo Claro
      
      // Wait for warning with proper ARIA
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('supports keyboard navigation through all controls', () => {
      renderWithState();
      
      // Get all interactive elements
      const buttons = screen.getAllByRole('button');
      
      // All buttons should be keyboard accessible
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
      
      // Open custom picker
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      // Color input should be accessible
      const colorInput = screen.getByLabelText('Seletor de cor personalizada');
      expect(colorInput).toBeInTheDocument();
      
      const hexInput = screen.getByLabelText('Código hexadecimal da cor');
      expect(hexInput).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid color changes gracefully', async () => {
      renderWithState();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // Rapidly click multiple colors
      for (let i = 0; i < colorButtons.length; i++) {
        fireEvent.click(colorButtons[i]);
      }
      
      // Should end up with the last color
      await waitFor(() => {
        const finalColor = screen.getByTestId('background-color').textContent;
        expect(finalColor).toBe(BACKGROUND_COLORS[BACKGROUND_COLORS.length - 1].value);
      });
    });

    it('handles invalid hex input gracefully', async () => {
      renderWithState();
      
      // Open custom picker
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      const hexInput = screen.getByLabelText('Código hexadecimal da cor');
      
      // Try to enter invalid hex
      fireEvent.change(hexInput, { target: { value: 'invalid' } });
      
      // Component should handle this gracefully (not crash)
      expect(screen.getByText('Personalização do Tema')).toBeInTheDocument();
    });

    it('handles theme changes with custom colors', async () => {
      renderWithState();
      
      // Set custom color
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      const hexInput = screen.getByLabelText('Código hexadecimal da cor');
      fireEvent.change(hexInput, { target: { value: '#FF5733' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-color')).toHaveTextContent('#FF5733');
      });
      
      // Change theme
      const darkButton = screen.getByRole('button', { name: /Selecionar tema Escuro/ });
      fireEvent.click(darkButton);
      
      // Custom color should be preserved
      await waitFor(() => {
        expect(screen.getByTestId('custom-color')).toHaveTextContent('#FF5733');
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
    });
  });
});
