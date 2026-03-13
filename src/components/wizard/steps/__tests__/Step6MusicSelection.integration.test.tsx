import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step6MusicSelection } from '../Step6MusicSelection';
import { WizardProvider } from '@/contexts/WizardContext';

describe('Step6MusicSelection Integration Tests', () => {
  it('should validate YouTube URL and show success message', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    
    // Enter a valid YouTube URL
    fireEvent.change(input, {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    // Wait for validation
    await waitFor(() => {
      expect(screen.getByText(/URL válida/i)).toBeInTheDocument();
      expect(screen.getByText(/dQw4w9WgXcQ/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid YouTube URL', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    
    // Enter an invalid URL
    fireEvent.change(input, {
      target: { value: 'https://vimeo.com/123456' },
    });

    // Wait for validation
    await waitFor(() => {
      expect(screen.getByText(/Deve ser uma URL do YouTube válida/i)).toBeInTheDocument();
    });
  });

  it('should show error for YouTube URL without video ID', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    
    // Enter a YouTube URL without video ID
    fireEvent.change(input, {
      target: { value: 'https://www.youtube.com/' },
    });

    // Wait for validation
    await waitFor(() => {
      expect(screen.getByText(/Não foi possível extrair o ID do vídeo/i)).toBeInTheDocument();
    });
  });

  it('should show music preview player when URL is valid', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    
    // Enter a valid YouTube URL
    fireEvent.change(input, {
      target: { value: 'https://youtu.be/dQw4w9WgXcQ' },
    });

    // Wait for preview to appear
    await waitFor(() => {
      expect(screen.getByText(/Prévia da Música/i)).toBeInTheDocument();
      const iframe = screen.getByTitle(/Prévia da música do YouTube/i);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', expect.stringContaining('dQw4w9WgXcQ'));
    });
  });

  it('should show start time slider when URL is valid', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    
    // Enter a valid YouTube URL
    fireEvent.change(input, {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    // Wait for slider to appear
    await waitFor(() => {
      expect(screen.getByText(/Tempo de Início da Música/i)).toBeInTheDocument();
      const slider = screen.getByLabelText(/Tempo de início da música em segundos/i);
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('type', 'range');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '300');
    });
  });

  it('should update start time when slider is moved', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    
    // Enter a valid YouTube URL
    fireEvent.change(input, {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    // Wait for slider to appear
    await waitFor(() => {
      const slider = screen.getByLabelText(/Tempo de início da música em segundos/i);
      expect(slider).toBeInTheDocument();
    });

    const slider = screen.getByLabelText(/Tempo de início da música em segundos/i);
    
    // Change slider value
    fireEvent.change(slider, { target: { value: '60' } });

    // Check if time display is updated
    await waitFor(() => {
      expect(screen.getByText(/Início: 1:00/i)).toBeInTheDocument();
    });
  });

  it('should clear URL when clear button is clicked', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i) as HTMLInputElement;
    
    // Enter a valid YouTube URL
    fireEvent.change(input, {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    // Wait for clear button to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Limpar URL/i)).toBeInTheDocument();
    });

    const clearButton = screen.getByLabelText(/Limpar URL/i);
    fireEvent.click(clearButton);

    // Check if URL is cleared
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should handle various YouTube URL formats', async () => {
    const testUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
    ];

    for (const url of testUrls) {
      const { unmount } = render(
        <WizardProvider>
          <Step6MusicSelection />
        </WizardProvider>
      );

      const input = screen.getByLabelText(/URL do YouTube/i);
      fireEvent.change(input, { target: { value: url } });

      await waitFor(() => {
        expect(screen.getByText(/URL válida/i)).toBeInTheDocument();
        expect(screen.getByText(/dQw4w9WgXcQ/i)).toBeInTheDocument();
      });

      unmount();
    }
  });

  it('should format time correctly', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    
    // Enter a valid YouTube URL
    fireEvent.change(input, {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    await waitFor(() => {
      const slider = screen.getByLabelText(/Tempo de início da música em segundos/i);
      expect(slider).toBeInTheDocument();
    });

    const slider = screen.getByLabelText(/Tempo de início da música em segundos/i);
    
    // Test various time values
    const testCases = [
      { value: 0, expected: '0:00' },
      { value: 30, expected: '0:30' },
      { value: 60, expected: '1:00' },
      { value: 125, expected: '2:05' },
      { value: 300, expected: '5:00' },
    ];

    for (const { value, expected } of testCases) {
      fireEvent.change(slider, { target: { value: value.toString() } });
      
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`Início: ${expected}`, 'i'))).toBeInTheDocument();
      });
    }
  });

  it('should have proper accessibility attributes', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    
    // Enter a valid YouTube URL
    fireEvent.change(input, {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    await waitFor(() => {
      const slider = screen.getByLabelText(/Tempo de início da música em segundos/i);
      expect(slider).toBeInTheDocument();
    });

    const slider = screen.getByLabelText(/Tempo de início da música em segundos/i);
    
    // Check ARIA attributes
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '300');
    expect(slider).toHaveAttribute('aria-valuenow');
    expect(slider).toHaveAttribute('aria-valuetext');
  });

  it('should show error with aria-invalid when URL is invalid', async () => {
    render(
      <WizardProvider>
        <Step6MusicSelection />
      </WizardProvider>
    );

    const input = screen.getByLabelText(/URL do YouTube/i);
    
    // Enter an invalid URL
    fireEvent.change(input, {
      target: { value: 'https://example.com' },
    });

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'url-error');
    });
  });
});
