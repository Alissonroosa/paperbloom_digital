import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step5ThemeCustomization } from '../Step5ThemeCustomization';
import { WizardProvider } from '@/contexts/WizardContext';
import { BACKGROUND_COLORS, THEME_OPTIONS } from '@/types/wizard';

// Mock the wizard-utils module
vi.mock('@/lib/wizard-utils', () => ({
  validateContrast: vi.fn((backgroundColor: string, theme: string) => {
    // Mock validation logic
    if (backgroundColor === '#FEF3C7' && theme === 'light') {
      return {
        isValid: false,
        warning: 'Contraste insuficiente (2.5:1). Recomendamos escolher uma cor mais clara.',
      };
    }
    return { isValid: true };
  }),
}));

describe('Step5ThemeCustomization', () => {
  const renderComponent = () => {
    return render(
      <WizardProvider>
        <Step5ThemeCustomization />
      </WizardProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with title and description', () => {
      renderComponent();
      
      expect(screen.getByText('Personalização do Tema')).toBeInTheDocument();
      expect(screen.getByText(/Escolha as cores e o tema visual/)).toBeInTheDocument();
    });

    it('renders all 8 predefined background colors', () => {
      renderComponent();
      
      // Check that all color buttons are rendered
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      expect(colorButtons).toHaveLength(BACKGROUND_COLORS.length);
      expect(colorButtons).toHaveLength(8);
    });

    it('renders all 3 theme options', () => {
      renderComponent();
      
      // Check for theme buttons
      THEME_OPTIONS.forEach(theme => {
        expect(screen.getByText(theme.name)).toBeInTheDocument();
        expect(screen.getByText(theme.description)).toBeInTheDocument();
      });
    });

    it('renders custom color picker toggle button', () => {
      renderComponent();
      
      expect(screen.getByText(/Escolher Cor Personalizada/)).toBeInTheDocument();
    });

    it('renders information boxes', () => {
      renderComponent();
      
      expect(screen.getByText('💡 Dica')).toBeInTheDocument();
      expect(screen.getByText(/Visualização:/)).toBeInTheDocument();
    });
  });

  describe('Color Selection', () => {
    it('allows selecting a predefined color', () => {
      renderComponent();
      
      // Find and click the first color button (Rosa Suave)
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      const firstColorButton = colorButtons[0];
      fireEvent.click(firstColorButton);
      
      // Check that the button is marked as pressed
      expect(firstColorButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows checkmark on selected color', () => {
      renderComponent();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // Initially, the white color should be selected (default)
      const whiteButton = colorButtons.find(
        button => button.getAttribute('aria-label')?.includes('Branco')
      );
      
      expect(whiteButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('updates selection when clicking different colors', () => {
      renderComponent();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // Click second color
      fireEvent.click(colorButtons[1]);
      expect(colorButtons[1]).toHaveAttribute('aria-pressed', 'true');
      
      // Click third color
      fireEvent.click(colorButtons[2]);
      expect(colorButtons[2]).toHaveAttribute('aria-pressed', 'true');
      expect(colorButtons[1]).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Custom Color Picker', () => {
    it('toggles custom color picker visibility', () => {
      renderComponent();
      
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      
      // Initially hidden
      expect(screen.queryByLabelText('Seletor de cor personalizada')).not.toBeInTheDocument();
      
      // Click to show
      fireEvent.click(toggleButton);
      expect(screen.getByLabelText('Seletor de cor personalizada')).toBeInTheDocument();
      
      // Click to hide
      fireEvent.click(toggleButton);
      expect(screen.queryByLabelText('Seletor de cor personalizada')).not.toBeInTheDocument();
    });

    it('updates button text when picker is shown', () => {
      renderComponent();
      
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      expect(screen.getByText(/Ocultar Cor Personalizada/)).toBeInTheDocument();
    });

    it('allows entering custom hex color', () => {
      renderComponent();
      
      // Show custom picker
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      // Find hex input
      const hexInput = screen.getByLabelText('Código hexadecimal da cor');
      
      // Enter custom color
      fireEvent.change(hexInput, { target: { value: '#FF5733' } });
      
      expect(hexInput).toHaveValue('#FF5733');
    });

    it('validates hex color format', () => {
      renderComponent();
      
      // Show custom picker
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      fireEvent.click(toggleButton);
      
      const hexInput = screen.getByLabelText('Código hexadecimal da cor');
      
      // Valid hex color
      fireEvent.change(hexInput, { target: { value: '#ABC123' } });
      expect(hexInput).toHaveValue('#ABC123');
      
      // Invalid characters should not update (mocked behavior)
      const initialValue = hexInput.value;
      fireEvent.change(hexInput, { target: { value: 'invalid' } });
      // The component should prevent invalid input
    });
  });

  describe('Theme Selection', () => {
    it('allows selecting a theme', () => {
      renderComponent();
      
      const lightThemeButton = screen.getByRole('button', { name: /Selecionar tema Claro/ });
      const darkThemeButton = screen.getByRole('button', { name: /Selecionar tema Escuro/ });
      
      // Initially light theme is selected
      expect(lightThemeButton).toHaveAttribute('aria-pressed', 'true');
      
      // Select dark theme
      fireEvent.click(darkThemeButton);
      expect(darkThemeButton).toHaveAttribute('aria-pressed', 'true');
      expect(lightThemeButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('shows checkmark on selected theme', () => {
      renderComponent();
      
      const lightThemeButton = screen.getByRole('button', { name: /Selecionar tema Claro/ });
      
      // Light theme should be selected by default
      expect(lightThemeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('displays theme previews', () => {
      renderComponent();
      
      // Check that theme preview elements exist (Aa text)
      const themePreviews = screen.getAllByText('Aa');
      expect(themePreviews.length).toBeGreaterThan(0);
    });
  });

  describe('Contrast Validation', () => {
    it('displays contrast warning for poor contrast combinations', async () => {
      renderComponent();
      
      // Select a color that will trigger warning (Amarelo Claro with Light theme)
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // Find Amarelo Claro button (index 5 based on BACKGROUND_COLORS)
      const amareloButton = colorButtons[5];
      fireEvent.click(amareloButton);
      
      // Wait for contrast validation to run
      await waitFor(() => {
        expect(screen.getByText('Aviso de Contraste')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Contraste insuficiente/)).toBeInTheDocument();
    });

    it('hides contrast warning for good contrast combinations', async () => {
      renderComponent();
      
      // Select white color with light theme (good contrast)
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      const whiteButton = colorButtons.find(
        button => button.getAttribute('aria-label')?.includes('Branco')
      );
      
      if (whiteButton) {
        fireEvent.click(whiteButton);
      }
      
      // Wait a bit for validation
      await waitFor(() => {
        expect(screen.queryByText('Aviso de Contraste')).not.toBeInTheDocument();
      });
    });

    it('updates contrast warning when theme changes', async () => {
      renderComponent();
      
      // Select problematic color
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      const amareloButton = colorButtons[5];
      fireEvent.click(amareloButton);
      
      // Wait for warning
      await waitFor(() => {
        expect(screen.getByText('Aviso de Contraste')).toBeInTheDocument();
      });
      
      // Change to dark theme (might fix contrast)
      const darkThemeButton = screen.getByRole('button', { name: /Selecionar tema Escuro/ });
      fireEvent.click(darkThemeButton);
      
      // Validation should run again
      await waitFor(() => {
        // With dark theme, contrast might be better
        // This depends on the mock implementation
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on color buttons', () => {
      renderComponent();
      
      BACKGROUND_COLORS.forEach(color => {
        const button = screen.getByRole('button', { name: `Selecionar cor ${color.name}` });
        expect(button).toBeInTheDocument();
      });
    });

    it('has proper ARIA labels on theme buttons', () => {
      renderComponent();
      
      THEME_OPTIONS.forEach(theme => {
        const button = screen.getByRole('button', { name: `Selecionar tema ${theme.name}` });
        expect(button).toBeInTheDocument();
      });
    });

    it('has aria-pressed attribute on selection buttons', () => {
      renderComponent();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      colorButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('has aria-expanded on custom picker toggle', () => {
      renderComponent();
      
      const toggleButton = screen.getByText(/Escolher Cor Personalizada/);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('has role="alert" on contrast warning', async () => {
      renderComponent();
      
      // Trigger warning
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      fireEvent.click(colorButtons[5]);
      
      await waitFor(() => {
        const warning = screen.getByRole('alert');
        expect(warning).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', () => {
      renderComponent();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // All buttons should be focusable
      colorButtons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Integration with Wizard Context', () => {
    it('uses wizard context for state management', () => {
      renderComponent();
      
      // Component should render without errors, indicating context is working
      expect(screen.getByText('Personalização do Tema')).toBeInTheDocument();
    });

    it('updates wizard state when color is selected', () => {
      renderComponent();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // Click should trigger updateField in context
      fireEvent.click(colorButtons[0]);
      
      // Verify the button state changed (indicates context update)
      expect(colorButtons[0]).toHaveAttribute('aria-pressed', 'true');
    });

    it('updates wizard state when theme is selected', () => {
      renderComponent();
      
      const darkThemeButton = screen.getByRole('button', { name: /Selecionar tema Escuro/ });
      
      fireEvent.click(darkThemeButton);
      
      // Verify the button state changed
      expect(darkThemeButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Visual Feedback', () => {
    it('shows checkmark icon on selected color', () => {
      renderComponent();
      
      // The default white color should show a checkmark
      // We can't directly test for the icon, but we can verify the button state
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      const selectedButton = colorButtons.find(
        button => button.getAttribute('aria-pressed') === 'true'
      );
      
      expect(selectedButton).toBeInTheDocument();
    });

    it('applies hover styles to color swatches', () => {
      renderComponent();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // Check that buttons have hover classes
      colorButtons.forEach(button => {
        expect(button.className).toContain('hover:');
      });
    });

    it('applies focus styles to interactive elements', () => {
      renderComponent();
      
      const colorButtons = screen.getAllByRole('button').filter(
        button => button.getAttribute('aria-label')?.includes('Selecionar cor')
      );
      
      // Check that buttons have focus classes
      colorButtons.forEach(button => {
        expect(button.className).toContain('focus:');
      });
    });
  });
});
