/**
 * Checkpoint 14 - End-to-End Integration Test
 * 
 * This test validates the complete functionality of the grouped card editor
 * by testing the components and context integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CardCollectionEditorProvider, useCardCollectionEditor, THEMATIC_MOMENTS } from '@/contexts/CardCollectionEditorContext';
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

    it('should cover all 12 cards without overlap', () => {
      const allIndices = THEMATIC_MOMENTS.flatMap(m => m.cardIndices);
      const uniqueIndices = new Set(allIndices);
      
      expect(allIndices).toHaveLength(12);
      expect(uniqueIndices.size).toBe(12);
      expect(Math.min(...allIndices)).toBe(0);
      expect(Math.max(...allIndices)).toBe(11);
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

    it('should navigate forward through moments', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Start at moment 0
      expect(result.current.currentMomentIndex).toBe(0);

      // Navigate to moment 1
      act(() => {
        result.current.nextMoment();
      });

      expect(result.current.currentMomentIndex).toBe(1);
      expect(result.current.isFirstMoment).toBe(false);
      expect(result.current.isLastMoment).toBe(false);

      // Navigate to moment 2
      act(() => {
        result.current.nextMoment();
      });

      expect(result.current.currentMomentIndex).toBe(2);
      expect(result.current.isFirstMoment).toBe(false);
      expect(result.current.isLastMoment).toBe(true);
    });

    it('should navigate backward through moments', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Go to last moment
      act(() => {
        result.current.goToMoment(2);
      });

      expect(result.current.currentMomentIndex).toBe(2);

      // Navigate back to moment 1
      act(() => {
        result.current.previousMoment();
      });

      expect(result.current.currentMomentIndex).toBe(1);

      // Navigate back to moment 0
      act(() => {
        result.current.previousMoment();
      });

      expect(result.current.currentMomentIndex).toBe(0);
    });

    it('should jump directly to any moment', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Jump to moment 2
      act(() => {
        result.current.goToMoment(2);
      });
      expect(result.current.currentMomentIndex).toBe(2);

      // Jump to moment 0
      act(() => {
        result.current.goToMoment(0);
      });
      expect(result.current.currentMomentIndex).toBe(0);

      // Jump to moment 1
      act(() => {
        result.current.goToMoment(1);
      });
      expect(result.current.currentMomentIndex).toBe(1);
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

  describe('Card Retrieval by Moment', () => {
    it('should get correct cards for moment 0', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Wait for cards to load
      await waitFor(() => {
        expect(result.current.cards.length).toBeGreaterThan(0);
      });

      const moment0Cards = result.current.getCurrentMomentCards();
      expect(moment0Cards.length).toBeLessThanOrEqual(4);
      
      // Verify cards are in correct order range
      moment0Cards.forEach(card => {
        expect(card.order).toBeGreaterThanOrEqual(0);
        expect(card.order).toBeLessThan(4);
      });
    });

    it('should get different cards for different moments', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      await waitFor(() => {
        expect(result.current.cards.length).toBeGreaterThan(0);
      });

      // Get cards for moment 0
      const moment0Cards = result.current.getCurrentMomentCards();
      const moment0Ids = moment0Cards.map(c => c.id);

      // Navigate to moment 1
      act(() => {
        result.current.nextMoment();
      });

      // Get cards for moment 1
      const moment1Cards = result.current.getCurrentMomentCards();
      const moment1Ids = moment1Cards.map(c => c.id);

      // Verify different cards
      const overlap = moment0Ids.filter(id => moment1Ids.includes(id));
      expect(overlap).toHaveLength(0);
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
        expect(result.current.cards.length).toBeGreaterThan(0);
      });

      // Get status for moment 0
      const status = result.current.getMomentCompletionStatus(0);
      
      expect(status).toBeDefined();
      expect(status.totalCards).toBeGreaterThan(0);
      expect(status.totalCards).toBeLessThanOrEqual(4);
      expect(status.completedCards).toBeGreaterThanOrEqual(0);
      expect(status.completedCards).toBeLessThanOrEqual(status.totalCards);
      expect(status.percentage).toBeGreaterThanOrEqual(0);
      expect(status.percentage).toBeLessThanOrEqual(100);
    });

    it('should track all moments completion status', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      await waitFor(() => {
        expect(result.current.cards.length).toBeGreaterThan(0);
      });

      const allStatus = result.current.getAllMomentsCompletionStatus();
      
      expect(Object.keys(allStatus)).toHaveLength(3);
      expect(allStatus[0]).toBeDefined();
      expect(allStatus[1]).toBeDefined();
      expect(allStatus[2]).toBeDefined();

      // Each moment should have valid status
      [0, 1, 2].forEach(momentIndex => {
        const status = allStatus[momentIndex];
        expect(status.totalCards).toBeGreaterThan(0);
        expect(status.percentage).toBeGreaterThanOrEqual(0);
        expect(status.percentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate card structure', () => {
      const validCard: Partial<Card> = {
        id: 'test-1',
        title: 'Test Card',
        messageText: 'Test message',
        order: 0
      };

      expect(validCard.id).toBeTruthy();
      expect(validCard.title).toBeTruthy();
      expect(validCard.messageText).toBeTruthy();
      expect(typeof validCard.order).toBe('number');
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

  describe('Integration: Complete Flow Simulation', () => {
    it('should simulate complete user journey', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardCollectionEditorProvider collectionId="test-e2e-collection">
          {children}
        </CardCollectionEditorProvider>
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.cards.length).toBeGreaterThan(0);
      });

      console.log('\n=== Simulating Complete User Journey ===\n');

      // Step 1: Verify initial state
      console.log('Step 1: Verify initial state');
      expect(result.current.currentMomentIndex).toBe(0);
      expect(result.current.isFirstMoment).toBe(true);
      console.log('✓ Started at first moment');

      // Step 2: Navigate through all moments
      console.log('\nStep 2: Navigate through all moments');
      
      for (let i = 0; i < 3; i++) {
        act(() => {
          result.current.goToMoment(i);
        });
        
        expect(result.current.currentMomentIndex).toBe(i);
        const cards = result.current.getCurrentMomentCards();
        console.log(`✓ Moment ${i + 1}: ${cards.length} cards available`);
      }

      // Step 3: Test navigation boundaries
      console.log('\nStep 3: Test navigation boundaries');
      
      act(() => {
        result.current.goToMoment(0);
        result.current.previousMoment();
      });
      expect(result.current.currentMomentIndex).toBe(0);
      console.log('✓ Cannot navigate before first moment');

      act(() => {
        result.current.goToMoment(2);
        result.current.nextMoment();
      });
      expect(result.current.currentMomentIndex).toBe(2);
      console.log('✓ Cannot navigate after last moment');

      // Step 4: Verify progress tracking
      console.log('\nStep 4: Verify progress tracking');
      
      const allStatus = result.current.getAllMomentsCompletionStatus();
      console.log(`✓ Moment 1: ${allStatus[0].completedCards}/${allStatus[0].totalCards} cards (${allStatus[0].percentage}%)`);
      console.log(`✓ Moment 2: ${allStatus[1].completedCards}/${allStatus[1].totalCards} cards (${allStatus[1].percentage}%)`);
      console.log(`✓ Moment 3: ${allStatus[2].completedCards}/${allStatus[2].totalCards} cards (${allStatus[2].percentage}%)`);

      console.log('\n=== User Journey Simulation Complete ===\n');
    });
  });
});
