import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Step1PageTitleURL } from '../Step1PageTitleURL';
import { WizardProvider } from '@/contexts/WizardContext';

// Mock the wizard utils
vi.mock('@/lib/wizard-utils', () => ({
  generateSlugFromTitle: (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  },
  checkSlugAvailability: vi.fn().mockResolvedValue({ available: true }),
}));

describe('Step1PageTitleURL', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and URL inputs', () => {
    render(
      <WizardProvider>
        <Step1PageTitleURL />
      </WizardProvider>
    );

    expect(screen.getByLabelText(/Título da Página/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL Personalizada/i)).toBeInTheDocument();
  });

  it('shows character count for title', async () => {
    const user = userEvent.setup();
    
    render(
      <WizardProvider>
        <Step1PageTitleURL />
      </WizardProvider>
    );

    const titleInput = screen.getByLabelText(/Título da Página/i);
    await user.type(titleInput, 'Test Title');

    expect(screen.getByText(/10\/100/)).toBeInTheDocument();
  });

  it('auto-generates slug from title', async () => {
    const user = userEvent.setup();
    
    render(
      <WizardProvider>
        <Step1PageTitleURL />
      </WizardProvider>
    );

    const titleInput = screen.getByLabelText(/Título da Página/i);
    const slugInput = screen.getByLabelText(/URL Personalizada/i);

    await user.type(titleInput, 'My Test Message');

    await waitFor(() => {
      expect(slugInput).toHaveValue('my-test-message');
    });
  });

  it('allows manual slug editing', async () => {
    const user = userEvent.setup();
    
    render(
      <WizardProvider>
        <Step1PageTitleURL />
      </WizardProvider>
    );

    const slugInput = screen.getByLabelText(/URL Personalizada/i);
    await user.type(slugInput, 'custom-slug');

    expect(slugInput).toHaveValue('custom-slug');
  });

  it('stops auto-generation after manual slug edit', async () => {
    const user = userEvent.setup();
    
    render(
      <WizardProvider>
        <Step1PageTitleURL />
      </WizardProvider>
    );

    const titleInput = screen.getByLabelText(/Título da Página/i);
    const slugInput = screen.getByLabelText(/URL Personalizada/i);

    // Type title first
    await user.type(titleInput, 'First Title');
    await waitFor(() => {
      expect(slugInput).toHaveValue('first-title');
    });

    // Manually edit slug
    await user.clear(slugInput);
    await user.type(slugInput, 'custom-slug');

    // Type more in title - slug should not change
    await user.type(titleInput, ' More Text');
    
    await waitFor(() => {
      expect(slugInput).toHaveValue('custom-slug');
    });
  });

  it('displays URL preview when slug is valid', async () => {
    const user = userEvent.setup();
    
    render(
      <WizardProvider>
        <Step1PageTitleURL />
      </WizardProvider>
    );

    const slugInput = screen.getByLabelText(/URL Personalizada/i);
    await user.type(slugInput, 'test-message');

    await waitFor(() => {
      expect(screen.getByText(/Prévia da URL:/i)).toBeInTheDocument();
      expect(screen.getByText(/paperbloom\.com\/mensagem\/test-message/)).toBeInTheDocument();
    });
  });

  it('shows character count for slug', async () => {
    const user = userEvent.setup();
    
    render(
      <WizardProvider>
        <Step1PageTitleURL />
      </WizardProvider>
    );

    const slugInput = screen.getByLabelText(/URL Personalizada/i);
    await user.type(slugInput, 'test');

    expect(screen.getByText(/4\/50/)).toBeInTheDocument();
  });

  it('enforces max length on title (100 chars)', async () => {
    const user = userEvent.setup();
    
    render(
      <WizardProvider>
        <Step1PageTitleURL />
      </WizardProvider>
    );

    const titleInput = screen.getByLabelText(/Título da Página/i) as HTMLInputElement;
    
    expect(titleInput.maxLength).toBe(100);
  });

  it('enforces max length on slug (50 chars)', async () => {
    const user = userEvent.setup();
    
    render(
      <WizardProvider>
        <Step1PageTitleURL />
      </WizardProvider>
    );

    const slugInput = screen.getByLabelText(/URL Personalizada/i) as HTMLInputElement;
    
    expect(slugInput.maxLength).toBe(50);
  });
});
