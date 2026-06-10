/**
 * Base catalog for the "Chá de Fralda" product.
 *
 * The host starts from these suggested items and can toggle/edit quantities,
 * then add custom items on top (hybrid catalog). Prices are suggestions in BRL
 * cents — reserved for the MVP 2 online-payment flow and not charged in MVP 1.
 *
 * Quantities are derived from the number of guests via computeProportionalGifts()
 * — but only for items where `scalesWithGuests` is true. Durable / single items
 * (banheira, kit mamadeira, bolsa…) keep their fixed `defaultQty`.
 */

import type { GiftCategory, DiaperSize } from '@/types/baby-shower';

/** Mimo subcategories — used to group the (large) mimo list in the editor. */
export type MimoSubcategory =
  | 'higiene'
  | 'alimentacao'
  | 'roupas'
  | 'passeio'
  | 'saude'
  | 'quarto';

export const MIMO_SUBCATEGORY_LABELS: Record<MimoSubcategory, string> = {
  higiene: 'Higiene e banho',
  alimentacao: 'Alimentação',
  roupas: 'Roupinhas',
  passeio: 'Passeio e transporte',
  saude: 'Saúde e segurança',
  quarto: 'Quarto e sono',
};

export interface CatalogItem {
  /** Stable key for the catalog item (used to dedupe defaults). */
  key: string;
  name: string;
  category: GiftCategory;
  diaperSize: DiaperSize | null;
  /** Subcategory for mimos (null for diapers). */
  subcategory: MimoSubcategory | null;
  /** Suggested desired quantity (fixed qty for non-scaling items). */
  defaultQty: number;
  /**
   * Whether the quantity should scale with the number of guests.
   * - true: consumables (diapers, lenços, babadores…) → distributed proportionally.
   * - false: durable / single items (banheira, kit mamadeira, bolsa…) → keep defaultQty.
   */
  scalesWithGuests: boolean;
  /** Suggested price in BRL cents (MVP 2). Null when not applicable. */
  priceCents: number | null;
  /** Whether this item is pre-selected when the host opens the list. */
  defaultSelected: boolean;
}

/** Diaper items, one per size — todas pré-selecionadas e escalam com convidados. */
export const CATALOG_DIAPERS: CatalogItem[] = [
  { key: 'fralda-rn', name: 'Fralda RN (Recém-nascido)', category: 'fralda', diaperSize: 'RN', subcategory: null, defaultQty: 5, scalesWithGuests: true, priceCents: 3990, defaultSelected: true },
  { key: 'fralda-p', name: 'Fralda P', category: 'fralda', diaperSize: 'P', subcategory: null, defaultQty: 8, scalesWithGuests: true, priceCents: 4490, defaultSelected: true },
  { key: 'fralda-m', name: 'Fralda M', category: 'fralda', diaperSize: 'M', subcategory: null, defaultQty: 8, scalesWithGuests: true, priceCents: 4990, defaultSelected: true },
  { key: 'fralda-g', name: 'Fralda G', category: 'fralda', diaperSize: 'G', subcategory: null, defaultQty: 6, scalesWithGuests: true, priceCents: 5490, defaultSelected: true },
  { key: 'fralda-xg', name: 'Fralda XG', category: 'fralda', diaperSize: 'XG', subcategory: null, defaultQty: 4, scalesWithGuests: true, priceCents: 5990, defaultSelected: true },
];

/**
 * Mimo (baby-related extras) items — itens típicos de chá de fralda no Brasil,
 * organizados por subcategoria. scalesWithGuests separa consumíveis (escalam) de
 * itens duráveis/únicos (quantidade fixa).
 */
export const CATALOG_MIMOS: CatalogItem[] = [
  // Higiene e banho
  { key: 'lenco-umidecido', name: 'Lenços umedecidos', category: 'mimo', diaperSize: null, subcategory: 'higiene', defaultQty: 6, scalesWithGuests: true, priceCents: 1290, defaultSelected: true },
  { key: 'pomada-assadura', name: 'Pomada para assaduras', category: 'mimo', diaperSize: null, subcategory: 'higiene', defaultQty: 3, scalesWithGuests: true, priceCents: 2490, defaultSelected: true },
  { key: 'sabonete-liquido', name: 'Sabonete líquido / shampoo', category: 'mimo', diaperSize: null, subcategory: 'higiene', defaultQty: 2, scalesWithGuests: true, priceCents: 2190, defaultSelected: false },
  { key: 'algodao', name: 'Algodão', category: 'mimo', diaperSize: null, subcategory: 'higiene', defaultQty: 3, scalesWithGuests: true, priceCents: 1190, defaultSelected: false },
  { key: 'fralda-pano', name: 'Fraldas de pano (boca)', category: 'mimo', diaperSize: null, subcategory: 'higiene', defaultQty: 4, scalesWithGuests: true, priceCents: 2990, defaultSelected: true },
  { key: 'kit-higiene', name: 'Kit higiene (pente, escova, tesoura)', category: 'mimo', diaperSize: null, subcategory: 'higiene', defaultQty: 1, scalesWithGuests: false, priceCents: 4590, defaultSelected: false },
  { key: 'banheira', name: 'Banheira', category: 'mimo', diaperSize: null, subcategory: 'higiene', defaultQty: 1, scalesWithGuests: false, priceCents: 8990, defaultSelected: false },
  { key: 'toalha-banho', name: 'Toalha de banho com capuz', category: 'mimo', diaperSize: null, subcategory: 'higiene', defaultQty: 2, scalesWithGuests: false, priceCents: 3490, defaultSelected: false },

  // Alimentação
  { key: 'babador', name: 'Babadores', category: 'mimo', diaperSize: null, subcategory: 'alimentacao', defaultQty: 3, scalesWithGuests: true, priceCents: 1590, defaultSelected: false },
  { key: 'chupeta', name: 'Chupeta', category: 'mimo', diaperSize: null, subcategory: 'alimentacao', defaultQty: 2, scalesWithGuests: true, priceCents: 1990, defaultSelected: false },
  { key: 'protetor-seios', name: 'Absorvente de seios', category: 'mimo', diaperSize: null, subcategory: 'alimentacao', defaultQty: 2, scalesWithGuests: true, priceCents: 2290, defaultSelected: false },
  { key: 'kit-mamadeira', name: 'Kit mamadeira', category: 'mimo', diaperSize: null, subcategory: 'alimentacao', defaultQty: 1, scalesWithGuests: false, priceCents: 7990, defaultSelected: false },
  { key: 'esterilizador', name: 'Esterilizador de mamadeira', category: 'mimo', diaperSize: null, subcategory: 'alimentacao', defaultQty: 1, scalesWithGuests: false, priceCents: 9990, defaultSelected: false },

  // Roupinhas
  { key: 'body-macacao', name: 'Body / macacão', category: 'mimo', diaperSize: null, subcategory: 'roupas', defaultQty: 3, scalesWithGuests: true, priceCents: 3990, defaultSelected: true },
  { key: 'mijao', name: 'Mijão / calça', category: 'mimo', diaperSize: null, subcategory: 'roupas', defaultQty: 3, scalesWithGuests: true, priceCents: 2990, defaultSelected: false },
  { key: 'meias-luvas', name: 'Meias e luvas', category: 'mimo', diaperSize: null, subcategory: 'roupas', defaultQty: 3, scalesWithGuests: true, priceCents: 1990, defaultSelected: false },
  { key: 'touca-gorro', name: 'Touca / gorro', category: 'mimo', diaperSize: null, subcategory: 'roupas', defaultQty: 2, scalesWithGuests: true, priceCents: 1790, defaultSelected: false },
  { key: 'pijama', name: 'Pijama / macacão de dormir', category: 'mimo', diaperSize: null, subcategory: 'roupas', defaultQty: 2, scalesWithGuests: false, priceCents: 4290, defaultSelected: false },
  { key: 'saida-maternidade', name: 'Saída de maternidade', category: 'mimo', diaperSize: null, subcategory: 'roupas', defaultQty: 1, scalesWithGuests: false, priceCents: 8990, defaultSelected: false },

  // Passeio e transporte (duráveis/únicos)
  { key: 'bolsa-maternidade', name: 'Bolsa / mochila maternidade', category: 'mimo', diaperSize: null, subcategory: 'passeio', defaultQty: 1, scalesWithGuests: false, priceCents: 12990, defaultSelected: false },
  { key: 'trocador-portatil', name: 'Trocador portátil', category: 'mimo', diaperSize: null, subcategory: 'passeio', defaultQty: 1, scalesWithGuests: false, priceCents: 3990, defaultSelected: false },
  { key: 'porta-fraldas', name: 'Porta-fraldas / necessaire', category: 'mimo', diaperSize: null, subcategory: 'passeio', defaultQty: 1, scalesWithGuests: false, priceCents: 2790, defaultSelected: false },
  { key: 'manta-passeio', name: 'Manta de passeio', category: 'mimo', diaperSize: null, subcategory: 'passeio', defaultQty: 2, scalesWithGuests: false, priceCents: 4990, defaultSelected: false },

  // Saúde e segurança (duráveis/únicos)
  { key: 'termometro', name: 'Termômetro', category: 'mimo', diaperSize: null, subcategory: 'saude', defaultQty: 1, scalesWithGuests: false, priceCents: 3490, defaultSelected: false },
  { key: 'aspirador-nasal', name: 'Aspirador nasal', category: 'mimo', diaperSize: null, subcategory: 'saude', defaultQty: 1, scalesWithGuests: false, priceCents: 2490, defaultSelected: false },
  { key: 'soro-fisiologico', name: 'Soro fisiológico', category: 'mimo', diaperSize: null, subcategory: 'saude', defaultQty: 3, scalesWithGuests: true, priceCents: 990, defaultSelected: false },
  { key: 'cortador-unha', name: 'Cortador de unha / lixa', category: 'mimo', diaperSize: null, subcategory: 'saude', defaultQty: 1, scalesWithGuests: false, priceCents: 1490, defaultSelected: false },

  // Quarto e sono
  { key: 'cobertor', name: 'Cobertor / manta', category: 'mimo', diaperSize: null, subcategory: 'quarto', defaultQty: 2, scalesWithGuests: false, priceCents: 5990, defaultSelected: true },
  { key: 'lencol-berco', name: 'Lençol de berço', category: 'mimo', diaperSize: null, subcategory: 'quarto', defaultQty: 2, scalesWithGuests: false, priceCents: 3990, defaultSelected: false },
  { key: 'cueiro', name: 'Cueiro / swaddle', category: 'mimo', diaperSize: null, subcategory: 'quarto', defaultQty: 2, scalesWithGuests: false, priceCents: 3290, defaultSelected: false },
  { key: 'mobile-berco', name: 'Móbile de berço', category: 'mimo', diaperSize: null, subcategory: 'quarto', defaultQty: 1, scalesWithGuests: false, priceCents: 5490, defaultSelected: false },
  { key: 'ninho-redutor', name: 'Ninho redutor de berço', category: 'mimo', diaperSize: null, subcategory: 'quarto', defaultQty: 1, scalesWithGuests: false, priceCents: 8990, defaultSelected: false },
];

/** Full base catalog (diapers first, then mimos). */
export const BABY_SHOWER_CATALOG: CatalogItem[] = [...CATALOG_DIAPERS, ...CATALOG_MIMOS];

/** Items pre-selected when the host first opens the gift list builder. */
export const DEFAULT_SELECTED_CATALOG: CatalogItem[] = BABY_SHOWER_CATALOG.filter((i) => i.defaultSelected);

/* ------------------------------------------------------------------ */
/* Proportional distribution                                           */
/* ------------------------------------------------------------------ */

/**
 * Diaper distribution curve by size, as a fraction of total diapers.
 * Based on real-world newborn usage: babies spend little time in RN/XG and most
 * in P/M/G. Sums to 1.0.
 */
export const DIAPER_DISTRIBUTION: Record<DiaperSize, number> = {
  RN: 0.1,
  P: 0.25,
  M: 0.3,
  G: 0.25,
  XG: 0.1,
};

/**
 * How many mimo units to suggest per guest, in total, spread across the selected
 * SCALING mimos only. e.g. 50 guests -> ~75 mimo units across the chosen consumable mimos.
 */
export const MIMOS_PER_GUEST = 1.5;

/** Lookup helper. */
const CATALOG_BY_KEY: Record<string, CatalogItem> = Object.fromEntries(
  BABY_SHOWER_CATALOG.map((c) => [c.key, c])
);

/**
 * Compute suggested quantities for the currently selected catalog keys.
 *
 * - Diapers (scaling): total ≈ guestCount, split by DIAPER_DISTRIBUTION across the
 *   selected diaper sizes (re-normalized to only the selected sizes).
 * - Scaling mimos: total ≈ guestCount * MIMOS_PER_GUEST, split evenly across the
 *   selected scaling mimos.
 * - Non-scaling items (durable/single): keep their fixed defaultQty, regardless of guests.
 *
 * Returns a map of catalog key -> suggested quantity (>= 1), only for keys in `selectedKeys`.
 */
export function computeProportionalGifts(
  guestCount: number,
  selectedKeys: Set<string>
): Record<string, number> {
  const result: Record<string, number> = {};
  const guests = Math.max(0, Math.floor(guestCount));

  // --- Non-scaling items: fixed defaultQty ---
  for (const key of Array.from(selectedKeys)) {
    const item = CATALOG_BY_KEY[key];
    if (item && !item.scalesWithGuests) {
      result[key] = Math.max(1, item.defaultQty);
    }
  }

  // --- Diapers (scaling) ---
  const selectedDiapers = CATALOG_DIAPERS.filter((d) => selectedKeys.has(d.key) && d.scalesWithGuests);
  if (selectedDiapers.length > 0) {
    const weightSum = selectedDiapers.reduce(
      (sum, d) => sum + (d.diaperSize ? DIAPER_DISTRIBUTION[d.diaperSize] : 0),
      0
    );
    for (const d of selectedDiapers) {
      const weight = d.diaperSize ? DIAPER_DISTRIBUTION[d.diaperSize] : 0;
      const share = weightSum > 0 ? weight / weightSum : 1 / selectedDiapers.length;
      result[d.key] = Math.max(1, Math.round(guests * share));
    }
  }

  // --- Scaling mimos ---
  const selectedScalingMimos = CATALOG_MIMOS.filter((m) => selectedKeys.has(m.key) && m.scalesWithGuests);
  if (selectedScalingMimos.length > 0) {
    const totalMimos = Math.round(guests * MIMOS_PER_GUEST);
    const perMimo = Math.max(1, Math.round(totalMimos / selectedScalingMimos.length));
    for (const m of selectedScalingMimos) {
      result[m.key] = perMimo;
    }
  }

  return result;
}
