import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreviewPanel } from '../PreviewPanel';
import { WizardFormData, WizardUploadStates } from '@/types/wizard';

// Mock the preview components
vi.mock('@/components/editor/Preview', () => ({
  Preview: ({ message, from, to }: any) => (
    <div data-testid="card-preview">
      <div>From: {from}</div>
      <div>To: {to}</div>
      <div>Message: {message}</div>
    </div>
  ),
}));

vi.mock('@/components/editor/CinematicPreview', () => ({
  CinematicPreview: ({ data }: any) => (
    <div data-testid="cinema-preview">
      <div>Title: {data.title}</div>
      <div>Message: {data.message}</div>
    </div>
  ),
}));

describe('PreviewPanel', () => {
  const mockData: WizardFormData = {
    pageTitle: 'Test Title',
    urlSlug: 'test-slug',
    specialDate: new Date('2024-12-25'),
    recipientName: 'Maria',
    senderName: 'João',
    mainMessage: 'Test message',
    mainImage: null,
    galleryImages: [null, null, null, null, null, null, null],
    backgroundColor: '#FFFFFF',
    theme: 'light',
    customColor: null,
    youtubeUrl: '',
    musicStartTime: 0,
    contactName: 'João Silva',
    contactEmail: 'joao@example.com',
    contactPhone: '(11) 98765-4321',
    signature: 'Com carinho',
    closingMessage: 'Obrigado',
  };

  const mockUploads: WizardUploadStates = {
    mainImage: {
      url: 'https://example.com/image.jpg',
      isUploading: false,
      error: null,
    },
    galleryImages: [
      { url: null, isUploading: false, error: null },
      { url: null, isUploading: false, error: null },
      { url: null, isUploading: false, error: null },
    ],
  };

  const mockOnViewModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('View Mode Toggle', () => {
    it('should render Card view by default', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      expect(screen.getByTestId('card-preview')).toBeInTheDocument();
      expect(screen.queryByTestId('cinema-preview')).not.toBeInTheDocument();
    });

    it('should render Cinema view when viewMode is cinema', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="cinema"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      expect(screen.getByTestId('cinema-preview')).toBeInTheDocument();
      expect(screen.queryByTestId('card-preview')).not.toBeInTheDocument();
    });

    it('should call onViewModeChange when Card button is clicked', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="cinema"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      const cardButton = screen.getByLabelText('Visualização em cartão');
      fireEvent.click(cardButton);

      expect(mockOnViewModeChange).toHaveBeenCalledWith('card');
    });

    it('should call onViewModeChange when Cinema button is clicked', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      const cinemaButton = screen.getByLabelText('Visualização cinemática');
      fireEvent.click(cinemaButton);

      expect(mockOnViewModeChange).toHaveBeenCalledWith('cinema');
    });

    it('should have correct aria-pressed state for active view mode', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      const cardButton = screen.getByLabelText('Visualização em cartão');
      const cinemaButton = screen.getByLabelText('Visualização cinemática');

      expect(cardButton).toHaveAttribute('aria-pressed', 'true');
      expect(cinemaButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Real-time Updates', () => {
    it('should update preview when data changes', async () => {
      const { rerender } = render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      expect(screen.getByText('Message: Test message')).toBeInTheDocument();

      const updatedData = { ...mockData, mainMessage: 'Updated message' };
      rerender(
        <PreviewPanel
          data={updatedData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Message: Updated message')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should update preview when uploads change', async () => {
      const { rerender } = render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      const updatedUploads = {
        ...mockUploads,
        mainImage: {
          url: 'https://example.com/new-image.jpg',
          isUploading: false,
          error: null,
        },
      };

      rerender(
        <PreviewPanel
          data={mockData}
          uploads={updatedUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      await waitFor(() => {
        // Preview should re-render with new data
        expect(screen.getByTestId('card-preview')).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Data Mapping', () => {
    it('should map wizard data to card preview props correctly', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      expect(screen.getByText('From: João')).toBeInTheDocument();
      expect(screen.getByText('To: Maria')).toBeInTheDocument();
      expect(screen.getByText('Message: Test message')).toBeInTheDocument();
    });

    it('should map wizard data to cinema preview props correctly', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="cinema"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      expect(screen.getByText('Title: Test Title')).toBeInTheDocument();
      expect(screen.getByText('Message: Test message')).toBeInTheDocument();
    });

    it('should use default values for empty fields', () => {
      const emptyData: WizardFormData = {
        ...mockData,
        recipientName: '',
        senderName: '',
        mainMessage: '',
      };

      render(
        <PreviewPanel
          data={emptyData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      expect(screen.getByText('From: ...')).toBeInTheDocument();
      expect(screen.getByText('To: ...')).toBeInTheDocument();
      expect(screen.getByText(/Sua mensagem especial aparecerá aqui/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on toggle buttons', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      expect(screen.getByLabelText('Visualização em cartão')).toBeInTheDocument();
      expect(screen.getByLabelText('Visualização cinemática')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      const cardButton = screen.getByLabelText('Visualização em cartão');
      cardButton.focus();
      expect(document.activeElement).toBe(cardButton);
    });
  });

  describe('Responsive Behavior', () => {
    it('should render floating button for mobile', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      const floatingButton = screen.getByLabelText('Abrir visualização');
      expect(floatingButton).toBeInTheDocument();
    });

    it('should open mobile modal when floating button is clicked', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      const floatingButton = screen.getByLabelText('Abrir visualização');
      fireEvent.click(floatingButton);

      expect(screen.getByText('Visualização')).toBeInTheDocument();
      expect(screen.getByLabelText('Fechar visualização')).toBeInTheDocument();
    });

    it('should close mobile modal when close button is clicked', () => {
      render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
        />
      );

      // Open modal
      const floatingButton = screen.getByLabelText('Abrir visualização');
      fireEvent.click(floatingButton);

      // Close modal
      const closeButton = screen.getByLabelText('Fechar visualização');
      fireEvent.click(closeButton);

      expect(screen.queryByText('Visualização')).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <PreviewPanel
          data={mockData}
          uploads={mockUploads}
          viewMode="card"
          onViewModeChange={mockOnViewModeChange}
          className="custom-class"
        />
      );

      const previewContainer = container.querySelector('.custom-class');
      expect(previewContainer).toBeInTheDocument();
    });
  });
});
