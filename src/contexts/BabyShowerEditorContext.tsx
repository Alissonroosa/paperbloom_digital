"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DEFAULT_SELECTED_CATALOG } from '@/config/baby-shower-catalog';
import type { GiftCategory, DiaperSize, BabyGender, BabyShowerThemeId } from '@/types/baby-shower';

export interface EditorGift {
  /** Catalog key when the item comes from the base catalog (undefined for custom items). */
  key?: string;
  name: string;
  category: GiftCategory;
  diaperSize: DiaperSize | null;
  qtyDesired: number;
  priceCents: number | null;
  isCustom: boolean;
}

export interface BabyShowerData {
  // Step 1: Baby + event
  babyName: string;
  babyGender: BabyGender | null;
  hostName: string;
  partnerName: string;
  welcomeMessage: string;

  // Step 2: Event details
  eventDate: string; // ISO datetime-local string
  locationName: string;
  locationAddress: string;
  locationMapsUrl: string;
  guestCount: number;

  // Step 3: Gifts
  gifts: EditorGift[];

  // Step 4: Theme
  theme: BabyShowerThemeId;

  // Step 5: Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

interface BabyShowerEditorContextType {
  data: BabyShowerData;
  currentStep: number;
  babyShowerId: string | null;
  isLoading: boolean;
  error: string | null;

  updateData: (updates: Partial<BabyShowerData>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToCheckout: () => Promise<void>;
  reset: () => void;
}

const defaultGifts: EditorGift[] = DEFAULT_SELECTED_CATALOG.map((c) => ({
  key: c.key,
  name: c.name,
  category: c.category,
  diaperSize: c.diaperSize,
  qtyDesired: c.defaultQty,
  priceCents: c.priceCents,
  isCustom: false,
}));

const defaultData: BabyShowerData = {
  babyName: '',
  babyGender: null,
  hostName: '',
  partnerName: '',
  welcomeMessage: '',
  eventDate: '',
  locationName: '',
  locationAddress: '',
  locationMapsUrl: '',
  guestCount: 0,
  gifts: defaultGifts,
  theme: 'safari',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

const BabyShowerEditorContext = createContext<BabyShowerEditorContextType | null>(null);

const STORAGE_KEY = 'baby-shower-editor-data';

export function BabyShowerEditorProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BabyShowerData>(defaultData);
  const [currentStep, setCurrentStep] = useState(1);
  const [babyShowerId, setBabyShowerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData({ ...defaultData, ...(parsed.data || {}) });
        setCurrentStep(parsed.currentStep || 1);
        setBabyShowerId(parsed.babyShowerId || null);
      }
    } catch (e) {
      console.error('Error loading saved data:', e);
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, currentStep, babyShowerId }));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  }, [data, currentStep, babyShowerId]);

  const updateData = useCallback((updates: Partial<BabyShowerData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const nextStep = useCallback(() => setCurrentStep((p) => Math.min(p + 1, 5)), []);
  const prevStep = useCallback(() => setCurrentStep((p) => Math.max(p - 1, 1)), []);

  const goToCheckout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build create payload
      const payload = {
        babyName: data.babyName.trim() || null,
        babyGender: data.babyGender,
        hostName: data.hostName.trim(),
        partnerName: data.partnerName.trim() || null,
        welcomeMessage: data.welcomeMessage.trim() || null,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : null,
        locationName: data.locationName.trim() || null,
        locationAddress: data.locationAddress.trim() || null,
        locationMapsUrl: data.locationMapsUrl.trim() || null,
        guestCount: Number(data.guestCount) || 0,
        theme: data.theme,
        contactName: data.contactName.trim(),
        contactEmail: data.contactEmail.trim(),
        contactPhone: data.contactPhone.trim() || undefined,
        gifts: data.gifts
          .filter((g) => g.name.trim() && g.qtyDesired >= 1)
          .map((g) => ({
            name: g.name.trim(),
            category: g.category,
            diaperSize: g.category === 'fralda' ? g.diaperSize : null,
            qtyDesired: Number(g.qtyDesired),
            priceCents: g.priceCents,
            isCustom: g.isCustom,
          })),
      };

      // Create once; reuse id if user comes back
      let id = babyShowerId;
      if (!id) {
        const response = await fetch('/api/baby-shower', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar o chá de fralda');
        }
        const result = await response.json();
        id = result.babyShower.id as string;
        setBabyShowerId(id);
      }

      // ---------------------------------------------------------------------
      // LANÇAMENTO GRATUITO: o produto é publicado sem pagamento. Geramos os
      // links + QR e enviamos o email direto via /finalize.
      // ---------------------------------------------------------------------
      const finalize = await fetch(`/api/baby-shower/${id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!finalize.ok) {
        const errorData = await finalize.json();
        throw new Error(errorData.error || 'Erro ao publicar o chá de fralda');
      }

      // Vai direto para a página de entrega (links + QR).
      window.location.href = `/delivery/cha-de-fralda/${id}`;

      // ---------------------------------------------------------------------
      // PAGAMENTO (DESATIVADO — reativar quando voltar a cobrar):
      // Em vez do /finalize acima, chamar o checkout do Mercado Pago e
      // redirecionar para a URL de pagamento. O webhook (/api/checkout/webhook)
      // já trata o productType 'baby-shower' e faz a finalização pós-pagamento.
      //
      // const checkout = await fetch('/api/checkout/baby-shower', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     babyShowerId: id,
      //     contactName: data.contactName,
      //     contactEmail: data.contactEmail,
      //     contactPhone: data.contactPhone,
      //   }),
      // });
      // if (!checkout.ok) {
      //   const errorData = await checkout.json();
      //   throw new Error(errorData.error || 'Erro ao criar checkout');
      // }
      // const result = await checkout.json();
      // window.location.href = result.url;
      // ---------------------------------------------------------------------
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro desconhecido';
      setError(message);
      setIsLoading(false);
    }
  }, [data, babyShowerId]);

  const reset = useCallback(() => {
    setData(defaultData);
    setCurrentStep(1);
    setBabyShowerId(null);
    setError(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <BabyShowerEditorContext.Provider
      value={{
        data,
        currentStep,
        babyShowerId,
        isLoading,
        error,
        updateData,
        setCurrentStep,
        nextStep,
        prevStep,
        goToCheckout,
        reset,
      }}
    >
      {children}
    </BabyShowerEditorContext.Provider>
  );
}

export function useBabyShowerEditor() {
  const context = useContext(BabyShowerEditorContext);
  if (!context) {
    throw new Error('useBabyShowerEditor must be used within BabyShowerEditorProvider');
  }
  return context;
}
