import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreviewPanel } from '../PreviewPanel';
import { WizardProvider } from '@/contexts/WizardContext';
import { useWizard } from '@/contexts/WizardContext';

// Mock the preview components
vi.mock('@/components/editor/Preview', () => ({
  Preview: ({ message, from, to, image, youtubeLink }: any) => (
    <div data-testid="card-preview">
      <div data-testid="preview-from">From: {from}</div>
      <div data-testid="preview-to">To: {to}</div>
      <div data-testid="preview-message">Message: {message}</div>
      {image && <div data-testid="preview-image">Image: {image}</div>}
      {youtubeLink && <div data-testid="preview-music">Music: {youtubeLink}</div>}
    </div>
  ),
}));

vi.mock('@/components/editor/CinematicPreview', () => ({
  CinematicPreview: ({ data }: any) => (
    <div data-testid="cinema-preview">
      <div data-testid="cinema-title">Title: {data.title}</div>
      <div data-testid="cinema-message">Message: {data.message}</div>
      <div data-testid="cinema-from">From: {data.from}</div>
      <div data-testid="cinema-to">To: {data.to}</div>
      {data.mainImage && <div data-testid="cinema-image">Image: {data.mainImage}</div>}
      {data.galleryImages.length > 0 && (
        <div data-testid="cinema-gallery">Gallery: {data.galleryImages.length} images</div>
      )}
    </div>
  ),
}));

/**
 * Integration Tests for PreviewPanel
 * Tests the component integrated with WizardContext
 */
describe('PreviewPanel Integration', () => {
  function TestWrapper() {
    const { data, uploads, ui, updateUIState, updateField } = useWizard();

    return (
      <div>
        <div data-testid="controls">
          <button
            onClick={() => updateField('recipientName', 'Updated Recipient')}
            data-testid="update-recipient"
          >
            Update Recipient
          </button>
          <button
            onClick={() => updateField('mainMessage', 'Updated Message')}
            data-testid="update-message"
          >
            Update Message
          </button>
        </div>

        <PreviewPanel
          data={data}
          uploads={uploads}
          viewMode={ui.previewMode}
          onViewModeChange={(mode) => updateUIState({ previewMode: mode })}
        />
      </div>
    );
  }

  it('should integrate with WizardContext and update preview in real-time', async () => {
    render(
      <WizardProvider>
        <TestWrapper />
      </WizardProvider>
    );

    // Initial state
    expect(screen.getByTestId('preview-to')).toHaveTextContent('To: ...');

    // Update recipient name
    const updateButton = screen.getByTestId('update-recipient');
    fireEvent.click(updateButton);

    // Wait for preview to update (within 300ms)
    await waitFor(
      () => {
        expect(screen.getByTestId('preview-to')).toHaveTextContent('To: Updated Recipient');
      },
      { timeout: 500 }
    );
  });

  it('should persist view mode changes across updates', async () => {
    render(
      <WizardProvider>
        <TestWrapper />
      </WizardProvider>
    );

    // Start in card view
    expect(screen.getByTestId('card-preview')).toBeInTheDocument();

    // Switch to cinema view
    const cinemaButton = screen.getByLabelText('Visualização cinemática');
    fireEvent.click(cinemaButton);

    await waitFor(() => {
      expect(screen.getByTestId('cinema-preview')).toBeInTheDocument();
    });

    // Update message
    const updateMessageButton = screen.getByTestId('update-message');
    fireEvent.click(updateMessageButton);

    // View mode should persist
    await waitFor(
      () => {
        expect(screen.getByTestId('cinema-preview')).toBeInTheDocument();
        expect(screen.getByTestId('cinema-message')).toHaveTextContent('Message: Updated Message');
      },
      { timeout: 500 }
    );
  });

  it('should handle multiple rapid updates efficiently', async () => {
    render(
      <WizardProvider>
        <TestWrapper />
      </WizardProvider>
    );

    const updateButton = screen.getByTestId('update-message');

    // Trigger multiple rapid updates
    fireEvent.click(updateButton);
    fireEvent.click(updateButton);
    fireEvent.click(updateButton);

    // Should debounce and show final state
    await waitFor(
      () => {
        expect(screen.getByTestId('preview-message')).toHaveTextContent('Message: Updated Message');
      },
      { timeout: 500 }
    );
  });

  it('should display all customizations in preview', async () => {
    function CustomTestWrapper() {
      const { data, uploads, ui, updateUIState, updateField, updateMainImageUpload } = useWizard();

      return (
        <div>
          <button
            onClick={() => {
              updateField('recipientName', 'Maria');
              updateField('senderName', 'João');
              updateField('mainMessage', 'Test message with all fields');
              updateField('youtubeUrl', 'https://youtube.com/watch?v=test');
              updateMainImageUpload({ url: 'https://example.com/image.jpg' });
            }}
            data-testid="fill-all-fields"
          >
            Fill All Fields
          </button>

          <PreviewPanel
            data={data}
            uploads={uploads}
            viewMode={ui.previewMode}
            onViewModeChange={(mode) => updateUIState({ previewMode: mode })}
          />
        </div>
      );
    }

    render(
      <WizardProvider>
        <CustomTestWrapper />
      </WizardProvider>
    );

    const fillButton = screen.getByTestId('fill-all-fields');
    fireEvent.click(fillButton);

    await waitFor(
      () => {
        expect(screen.getByTestId('preview-from')).toHaveTextContent('From: João');
        expect(screen.getByTestId('preview-to')).toHaveTextContent('To: Maria');
        expect(screen.getByTestId('preview-message')).toHaveTextContent(
          'Message: Test message with all fields'
        );
        expect(screen.getByTestId('preview-image')).toBeInTheDocument();
        expect(screen.getByTestId('preview-music')).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('should switch between Card and Cinema views with full data', async () => {
    function FullDataTestWrapper() {
      const { data, uploads, ui, updateUIState, updateField, updateMainImageUpload } = useWizard();

      return (
        <div>
          <button
            onClick={() => {
              updateField('pageTitle', 'Test Title');
              updateField('recipientName', 'Maria');
              updateField('senderName', 'João');
              updateField('mainMessage', 'Full message');
              updateMainImageUpload({ url: 'https://example.com/main.jpg' });
            }}
            data-testid="setup-data"
          >
            Setup Data
          </button>

          <PreviewPanel
            data={data}
            uploads={uploads}
            viewMode={ui.previewMode}
            onViewModeChange={(mode) => updateUIState({ previewMode: mode })}
          />
        </div>
      );
    }

    render(
      <WizardProvider>
        <FullDataTestWrapper />
      </WizardProvider>
    );

    // Setup data
    fireEvent.click(screen.getByTestId('setup-data'));

    await waitFor(() => {
      expect(screen.getByTestId('card-preview')).toBeInTheDocument();
    });

    // Switch to cinema
    fireEvent.click(screen.getByLabelText('Visualização cinemática'));

    await waitFor(() => {
      expect(screen.getByTestId('cinema-preview')).toBeInTheDocument();
      expect(screen.getByTestId('cinema-title')).toHaveTextContent('Title: Test Title');
      expect(screen.getByTestId('cinema-message')).toHaveTextContent('Message: Full message');
      expect(screen.getByTestId('cinema-image')).toBeInTheDocument();
    });

    // Switch back to card
    fireEvent.click(screen.getByLabelText('Visualização em cartão'));

    await waitFor(() => {
      expect(screen.getByTestId('card-preview')).toBeInTheDocument();
      expect(screen.getByTestId('preview-message')).toHaveTextContent('Message: Full message');
    });
  });
});
