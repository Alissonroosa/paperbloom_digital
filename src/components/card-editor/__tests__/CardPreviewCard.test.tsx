import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CardPreviewCard } from '../CardPreviewCard';
import { Card } from '@/types/card';

/**
 * Test suite for CardPreviewCard component
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.5, 3.6
 */
describe('CardPreviewCard', () => {
  // Mock card data
  const mockCard: Card = {
    id: 'test-card-1',
    collectionId: 'test-collection',
    order: 1,
    title: 'Abra quando... estiver tendo um dia difícil',
    messageText: 'Sei que hoje não está sendo fácil, mas quero que saiba que você é mais forte do que imagina.',
    imageUrl: null,
    youtubeUrl: null,
    status: 'unopened',
    openedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCallbacks = {
    onEditMessage: vi.fn(),
    onEditPhoto: vi.fn(),
    onEditMusic: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Component renders with card title
   * Requirement: 2.2
   */
  it('should render card title', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    expect(screen.getByText(mockCard.title)).toBeInTheDocument();
  });

  /**
   * Test: Component renders message preview
   * Requirement: 2.3
   */
  it('should render message preview', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    expect(screen.getByText(mockCard.messageText)).toBeInTheDocument();
  });

  /**
   * Test: Message is truncated to 100 characters
   * Requirement: 2.3
   */
  it('should truncate long messages to 100 characters', () => {
    const longMessage = 'A'.repeat(150);
    const cardWithLongMessage = { ...mockCard, messageText: longMessage };
    
    render(<CardPreviewCard card={cardWithLongMessage} {...mockCallbacks} />);
    
    const displayedText = screen.getByText(/A+\.\.\./);
    expect(displayedText.textContent).toHaveLength(103); // 100 chars + "..."
  });

  /**
   * Test: Shows "Adicionar Foto" when no photo
   * Requirement: 3.1
   */
  it('should show "Adicionar Foto" button when no photo exists', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    expect(screen.getByText('Adicionar Foto')).toBeInTheDocument();
  });

  /**
   * Test: Shows "Editar Foto" when photo exists
   * Requirement: 3.5
   */
  it('should show "Editar Foto" button when photo exists', () => {
    const cardWithPhoto = { ...mockCard, imageUrl: 'https://example.com/photo.jpg' };
    
    render(<CardPreviewCard card={cardWithPhoto} {...mockCallbacks} />);
    
    expect(screen.getByText('Editar Foto')).toBeInTheDocument();
    expect(screen.queryByText('Adicionar Foto')).not.toBeInTheDocument();
  });

  /**
   * Test: Shows "Adicionar Música" when no music
   * Requirement: 3.1
   */
  it('should show "Adicionar Música" button when no music exists', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    expect(screen.getByText('Adicionar Música')).toBeInTheDocument();
  });

  /**
   * Test: Shows "Editar Música" when music exists
   * Requirement: 3.6
   */
  it('should show "Editar Música" button when music exists', () => {
    const cardWithMusic = { ...mockCard, youtubeUrl: 'https://youtube.com/watch?v=abc123' };
    
    render(<CardPreviewCard card={cardWithMusic} {...mockCallbacks} />);
    
    expect(screen.getByText('Editar Música')).toBeInTheDocument();
    expect(screen.queryByText('Adicionar Música')).not.toBeInTheDocument();
  });

  /**
   * Test: Shows photo badge when photo exists
   * Requirement: 2.4
   */
  it('should display photo badge when photo exists', () => {
    const cardWithPhoto = { ...mockCard, imageUrl: 'https://example.com/photo.jpg' };
    
    render(<CardPreviewCard card={cardWithPhoto} {...mockCallbacks} />);
    
    expect(screen.getByText('Foto')).toBeInTheDocument();
  });

  /**
   * Test: Shows music badge when music exists
   * Requirement: 2.5
   */
  it('should display music badge when music exists', () => {
    const cardWithMusic = { ...mockCard, youtubeUrl: 'https://youtube.com/watch?v=abc123' };
    
    render(<CardPreviewCard card={cardWithMusic} {...mockCallbacks} />);
    
    expect(screen.getByText('Música')).toBeInTheDocument();
  });

  /**
   * Test: Does not show badges when no media
   * Requirement: 2.4, 2.5
   */
  it('should not display badges when no media exists', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    expect(screen.queryByText('Foto')).not.toBeInTheDocument();
    expect(screen.queryByText('Música')).not.toBeInTheDocument();
  });

  /**
   * Test: All three action buttons are present
   * Requirement: 3.1
   */
  it('should render all three action buttons', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    expect(screen.getByText('Editar Mensagem')).toBeInTheDocument();
    expect(screen.getByText('Adicionar Foto')).toBeInTheDocument();
    expect(screen.getByText('Adicionar Música')).toBeInTheDocument();
  });

  /**
   * Test: Edit Message button triggers callback
   * Requirement: 3.1
   */
  it('should call onEditMessage when Edit Message button is clicked', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    const button = screen.getByText('Editar Mensagem');
    fireEvent.click(button);
    
    expect(mockCallbacks.onEditMessage).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Photo button triggers callback
   * Requirement: 3.1
   */
  it('should call onEditPhoto when photo button is clicked', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    const button = screen.getByText('Adicionar Foto');
    fireEvent.click(button);
    
    expect(mockCallbacks.onEditPhoto).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Music button triggers callback
   * Requirement: 3.1
   */
  it('should call onEditMusic when music button is clicked', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    const button = screen.getByText('Adicionar Música');
    fireEvent.click(button);
    
    expect(mockCallbacks.onEditMusic).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Shows completion indicator when card is complete
   * Requirement: 2.1
   */
  it('should show completion indicator when card has title and valid message', () => {
    const { container } = render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    // Check for green border (complete state)
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.className).toContain('border-green-200');
  });

  /**
   * Test: Does not show completion indicator when card is incomplete
   * Requirement: 2.1
   */
  it('should not show completion indicator when card is incomplete', () => {
    const incompleteCard = { ...mockCard, title: '', messageText: '' };
    const { container } = render(<CardPreviewCard card={incompleteCard} {...mockCallbacks} />);
    
    // Check for gray border (incomplete state)
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.className).toContain('border-gray-200');
  });

  /**
   * Test: Handles empty title gracefully
   * Requirement: 2.2
   */
  it('should display "Sem título" when title is empty', () => {
    const cardWithoutTitle = { ...mockCard, title: '' };
    
    render(<CardPreviewCard card={cardWithoutTitle} {...mockCallbacks} />);
    
    expect(screen.getByText('Sem título')).toBeInTheDocument();
  });

  /**
   * Test: Handles empty message gracefully
   * Requirement: 2.3
   */
  it('should display placeholder when message is empty', () => {
    const cardWithoutMessage = { ...mockCard, messageText: '' };
    
    render(<CardPreviewCard card={cardWithoutMessage} {...mockCallbacks} />);
    
    expect(screen.getByText('Nenhuma mensagem ainda...')).toBeInTheDocument();
  });

  /**
   * Test: Applies custom className
   */
  it('should apply custom className', () => {
    const { container } = render(
      <CardPreviewCard card={mockCard} {...mockCallbacks} className="custom-class" />
    );
    
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.className).toContain('custom-class');
  });

  /**
   * Test: Has proper ARIA labels for accessibility
   */
  it('should have proper ARIA labels on buttons', () => {
    render(<CardPreviewCard card={mockCard} {...mockCallbacks} />);
    
    expect(screen.getByLabelText(/Editar mensagem da carta/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adicionar Foto da carta/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adicionar Música da carta/)).toBeInTheDocument();
  });
});
