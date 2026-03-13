'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardCollection, UpdateCardInput } from '@/types/card';

/**
 * Upload state for card images
 */
interface CardImageUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Thematic Moment definition
 * Groups cards by emotional themes
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export interface ThematicMoment {
  index: number;
  title: string;
  description: string;
  cardIndices: number[];
}

/**
 * Moment completion status
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */
export interface MomentCompletionStatus {
  totalCards: number;
  completedCards: number;
  percentage: number;
}

/**
 * Thematic moments constant
 * Defines the 3 groups of cards by emotional themes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6
 */
export const THEMATIC_MOMENTS: ThematicMoment[] = [
  {
    index: 0,
    title: 'Momentos Emocionais e de Apoio',
    description: 'Cartas para momentos difíceis e de vulnerabilidade',
    cardIndices: [0, 1, 2, 3], // Cartas 1-4
  },
  {
    index: 1,
    title: 'Momentos de Celebração e Romance',
    description: 'Cartas para celebrar amor e conquistas',
    cardIndices: [4, 5, 6, 7], // Cartas 5-8
  },
  {
    index: 2,
    title: 'Momentos para Resolver Conflitos e Rir',
    description: 'Cartas para superar desafios e relaxar',
    cardIndices: [8, 9, 10, 11], // Cartas 9-12
  },
];

/**
 * Card Collection Editor Context Type
 * Defines the shape of the card collection editor context
 * Requirements: 8.3, 8.4, 8.5
 */
interface CardCollectionEditorContextType {
  // State
  collection: CardCollection | null;
  cards: Card[];
  currentCardIndex: number;
  currentMomentIndex: number;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  imageUploadStates: Record<string, CardImageUploadState>;

  // Computed
  currentCard: Card | null;
  totalCards: number;
  isFirstCard: boolean;
  isLastCard: boolean;
  isFirstMoment: boolean;
  isLastMoment: boolean;

  // Actions
  setCollection: (collection: CardCollection) => void;
  setCards: (cards: Card[]) => void;
  setCurrentCardIndex: (index: number) => void;
  setCurrentMomentIndex: (index: number) => void;
  updateCard: (cardId: string, data: Partial<UpdateCardInput>) => Promise<void>;
  updateCardLocal: (cardId: string, data: Partial<UpdateCardInput>) => void;
  updateCollection: (collectionId: string, data: Partial<CardCollection>) => Promise<void>;
  saveCard: (cardId: string) => Promise<void>;
  saveAllCards: () => Promise<void>;
  nextCard: () => void;
  previousCard: () => void;
  goToCard: (index: number) => void;
  setImageUploadState: (cardId: string, state: Partial<CardImageUploadState>) => void;
  resetImageUploadState: (cardId: string) => void;
  canProceedToCheckout: () => boolean;
  restoreFromLocalStorage: () => boolean;
  clearLocalStorage: () => void;

  // Thematic Moments - Requirements: 1.1, 1.6, 7.1, 7.2
  getCurrentMomentCards: () => Card[];
  getMomentCompletionStatus: (momentIndex: number) => MomentCompletionStatus;
  getAllMomentsCompletionStatus: () => Record<number, MomentCompletionStatus>;
  nextMoment: () => void;
  previousMoment: () => void;
  goToMoment: (index: number) => void;
}

/**
 * Create the Card Collection Editor Context
 */
const CardCollectionEditorContext = createContext<CardCollectionEditorContextType | undefined>(undefined);

/**
 * Card Collection Editor Provider Props
 */
interface CardCollectionEditorProviderProps {
  children: ReactNode;
  collectionId?: string;
  autoSaveEnabled?: boolean;
  autoSaveDebounceMs?: number;
}

/**
 * Local storage key for auto-save
 */
const getLocalStorageKey = (collectionId: string) => `card-collection-editor-${collectionId}`;

/**
 * Card Collection Editor Provider Component
 * Provides card collection editor state and actions to all child components
 * Requirements: 8.3, 8.4, 8.5
 */
export function CardCollectionEditorProvider({
  children,
  collectionId,
  autoSaveEnabled = true,
  autoSaveDebounceMs = 2000,
}: CardCollectionEditorProviderProps) {
  // Core state
  const [collection, setCollection] = useState<CardCollection | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [imageUploadStates, setImageUploadStates] = useState<Record<string, CardImageUploadState>>({});

  // Computed values
  const currentCard = cards[currentCardIndex] || null;
  const totalCards = cards.length;
  const isFirstCard = currentCardIndex === 0;
  const isLastCard = currentCardIndex === totalCards - 1;
  const isFirstMoment = currentMomentIndex === 0;
  const isLastMoment = currentMomentIndex === THEMATIC_MOMENTS.length - 1;

  /**
   * Auto-save to localStorage
   * Requirements: 8.4, 8.5
   */
  useEffect(() => {
    if (!autoSaveEnabled || !collection || cards.length === 0) return;

    const timeoutId = setTimeout(() => {
      try {
        const storageKey = getLocalStorageKey(collection.id);
        const dataToSave = {
          collection,
          cards,
          currentCardIndex,
          currentMomentIndex,
          savedAt: new Date().toISOString(),
        };
        
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save to localStorage failed:', error);
      }
    }, autoSaveDebounceMs);

    return () => clearTimeout(timeoutId);
  }, [collection, cards, currentCardIndex, currentMomentIndex, autoSaveEnabled, autoSaveDebounceMs]);

  /**
   * Restore state from localStorage
   * Requirements: 8.5
   */
  const restoreFromLocalStorage = useCallback((): boolean => {
    if (!collectionId) return false;

    try {
      const storageKey = getLocalStorageKey(collectionId);
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) return false;

      const parsed = JSON.parse(saved);
      
      // Restore collection
      if (parsed.collection) {
        setCollection({
          ...parsed.collection,
          createdAt: new Date(parsed.collection.createdAt),
          updatedAt: new Date(parsed.collection.updatedAt),
        });
      }
      
      // Restore cards
      if (parsed.cards && Array.isArray(parsed.cards)) {
        setCards(parsed.cards.map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
          openedAt: card.openedAt ? new Date(card.openedAt) : null,
        })));
      }
      
      // Restore current card index
      if (typeof parsed.currentCardIndex === 'number') {
        setCurrentCardIndex(parsed.currentCardIndex);
      }

      // Restore current moment index
      if (typeof parsed.currentMomentIndex === 'number') {
        setCurrentMomentIndex(parsed.currentMomentIndex);
      }
      
      // Set last saved time
      if (parsed.savedAt) {
        setLastSaved(new Date(parsed.savedAt));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to restore from localStorage:', error);
      return false;
    }
  }, [collectionId]);

  /**
   * Clear localStorage
   */
  const clearLocalStorage = useCallback(() => {
    if (!collection) return;

    try {
      const storageKey = getLocalStorageKey(collection.id);
      localStorage.removeItem(storageKey);
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, [collection]);

  /**
   * Load initial data from API
   * Fetches collection and cards when component mounts
   */
  useEffect(() => {
    if (!collectionId) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Try to restore from localStorage first
        const restored = restoreFromLocalStorage();
        
        if (!restored) {
          // If no localStorage data, fetch from API
          const response = await fetch(`/api/card-collections/${collectionId}`);
          
          if (!response.ok) {
            throw new Error('Failed to load collection');
          }

          const data = await response.json();
          
          setCollection(data.collection);
          setCards(data.cards || []);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [collectionId, restoreFromLocalStorage]);

  /**
   * Update card locally (optimistic update)
   * Requirements: 8.4
   */
  const updateCardLocal = useCallback((cardId: string, data: Partial<UpdateCardInput>) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId
          ? { ...card, ...data, updatedAt: new Date() }
          : card
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Save a single card to the server
   * Requirements: 3.2, 8.4
   */
  const saveCard = useCallback(async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: card.title,
          messageText: card.messageText,
          imageUrl: card.imageUrl,
          youtubeUrl: card.youtubeUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || errorData.error || 'Failed to save card';
        throw new Error(errorMessage);
      }

      const { card: updatedCard } = await response.json();
      
      // Update the card in state with server response
      setCards(prevCards =>
        prevCards.map(c =>
          c.id === cardId
            ? {
                ...updatedCard,
                createdAt: new Date(updatedCard.createdAt),
                updatedAt: new Date(updatedCard.updatedAt),
                openedAt: updatedCard.openedAt ? new Date(updatedCard.openedAt) : null,
              }
            : c
        )
      );
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save card:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [cards]);

  /**
   * Update card and save to server
   * Requirements: 3.2, 8.4
   */
  const updateCard = useCallback(async (cardId: string, data: Partial<UpdateCardInput>) => {
    // Optimistic update
    updateCardLocal(cardId, data);
    
    // Get current card state
    const card = cards.find(c => c.id === cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    // Merge current card with new data
    const updatedCardData = {
      title: data.title !== undefined ? data.title : card.title,
      messageText: data.messageText !== undefined ? data.messageText : card.messageText,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : card.imageUrl,
      youtubeUrl: data.youtubeUrl !== undefined ? data.youtubeUrl : card.youtubeUrl,
    };

    // Save to server with merged data
    setIsSaving(true);
    try {
      console.log('[Context] updateCard - Saving to server:', {
        cardId,
        data: updatedCardData,
      });

      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCardData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || errorData.error || 'Failed to save card';
        throw new Error(errorMessage);
      }

      const { card: updatedCard } = await response.json();
      
      console.log('[Context] updateCard - Server response:', updatedCard);

      // Update the card in state with server response
      setCards(prevCards =>
        prevCards.map(c =>
          c.id === cardId
            ? {
                ...updatedCard,
                createdAt: new Date(updatedCard.createdAt),
                updatedAt: new Date(updatedCard.updatedAt),
                openedAt: updatedCard.openedAt ? new Date(updatedCard.openedAt) : null,
              }
            : c
        )
      );
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save card:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [cards, updateCardLocal]);

  /**
   * Update collection and save to server
   */
  const updateCollection = useCallback(async (collectionId: string, data: Partial<CardCollection>) => {
    setIsSaving(true);
    try {
      console.log('[Context] updateCollection called with:', {
        collectionId,
        data,
      });

      const response = await fetch(`/api/card-collections/${collectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('[Context] API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || errorData.error || 'Failed to update collection';
        throw new Error(errorMessage);
      }

      const { collection: updatedCollection } = await response.json();
      
      console.log('[Context] Collection updated successfully:', updatedCollection);

      // Update the collection in state with server response
      setCollection({
        ...updatedCollection,
        createdAt: new Date(updatedCollection.createdAt),
        updatedAt: new Date(updatedCollection.updatedAt),
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Save all cards to the server
   * Requirements: 8.4
   */
  const saveAllCards = useCallback(async () => {
    setIsSaving(true);
    try {
      const savePromises = cards.map(card => saveCard(card.id));
      await Promise.all(savePromises);
    } catch (error) {
      console.error('Failed to save all cards:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [cards, saveCard]);

  /**
   * Navigate to next card
   * Requirements: 8.3
   */
  const nextCard = useCallback(() => {
    if (!isLastCard) {
      setCurrentCardIndex(prev => prev + 1);
    }
  }, [isLastCard]);

  /**
   * Navigate to previous card
   * Requirements: 8.3
   */
  const previousCard = useCallback(() => {
    if (!isFirstCard) {
      setCurrentCardIndex(prev => prev - 1);
    }
  }, [isFirstCard]);

  /**
   * Navigate to specific card by index
   * Requirements: 8.3
   */
  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < totalCards) {
      setCurrentCardIndex(index);
    }
  }, [totalCards]);

  /**
   * Set image upload state for a card
   */
  const setImageUploadState = useCallback((cardId: string, state: Partial<CardImageUploadState>) => {
    setImageUploadStates(prev => ({
      ...prev,
      [cardId]: {
        isUploading: prev[cardId]?.isUploading || false,
        progress: prev[cardId]?.progress || 0,
        error: prev[cardId]?.error || null,
        ...state,
      },
    }));
  }, []);

  /**
   * Reset image upload state for a card
   */
  const resetImageUploadState = useCallback((cardId: string) => {
    setImageUploadStates(prev => {
      const newState = { ...prev };
      delete newState[cardId];
      return newState;
    });
  }, []);

  /**
   * Check if all cards are valid and ready for checkout
   * Requirements: 8.7
   */
  const canProceedToCheckout = useCallback((): boolean => {
    if (!collection || cards.length !== 12) {
      return false;
    }

    // Check that all cards have required fields
    return cards.every(card => {
      return (
        card.title.trim().length > 0 &&
        card.messageText.trim().length > 0 &&
        card.messageText.length <= 500
      );
    });
  }, [collection, cards]);

  /**
   * Get cards for the current moment
   * Requirements: 1.1, 1.6
   */
  const getCurrentMomentCards = useCallback((): Card[] => {
    if (currentMomentIndex < 0 || currentMomentIndex >= THEMATIC_MOMENTS.length) {
      return [];
    }

    const moment = THEMATIC_MOMENTS[currentMomentIndex];
    return moment.cardIndices
      .map(index => cards[index])
      .filter((card): card is Card => card !== undefined);
  }, [currentMomentIndex, cards]);

  /**
   * Get completion status for a specific moment
   * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
   */
  const getMomentCompletionStatus = useCallback((momentIndex: number): MomentCompletionStatus => {
    if (momentIndex < 0 || momentIndex >= THEMATIC_MOMENTS.length) {
      return { totalCards: 0, completedCards: 0, percentage: 0 };
    }

    const moment = THEMATIC_MOMENTS[momentIndex];
    const momentCards = moment.cardIndices
      .map(index => cards[index])
      .filter((card): card is Card => card !== undefined);

    const totalCards = momentCards.length;
    const completedCards = momentCards.filter(card => {
      return (
        card.title.trim().length > 0 &&
        card.messageText.trim().length > 0 &&
        card.messageText.length <= 500
      );
    }).length;

    const percentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

    return { totalCards, completedCards, percentage };
  }, [cards]);

  /**
   * Get completion status for all moments
   * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
   */
  const getAllMomentsCompletionStatus = useCallback((): Record<number, MomentCompletionStatus> => {
    const statuses: Record<number, MomentCompletionStatus> = {};
    
    THEMATIC_MOMENTS.forEach(moment => {
      statuses[moment.index] = getMomentCompletionStatus(moment.index);
    });

    return statuses;
  }, [getMomentCompletionStatus]);

  /**
   * Navigate to next moment
   * Requirements: 7.1, 7.2
   */
  const nextMoment = useCallback(() => {
    if (!isLastMoment) {
      setCurrentMomentIndex(prev => prev + 1);
    }
  }, [isLastMoment]);

  /**
   * Navigate to previous moment
   * Requirements: 7.1, 7.2
   */
  const previousMoment = useCallback(() => {
    if (!isFirstMoment) {
      setCurrentMomentIndex(prev => prev - 1);
    }
  }, [isFirstMoment]);

  /**
   * Navigate to specific moment by index
   * Requirements: 7.1, 7.2
   */
  const goToMoment = useCallback((index: number) => {
    if (index >= 0 && index < THEMATIC_MOMENTS.length) {
      setCurrentMomentIndex(index);
    }
  }, []);

  const contextValue: CardCollectionEditorContextType = {
    // State
    collection,
    cards,
    currentCardIndex,
    currentMomentIndex,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    imageUploadStates,

    // Computed
    currentCard,
    totalCards,
    isFirstCard,
    isLastCard,
    isFirstMoment,
    isLastMoment,

    // Actions
    setCollection,
    setCards,
    setCurrentCardIndex,
    setCurrentMomentIndex,
    updateCard,
    updateCardLocal,
    updateCollection,
    saveCard,
    saveAllCards,
    nextCard,
    previousCard,
    goToCard,
    setImageUploadState,
    resetImageUploadState,
    canProceedToCheckout,
    restoreFromLocalStorage,
    clearLocalStorage,

    // Thematic Moments
    getCurrentMomentCards,
    getMomentCompletionStatus,
    getAllMomentsCompletionStatus,
    nextMoment,
    previousMoment,
    goToMoment,
  };

  return (
    <CardCollectionEditorContext.Provider value={contextValue}>
      {children}
    </CardCollectionEditorContext.Provider>
  );
}

/**
 * Custom hook to use the Card Collection Editor Context
 * Throws an error if used outside of CardCollectionEditorProvider
 */
export function useCardCollectionEditor(): CardCollectionEditorContextType {
  const context = useContext(CardCollectionEditorContext);
  
  if (context === undefined) {
    throw new Error('useCardCollectionEditor must be used within a CardCollectionEditorProvider');
  }
  
  return context;
}

/**
 * Hook to get only the card collection editor state (read-only)
 */
export function useCardCollectionEditorState() {
  const {
    collection,
    cards,
    currentCardIndex,
    currentMomentIndex,
    currentCard,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    totalCards,
    isFirstCard,
    isLastCard,
    isFirstMoment,
    isLastMoment,
    imageUploadStates,
  } = useCardCollectionEditor();

  return {
    collection,
    cards,
    currentCardIndex,
    currentMomentIndex,
    currentCard,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    totalCards,
    isFirstCard,
    isLastCard,
    isFirstMoment,
    isLastMoment,
    imageUploadStates,
  };
}

/**
 * Hook to get only card collection editor actions
 */
export function useCardCollectionEditorActions() {
  const {
    setCollection,
    setCards,
    setCurrentCardIndex,
    setCurrentMomentIndex,
    updateCard,
    updateCardLocal,
    updateCollection,
    saveCard,
    saveAllCards,
    nextCard,
    previousCard,
    goToCard,
    setImageUploadState,
    resetImageUploadState,
    canProceedToCheckout,
    restoreFromLocalStorage,
    clearLocalStorage,
    getCurrentMomentCards,
    getMomentCompletionStatus,
    getAllMomentsCompletionStatus,
    nextMoment,
    previousMoment,
    goToMoment,
  } = useCardCollectionEditor();

  return {
    setCollection,
    setCards,
    setCurrentCardIndex,
    setCurrentMomentIndex,
    updateCard,
    updateCardLocal,
    updateCollection,
    saveCard,
    saveAllCards,
    nextCard,
    previousCard,
    goToCard,
    setImageUploadState,
    resetImageUploadState,
    canProceedToCheckout,
    restoreFromLocalStorage,
    clearLocalStorage,
    getCurrentMomentCards,
    getMomentCompletionStatus,
    getAllMomentsCompletionStatus,
    nextMoment,
    previousMoment,
    goToMoment,
  };
}

/**
 * Hook to get current card information
 */
export function useCurrentCard() {
  const {
    currentCard,
    currentCardIndex,
    totalCards,
    isFirstCard,
    isLastCard,
  } = useCardCollectionEditor();

  return {
    card: currentCard,
    index: currentCardIndex,
    totalCards,
    isFirstCard,
    isLastCard,
  };
}

/**
 * Hook to get navigation functions
 */
export function useCardNavigation() {
  const {
    nextCard,
    previousCard,
    goToCard,
    currentCardIndex,
    totalCards,
    isFirstCard,
    isLastCard,
  } = useCardCollectionEditor();

  return {
    nextCard,
    previousCard,
    goToCard,
    currentCardIndex,
    totalCards,
    isFirstCard,
    isLastCard,
  };
}

/**
 * Hook to get thematic moments navigation and helpers
 * Requirements: 1.1, 1.6, 7.1, 7.2, 9.1, 9.2, 9.3, 9.4, 9.5
 */
export function useThematicMoments() {
  const {
    currentMomentIndex,
    isFirstMoment,
    isLastMoment,
    getCurrentMomentCards,
    getMomentCompletionStatus,
    getAllMomentsCompletionStatus,
    nextMoment,
    previousMoment,
    goToMoment,
  } = useCardCollectionEditor();

  return {
    currentMomentIndex,
    isFirstMoment,
    isLastMoment,
    moments: THEMATIC_MOMENTS,
    getCurrentMomentCards,
    getMomentCompletionStatus,
    getAllMomentsCompletionStatus,
    nextMoment,
    previousMoment,
    goToMoment,
  };
}
