"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface GenderRevealData {
  // Step 1: Baby info
  boyName: string;
  girlName: string;
  actualGender: 'menino' | 'menina' | null;
  
  // Step 2: Parents info
  dadName: string;
  momName: string;
  storyMessage: string;
  
  // Step 3: Photos
  photos: string[];
  
  // Step 4: Contact info
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Colors (optional)
  boyColor: string;
  girlColor: string;
}

interface GenderRevealEditorContextType {
  data: GenderRevealData;
  currentStep: number;
  revealId: string | null;
  isLoading: boolean;
  error: string | null;
  
  updateData: (updates: Partial<GenderRevealData>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveToServer: () => Promise<string | null>;
  goToCheckout: () => Promise<void>;
  reset: () => void;
}

const defaultData: GenderRevealData = {
  boyName: '',
  girlName: '',
  actualGender: null,
  dadName: '',
  momName: '',
  storyMessage: '',
  photos: [],
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  boyColor: '#5B9BD5',
  girlColor: '#E6A0B8',
};

const GenderRevealEditorContext = createContext<GenderRevealEditorContextType | null>(null);

const STORAGE_KEY = 'gender-reveal-editor-data';

export function GenderRevealEditorProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<GenderRevealData>(defaultData);
  const [currentStep, setCurrentStep] = useState(1);
  const [revealId, setRevealId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from session storage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed.data || defaultData);
        setCurrentStep(parsed.currentStep || 1);
        setRevealId(parsed.revealId || null);
      }
    } catch (e) {
      console.error('Error loading saved data:', e);
    }
  }, []);

  // Save to session storage on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        data,
        currentStep,
        revealId,
      }));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  }, [data, currentStep, revealId]);

  const updateData = useCallback((updates: Partial<GenderRevealData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const saveToServer = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (revealId) {
        // Update existing
        const response = await fetch(`/api/gender-reveal/${revealId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar');
        }

        return revealId;
      } else {
        // Create new
        const response = await fetch('/api/gender-reveal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar');
        }

        const result = await response.json();
        setRevealId(result.reveal.id);
        return result.reveal.id;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [data, revealId]);

  const goToCheckout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First save to server
      let id = revealId;
      if (!id) {
        id = await saveToServer();
        if (!id) {
          throw new Error('Erro ao salvar dados');
        }
      }

      // Create checkout session
      const response = await fetch('/api/checkout/gender-reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revealId: id,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar checkout');
      }

      const result = await response.json();
      
      // Redirect to Mercado Pago
      window.location.href = result.url;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(message);
      setIsLoading(false);
    }
  }, [data, revealId, saveToServer]);

  const reset = useCallback(() => {
    setData(defaultData);
    setCurrentStep(1);
    setRevealId(null);
    setError(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <GenderRevealEditorContext.Provider
      value={{
        data,
        currentStep,
        revealId,
        isLoading,
        error,
        updateData,
        setCurrentStep,
        nextStep,
        prevStep,
        saveToServer,
        goToCheckout,
        reset,
      }}
    >
      {children}
    </GenderRevealEditorContext.Provider>
  );
}

export function useGenderRevealEditor() {
  const context = useContext(GenderRevealEditorContext);
  if (!context) {
    throw new Error('useGenderRevealEditor must be used within GenderRevealEditorProvider');
  }
  return context;
}
