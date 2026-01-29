import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step6MusicSelection } from '../Step6MusicSelection';
import { WizardProvider } from '@/contexts/WizardContext';

// Mock the wizard context
const mockUpdateField = vi.fn();

vi.mock('@/contexts/WizardContext', async () => {
  const actual = await vi.importActual('@/contexts/WizardContext');
  return {
    ...actual,
    useWizard: () => ({
      data: {
        youtubeUrl: '',
        musicStartTime: 0,
      },
      updateField: mockUpdateField,
    }),
  };
});

describe('Step6MusicSelection', () => {
  beforeEach(() => {
    mockUpdateField.mockClear();
  });

  it('should render the component', () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    expect(screen.getByText('Seleção de Música')).toBeInTheDocument();
    expect(screen.getByLabelText(/URL do YouTube/i)).toBeInTheDocument();
  });

  it('should show optional label', () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const optionalLabels = screen.getAllByText(/\(opcional\)/i);
    expect(optionalLabels.length).toBeGreaterThan(0);
  });

  it('should display URL format examples', () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    expect(screen.getByText(/youtube\.com\/watch\?v=/i)).toBeInTheDocument();
    expect(screen.getByText(/youtu\.be\//i)).toBeInTheDocument();
  });

  it('should show skip info when URL is empty', () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    expect(screen.getByText(/Música Opcional/i)).toBeInTheDocument();
    expect(screen.getByText(/pular esta etapa/i)).toBeInTheDocument();
  });

  it('should display tips for choosing music', () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    expect(screen.getByText(/Dicas para Escolher a Música/i)).toBeInTheDocument();
  });

  it('should display copyright notice', () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    expect(screen.getByText(/Aviso de Direitos Autorais/i)).toBeInTheDocument();
  });

  it('should have accessible input field', () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    expect(input).toHaveAttribute('type', 'url');
    expect(input).toHaveAttribute('placeholder');
  });
});
