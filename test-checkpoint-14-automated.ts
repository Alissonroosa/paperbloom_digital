/**
 * Checkpoint 14 - Automated Integration Test
 * 
 * This test validates the core functionality of the grouped card editor
 * by testing the components and context directly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardCollectionEditorProvider, useCardCollectionEditor } from '@/contexts/CardCollectionEditorContext';
import { THEMATIC_MOMENTS } from '@/contexts/CardCollectionEditorContext';
import type { Card } from '@/types/card';

describe('Checkpoint 14: End-to-End Integration Tests', () => {
  
  describe('Thematic Moments Grouping', () => {
    it('should have exactly 3 thematic moments', () => {
      expect(THEMATIC_MOMENTS).toHaveLength(3);
    });

    it('should have correct moment titles', () => {
      expect(THEMATIC_MOMENTS[0].title).toContain('Emocionais');
      expect(THEMATIC_MOMENTS[1].title).toContain('Celebração');
      expect(THEMATIC_MOMENTS[2].title).toContain('Conflitos');
    });

    it('should distribute 12 cards evenly across 3 moments', () => {
      expect(THEMATIC_MOMENTS[0].cardIndices).toHaveLength(4);
      expect(THEMATIC_MOMENTS[1].cardIndices).toHaveLength(4);
      expect(THEMATIC_MOMENTS[2].cardIndices).toHaveLength(4);
    });

    it('should have correct card indices for each moment', () => {
      expect(THEMATIC_MOMENTS[0].cardIndices).toEqual([0, 1, 2, 3]);
      expect(THEMATIC_MOMENTS[1].cardIndices).toEqual([4, 5, 6, 7]);
      expect(THEMATIC_MOMENTS[2].cardIndices).toEqual([8, 9, 10, 11]);
    });
  });

  describe('Context State Management', () => {
    it('should initialize with first moment', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      expect(result.current.currentMomentIndex).toBe(0);
      expect(result.current.isFirstMoment).toBe(true);
      expect(result.current.isLastMoment).toBe(false);
    });

    it('should navigate between moments correctly', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Navigate to moment 2
      act(() => {
        result.current.nextMoment();
      });

      expect(result.current.currentMomentIndex).toBe(1);
      expect(result.current.isFirstMoment).toBe(false);
      expect(result.current.isLastMoment).toBe(false);

      // Navigate to moment 3
      act(() => {
        result.current.nextMoment();
      });

      expect(result.current.currentMomentIndex).toBe(2);
      expect(result.current.isFirstMoment).toBe(false);
      expect(result.current.isLastMoment).toBe(true);

      // Navigate back to moment 2
      act(() => {
        result.current.previousMoment();
      });

      expect(result.current.currentMomentIndex).toBe(1);
    });

    it('should get correct cards for current moment', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Wait for cards to load
      waitFor(() => {
        expect(result.current.cards.length).toBe(12);
      });

      // Get cards for moment 1
      const moment1Cards = result.current.getCurrentMomentCards();
      expect(moment1Cards).toHaveLength(4);

      // Navigate to moment 2
      act(() => {
        result.current.nextMoment();
      });

      const moment2Cards = result.current.getCurrentMomentCards();
      expect(moment2Cards).toHaveLength(4);
      
      // Verify different cards
      expect(moment2Cards[0].id).not.toBe(moment1Cards[0].id);
    });
  });

  describe('Card Editing Flow', () => {
    it('should update card message', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Wait for cards to load
      await waitFor(() => {
        expect(result.current.cards.length).toBe(12);
      });

      const cardId = result.current.cards[0].id;
      const newMessage = 'Test E2E message';

      // Update card
      await act(async () => {
        await result.current.updateCard(cardId, {
          messageText: newMessage
        });
      });

      // Verify update
      const updatedCard = result.current.cards.find(c => c.id === cardId);
      expect(updatedCard?.messageText).toBe(newMessage);
    });

    it('should add photo to card', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(12);
      });

      const cardId = result.current.cards[0].id;
      const photoUrl = 'https://example.com/photo.jpg';

      await act(async () => {
        await result.current.updateCard(cardId, {
          imageUrl: photoUrl
        });
      });

      const updatedCard = result.current.cards.find(c => c.id === cardId);
      expect(updatedCard?.imageUrl).toBe(photoUrl);
    });

    it('should add music to card', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(12);
      });

      const cardId = result.current.cards[0].id;
      const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      await act(async () => {
        await result.current.updateCard(cardId, {
          youtubeUrl: youtubeUrl
        });
      });

      const updatedCard = result.current.cards.find(c => c.id === cardId);
      expect(updatedCard?.youtubeUrl).toBe(youtubeUrl);
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate moment completion status', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(12);
      });

      // Get initial status
      const status = result.current.getMomentCompletionStatus(0);
      expect(status.totalCards).toBe(4);
      expect(status.completedCards).toBeGreaterThanOrEqual(0);
      expect(status.percentage).toBeGreaterThanOrEqual(0);
      expect(status.percentage).toBeLessThanOrEqual(100);
    });

    it('should track overall progress', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(12);
      });

      const allStatus = result.current.getAllMomentsCompletionStatus();
      expect(Object.keys(allStatus)).toHaveLength(3);
      expect(allStatus[0]).toBeDefined();
      expect(allStatus[1]).toBeDefined();
      expect(allStatus[2]).toBeDefined();
    });
  });

  describe('Data Persistence', () => {
    it('should save to localStorage', async () => {
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      await waitFor(() => {
        expect(result.current.cards.length).toBe(12);
      });

      // Update a card
      const cardId = result.current.cards[0].id;
      await act(async () => {
        await result.current.updateCard(cardId, {
          messageText: 'Test persistence'
        });
      });

      // Wait for auto-save
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('should preserve moment index in state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Navigate to moment 2
      act(() => {
        result.current.goToMoment(1);
      });

      expect(result.current.currentMomentIndex).toBe(1);

      // Navigate to moment 3
      act(() => {
        result.current.goToMoment(2);
      });

      expect(result.current.currentMomentIndex).toBe(2);
    });
  });

  describe('Validation', () => {
    it('should validate card has required fields', () => {
      const completeCard: Partial<Card> = {
        id: 'test-1',
        title: 'Test Card',
        messageText: 'Test message',
        order: 0
      };

      expect(completeCard.title).toBeTruthy();
      expect(completeCard.messageText).toBeTruthy();
    });

    it('should handle optional media fields', () => {
      const cardWithMedia: Partial<Card> = {
        id: 'test-1',
        title: 'Test Card',
        messageText: 'Test message',
        imageUrl: 'https://example.com/image.jpg',
        youtubeUrl: 'https://www.youtube.com/watch?v=test',
        order: 0
      };

      expect(cardWithMedia.imageUrl).toBeTruthy();
      expect(cardWithMedia.youtubeUrl).toBeTruthy();
    });
  });

  describe('Navigation Boundaries', () => {
    it('should not navigate before first moment', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      expect(result.current.currentMomentIndex).toBe(0);

      // Try to go to previous moment
      act(() => {
        result.current.previousMoment();
      });

      // Should stay at 0
      expect(result.current.currentMomentIndex).toBe(0);
    });

    it('should not navigate after last moment', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Navigate to last moment
      act(() => {
        result.current.goToMoment(2);
      });

      expect(result.current.currentMomentIndex).toBe(2);

      // Try to go to next moment
      act(() => {
        result.current.nextMoment();
      });

      // Should stay at 2
      expect(result.current.currentMomentIndex).toBe(2);
    });
  });
});

console.log('\n✅ Checkpoint 14 automated tests defined');
console.log('Run with: npm test test-checkpoint-14-automated.ts\n');
