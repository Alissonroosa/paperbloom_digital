/**
 * Utilitários da Loja Paper Bloom.
 */

import type { CatalogProduct } from '@/types/catalog';

/**
 * Extrai o valor numérico em reais de uma string `priceFormatted`.
 * Aceita formatos como "R$ 55,00", "A partir de R$ 39,00", "R$ 1.250,00".
 * Retorna 0 se não conseguir parsear (caller decide o fallback).
 */
export function parsePriceFormatted(priceFormatted?: string): number {
  if (!priceFormatted) return 0;
  const match = priceFormatted.match(/R\$\s*([\d.]+),(\d{2})/);
  if (!match) return 0;
  const reaisStr = match[1].replace(/\./g, '');
  const centavosStr = match[2];
  const value = parseFloat(`${reaisStr}.${centavosStr}`);
  return Number.isFinite(value) ? value : 0;
}

/**
 * Retorna o valor representativo do produto para uso em eventos de analytics
 * de visualização. Prioriza arte digital (preço fixo) sobre físico (range).
 */
export function getProductValueForAnalytics(product: CatalogProduct): number {
  if (product.art?.priceInCents) {
    return product.art.priceInCents / 100;
  }
  return parsePriceFormatted(product.physical?.priceFormatted);
}
