import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CardCollectionEditorProvider,
  useCardCollectionEditor,
  useCardCollectionEditorState,
  useCardCollectionEditorActions,
  useCurrentCard,
  useCardNavigation,
  useThematicMoments,
  THEMATIC_MOMENTS,
} from '../CardCollectionEditorContext';
import { Card, CardCollection } from '@/types/card';

// Mock fetch
global.fetch = vi.fn();

const mockCollection: CardCollection = {
  id: 'test-collection-id',
  recipientName: 'John Doe',
  senderName: 'Jane Smith',
  slug: null,
  qrCodeUrl: null,
  status: 'pending',
  stripeSessionId: null,
  contactEmail: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCards: Card[] = Array.from({ length: 12 }, (_, i) => ({
  id: `card-${i + 1}`,
  collectionId: 'test-collection-id',
  order: i + 1,
  title: `Card ${i + 1} Title`,
  messageText: `Card ${i + 1} message text`,
  imageUrl: null,
  youtubeUrl: null,
  status: 'unopened' as const,
  openedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

describe('CardCollectionEditorContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CardCollectionEditorProvider collectionId="test-collection-id" autoSaveEnabled={false}>
      {children}
    </CardCollectionEditorProvider>
  );

  describe('useCardCollectionEditor', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useCardCollectionEditor());
      }).toThrow('useCardCollectionEditor must be used within a CardCollectionEditorProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide initial state', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      expect(result.current.collection).toBeNull();
      expect(result.current.cards).toEqual([]);
      expect(result.current.currentCardIndex).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.currentCard).toBeNull();
      expect(result.current.totalCards).toBe(0);
    });

    it('should set collection and cards', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCollection(mockCollection);
        result.current.setCards(mockCards);
      });

      expect(result.current.collection).toEqual(mockCollection);
      expect(result.current.cards).toEqual(mockCards);
      expect(result.current.totalCards).toBe(12);
      expect(result.current.currentCard).toEqual(mockCards[0]);
    });
  });

  describe('Navigation', () => {
    it('should navigate to next card', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      expect(result.current.currentCardIndex).toBe(0);
      expect(result.current.isFirstCard).toBe(true);
      expect(result.current.isLastCard).toBe(false);

      act(() => {
        result.current.nextCard();
      });

      expect(result.current.currentCardIndex).toBe(1);
      expect(result.current.currentCard).toEqual(mockCards[1]);
      expect(result.current.isFirstCard).toBe(false);
    });

    it('should navigate to previous card', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
        result.current.setCurrentCardIndex(5);
      });

      expect(result.current.currentCardIndex).toBe(5);

      act(() => {
        result.current.previousCard();
      });

      expect(result.current.currentCardIndex).toBe(4);
      expect(result.current.currentCard).toEqual(mockCards[4]);
    });

    it('should not navigate beyond first card', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      expect(result.current.currentCardIndex).toBe(0);

      act(() => {
        result.current.previousCard();
      });

      expect(result.current.currentCardIndex).toBe(0);
    });

    it('should not navigate beyond last card', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
        result.current.setCurrentCardIndex(11);
      });

      expect(result.current.currentCardIndex).toBe(11);
      expect(result.current.isLastCard).toBe(true);

      act(() => {
        result.current.nextCard();
      });

      expect(result.current.currentCardIndex).toBe(11);
    });

    it('should go to specific card by index', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      act(() => {
        result.current.goToCard(7);
      });

      expect(result.current.currentCardIndex).toBe(7);
      expect(result.current.currentCard).toEqual(mockCards[7]);
    });

    it('should not go to invalid card index', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
        result.current.setCurrentCardIndex(5);
      });

      act(() => {
        result.current.goToCard(20);
      });

      expect(result.current.currentCardIndex).toBe(5);

      act(() => {
        result.current.goToCard(-1);
      });

      expect(result.current.currentCardIndex).toBe(5);
    });
  });

  describe('Local Updates', () => {
    it('should update card locally', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      const cardId = mockCards[0].id;
      const newTitle = 'Updated Title';

      act(() => {
        result.current.updateCardLocal(cardId, { title: newTitle });
      });

      expect(result.current.cards[0].title).toBe(newTitle);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should update multiple fields locally', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      const cardId = mockCards[0].id;

      act(() => {
        result.current.updateCardLocal(cardId, {
          title: 'New Title',
          messageText: 'New message',
          imageUrl: 'https://example.com/image.jpg',
        });
      });

      expect(result.current.cards[0].title).toBe('New Title');
      expect(result.current.cards[0].messageText).toBe('New message');
      expect(result.current.cards[0].imageUrl).toBe('https://example.com/image.jpg');
    });
  });

  describe('Server Sync', () => {
    it('should save card to server', async () => {
      const mockResponse = {
        card: {
          ...mockCards[0],
          title: 'Updated Title',
          updatedAt: new Date().toISOString(),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      await act(async () => {
        await result.current.saveCard(mockCards[0].id);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/cards/${mockCards[0].id}`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle save error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Save failed' }),
      });

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      await expect(
        act(async () => {
          await result.current.saveCard(mockCards[0].id);
        })
      ).rejects.toThrow('Save failed');
    });
  });

  describe('Validation', () => {
    it('should validate checkout readiness - valid', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCollection(mockCollection);
        result.current.setCards(mockCards);
      });

      expect(result.current.canProceedToCheckout()).toBe(true);
    });

    it('should validate checkout readiness - missing collection', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      expect(result.current.canProceedToCheckout()).toBe(false);
    });

    it('should validate checkout readiness - incomplete cards', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      const incompleteCards = mockCards.slice(0, 10);

      act(() => {
        result.current.setCollection(mockCollection);
        result.current.setCards(incompleteCards);
      });

      expect(result.current.canProceedToCheckout()).toBe(false);
    });

    it('should validate checkout readiness - empty title', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      const invalidCards = [...mockCards];
      invalidCards[0] = { ...invalidCards[0], title: '' };

      act(() => {
        result.current.setCollection(mockCollection);
        result.current.setCards(invalidCards);
      });

      expect(result.current.canProceedToCheckout()).toBe(false);
    });

    it('should validate checkout readiness - message too long', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      const invalidCards = [...mockCards];
      invalidCards[0] = { ...invalidCards[0], messageText: 'a'.repeat(501) };

      act(() => {
        result.current.setCollection(mockCollection);
        result.current.setCards(invalidCards);
      });

      expect(result.current.canProceedToCheckout()).toBe(false);
    });
  });

  describe('Specialized Hooks', () => {
    it('useCardCollectionEditorState should provide read-only state', () => {
      const { result } = renderHook(() => useCardCollectionEditorState(), { wrapper });

      expect(result.current).toHaveProperty('collection');
      expect(result.current).toHaveProperty('cards');
      expect(result.current).toHaveProperty('currentCard');
      expect(result.current).toHaveProperty('isSaving');
      expect(result.current).not.toHaveProperty('updateCard');
    });

    it('useCardCollectionEditorActions should provide actions only', () => {
      const { result } = renderHook(() => useCardCollectionEditorActions(), { wrapper });

      expect(result.current).toHaveProperty('updateCard');
      expect(result.current).toHaveProperty('saveCard');
      expect(result.current).toHaveProperty('nextCard');
      expect(result.current).not.toHaveProperty('collection');
      expect(result.current).not.toHaveProperty('cards');
    });

    it('useCurrentCard should provide current card info', () => {
      const { result } = renderHook(
        () => {
          const editor = useCardCollectionEditor();
          const currentCard = useCurrentCard();
          return { editor, currentCard };
        },
        { wrapper }
      );

      act(() => {
        result.current.editor.setCards(mockCards);
      });

      expect(result.current.currentCard.card).toEqual(mockCards[0]);
      expect(result.current.currentCard.index).toBe(0);
      expect(result.current.currentCard.totalCards).toBe(12);
    });

    it('useCardNavigation should provide navigation functions', () => {
      const { result } = renderHook(() => useCardNavigation(), { wrapper });

      expect(result.current).toHaveProperty('nextCard');
      expect(result.current).toHaveProperty('previousCard');
      expect(result.current).toHaveProperty('goToCard');
      expect(result.current).toHaveProperty('currentCardIndex');
    });
  });

  describe('Image Upload State', () => {
    it('should set image upload state', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      const cardId = 'card-1';

      act(() => {
        result.current.setImageUploadState(cardId, {
          isUploading: true,
          progress: 50,
        });
      });

      expect(result.current.imageUploadStates[cardId]).toEqual({
        isUploading: true,
        progress: 50,
        error: null,
      });
    });

    it('should update image upload state', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      const cardId = 'card-1';

      act(() => {
        result.current.setImageUploadState(cardId, {
          isUploading: true,
          progress: 0,
        });
      });

      act(() => {
        result.current.setImageUploadState(cardId, {
          progress: 100,
        });
      });

      expect(result.current.imageUploadStates[cardId]).toEqual({
        isUploading: true,
        progress: 100,
        error: null,
      });
    });

    it('should reset image upload state', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      const cardId = 'card-1';

      act(() => {
        result.current.setImageUploadState(cardId, {
          isUploading: true,
          progress: 50,
        });
      });

      expect(result.current.imageUploadStates[cardId]).toBeDefined();

      act(() => {
        result.current.resetImageUploadState(cardId);
      });

      expect(result.current.imageUploadStates[cardId]).toBeUndefined();
    });
  });

  describe('LocalStorage', () => {
    it('should save to localStorage when auto-save is enabled', async () => {
      const { result } = renderHook(
        () => useCardCollectionEditor(),
        {
          wrapper: ({ children }) => (
            <CardCollectionEditorProvider
              collectionId="test-collection-id"
              autoSaveEnabled={true}
              autoSaveDebounceMs={100}
            >
              {children}
            </CardCollectionEditorProvider>
          ),
        }
      );

      act(() => {
        result.current.setCollection(mockCollection);
        result.current.setCards(mockCards);
      });

      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      const saved = localStorage.getItem('card-collection-editor-test-collection-id');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.collection.id).toBe(mockCollection.id);
      expect(parsed.cards).toHaveLength(12);
    });

    it('should restore from localStorage', () => {
      const savedData = {
        collection: mockCollection,
        cards: mockCards,
        currentCardIndex: 5,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        'card-collection-editor-test-collection-id',
        JSON.stringify(savedData)
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        const restored = result.current.restoreFromLocalStorage();
        expect(restored).toBe(true);
      });

      expect(result.current.collection?.id).toBe(mockCollection.id);
      expect(result.current.cards).toHaveLength(12);
      expect(result.current.currentCardIndex).toBe(5);
    });

    it('should clear localStorage', () => {
      localStorage.setItem(
        'card-collection-editor-test-collection-id',
        JSON.stringify({ test: 'data' })
      );

      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCollection(mockCollection);
      });

      act(() => {
        result.current.clearLocalStorage();
      });

      const saved = localStorage.getItem('card-collection-editor-test-collection-id');
      expect(saved).toBeNull();
    });

    it('should save and restore currentMomentIndex', async () => {
      const { result } = renderHook(
        () => useCardCollectionEditor(),
        {
          wrapper: ({ children }) => (
            <CardCollectionEditorProvider
              collectionId="test-collection-id"
              autoSaveEnabled={true}
              autoSaveDebounceMs={100}
            >
              {children}
            </CardCollectionEditorProvider>
          ),
        }
      );

      act(() => {
        result.current.setCollection(mockCollection);
        result.current.setCards(mockCards);
        result.current.setCurrentMomentIndex(2);
      });

      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      const saved = localStorage.getItem('card-collection-editor-test-collection-id');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.currentMomentIndex).toBe(2);

      // Clear and restore
      act(() => {
        result.current.setCurrentMomentIndex(0);
      });

      act(() => {
        const restored = result.current.restoreFromLocalStorage();
        expect(restored).toBe(true);
      });

      expect(result.current.currentMomentIndex).toBe(2);
    });
  });

  describe('Thematic Moments', () => {
    it('should have correct THEMATIC_MOMENTS constant', () => {
      expect(THEMATIC_MOMENTS).toHaveLength(3);
      expect(THEMATIC_MOMENTS[0].title).toBe('Momentos Emocionais e de Apoio');
      expect(THEMATIC_MOMENTS[1].title).toBe('Momentos de Celebração e Romance');
      expect(THEMATIC_MOMENTS[2].title).toBe('Momentos para Resolver Conflitos e Rir');
      expect(THEMATIC_MOMENTS[0].cardIndices).toEqual([0, 1, 2, 3]);
      expect(THEMATIC_MOMENTS[1].cardIndices).toEqual([4, 5, 6, 7]);
      expect(THEMATIC_MOMENTS[2].cardIndices).toEqual([8, 9, 10, 11]);
    });

    it('should initialize with first moment', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      expect(result.current.currentMomentIndex).toBe(0);
      expect(result.current.isFirstMoment).toBe(true);
      expect(result.current.isLastMoment).toBe(false);
    });

    it('should get current moment cards', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      const momentCards = result.current.getCurrentMomentCards();
      expect(momentCards).toHaveLength(4);
      expect(momentCards[0]).toEqual(mockCards[0]);
      expect(momentCards[3]).toEqual(mockCards[3]);
    });

    it('should navigate to next moment', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      expect(result.current.currentMomentIndex).toBe(0);

      act(() => {
        result.current.nextMoment();
      });

      expect(result.current.currentMomentIndex).toBe(1);
      expect(result.current.isFirstMoment).toBe(false);
      expect(result.current.isLastMoment).toBe(false);

      const momentCards = result.current.getCurrentMomentCards();
      expect(momentCards).toHaveLength(4);
      expect(momentCards[0]).toEqual(mockCards[4]);
      expect(momentCards[3]).toEqual(mockCards[7]);
    });

    it('should navigate to previous moment', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
        result.current.setCurrentMomentIndex(2);
      });

      expect(result.current.currentMomentIndex).toBe(2);
      expect(result.current.isLastMoment).toBe(true);

      act(() => {
        result.current.previousMoment();
      });

      expect(result.current.currentMomentIndex).toBe(1);
      expect(result.current.isFirstMoment).toBe(false);
      expect(result.current.isLastMoment).toBe(false);
    });

    it('should not navigate beyond first moment', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      expect(result.current.currentMomentIndex).toBe(0);

      act(() => {
        result.current.previousMoment();
      });

      expect(result.current.currentMomentIndex).toBe(0);
    });

    it('should not navigate beyond last moment', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
        result.current.setCurrentMomentIndex(2);
      });

      expect(result.current.currentMomentIndex).toBe(2);
      expect(result.current.isLastMoment).toBe(true);

      act(() => {
        result.current.nextMoment();
      });

      expect(result.current.currentMomentIndex).toBe(2);
    });

    it('should go to specific moment by index', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      act(() => {
        result.current.goToMoment(2);
      });

      expect(result.current.currentMomentIndex).toBe(2);
      expect(result.current.isLastMoment).toBe(true);

      const momentCards = result.current.getCurrentMomentCards();
      expect(momentCards).toHaveLength(4);
      expect(momentCards[0]).toEqual(mockCards[8]);
      expect(momentCards[3]).toEqual(mockCards[11]);
    });

    it('should not go to invalid moment index', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
        result.current.setCurrentMomentIndex(1);
      });

      act(() => {
        result.current.goToMoment(5);
      });

      expect(result.current.currentMomentIndex).toBe(1);

      act(() => {
        result.current.goToMoment(-1);
      });

      expect(result.current.currentMomentIndex).toBe(1);
    });

    it('should calculate moment completion status', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      act(() => {
        result.current.setCards(mockCards);
      });

      const status = result.current.getMomentCompletionStatus(0);
      expect(status.totalCards).toBe(4);
      expect(status.completedCards).toBe(4);
      expect(status.percentage).toBe(100);
    });

    it('should calculate moment completion status with incomplete cards', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      const incompleteCards = [...mockCards];
      incompleteCards[0] = { ...incompleteCards[0], title: '' };
      incompleteCards[1] = { ...incompleteCards[1], messageText: '' };

      act(() => {
        result.current.setCards(incompleteCards);
      });

      const status = result.current.getMomentCompletionStatus(0);
      expect(status.totalCards).toBe(4);
      expect(status.completedCards).toBe(2);
      expect(status.percentage).toBe(50);
    });

    it('should get all moments completion status', () => {
      const { result } = renderHook(() => useCardCollectionEditor(), { wrapper });

      const incompleteCards = [...mockCards];
      incompleteCards[0] = { ...incompleteCards[0], title: '' };
      incompleteCards[5] = { ...incompleteCards[5], messageText: '' };
      incompleteCards[10] = { ...incompleteCards[10], title: '' };

      act(() => {
        result.current.setCards(incompleteCards);
      });

      const allStatuses = result.current.getAllMomentsCompletionStatus();
      expect(allStatuses[0].completedCards).toBe(3);
      expect(allStatuses[1].completedCards).toBe(3);
      expect(allStatuses[2].completedCards).toBe(3);
    });

    it('useThematicMoments hook should provide moment navigation', () => {
      const { result } = renderHook(() => useThematicMoments(), { wrapper });

      expect(result.current.moments).toEqual(THEMATIC_MOMENTS);
      expect(result.current.currentMomentIndex).toBe(0);
      expect(result.current.isFirstMoment).toBe(true);
      expect(result.current.isLastMoment).toBe(false);
      expect(result.current).toHaveProperty('nextMoment');
      expect(result.current).toHaveProperty('previousMoment');
      expect(result.current).toHaveProperty('goToMoment');
      expect(result.current).toHaveProperty('getCurrentMomentCards');
      expect(result.current).toHaveProperty('getMomentCompletionStatus');
      expect(result.current).toHaveProperty('getAllMomentsCompletionStatus');
    });
  });
});
