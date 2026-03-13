"use client";

import { useState, useEffect } from 'react';

export interface ProductPrice {
  productId: string;
  productName: string;
  priceCents: number;
  priceFromCents: number | null;
  priceFormatted: string;
  priceFromFormatted: string | null;
}

export type PricesMap = Record<string, ProductPrice>;

// Preços padrão (fallback)
const DEFAULT_PRICES: PricesMap = {
  message: {
    productId: 'message',
    productName: 'Mensagem Digital',
    priceCents: 1990,
    priceFromCents: null,
    priceFormatted: 'R$ 19,90',
    priceFromFormatted: null,
  },
  'card-collection': {
    productId: 'card-collection',
    productName: '12 Cartas',
    priceCents: 2990,
    priceFromCents: null,
    priceFormatted: 'R$ 29,90',
    priceFromFormatted: null,
  },
  'gender-reveal': {
    productId: 'gender-reveal',
    productName: 'Revelação Virtual',
    priceCents: 1990,
    priceFromCents: null,
    priceFormatted: 'R$ 19,90',
    priceFromFormatted: null,
  },
};

// Cache global para evitar múltiplas requisições
let cachedPrices: PricesMap | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minuto

export function usePrices() {
  const [prices, setPrices] = useState<PricesMap>(cachedPrices || DEFAULT_PRICES);
  const [loading, setLoading] = useState(!cachedPrices);

  useEffect(() => {
    const now = Date.now();
    
    // Usar cache se ainda válido
    if (cachedPrices && (now - cacheTimestamp) < CACHE_DURATION) {
      setPrices(cachedPrices);
      setLoading(false);
      return;
    }

    fetch('/api/prices')
      .then(res => res.json())
      .then(data => {
        cachedPrices = data;
        cacheTimestamp = Date.now();
        setPrices(data);
      })
      .catch(() => {
        // Em caso de erro, usa os preços padrão
        setPrices(DEFAULT_PRICES);
      })
      .finally(() => setLoading(false));
  }, []);

  return { prices, loading };
}

// Função para buscar preço de um produto específico
export function useProductPrice(productId: string) {
  const { prices, loading } = usePrices();
  return {
    price: prices[productId] || DEFAULT_PRICES[productId],
    loading,
  };
}
