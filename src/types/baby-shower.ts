import { z } from 'zod';

/**
 * Baby Shower ("Chá de Fralda") domain types.
 * Mirrors the structure of gender-reveal.ts: entity + DB row + zod schema +
 * row mappers + slug helper, for the Chá de Fralda product.
 */

export type BabyGender = 'menino' | 'menina' | 'surpresa';
export type GiftCategory = 'fralda' | 'mimo';
export type DiaperSize = 'RN' | 'P' | 'M' | 'G' | 'XG';
export type Attendance = 'sim' | 'nao' | 'talvez';
export type GiftPaymentStatus = 'none' | 'pending' | 'paid';
export type BabyShowerThemeId = 'classic' | 'safari' | 'ursos' | 'princesa';

/** Allowed diaper sizes in display order. */
export const DIAPER_SIZES: DiaperSize[] = ['RN', 'P', 'M', 'G', 'XG'];

/**
 * Baby Shower event entity
 */
export interface BabyShower {
  id: string;
  babyName: string | null;
  babyGender: BabyGender;
  hostName: string;
  partnerName: string | null;
  welcomeMessage: string | null;
  eventDate: Date | null;
  locationName: string | null;
  locationAddress: string | null;
  locationMapsUrl: string | null;
  guestCount: number;
  photos: string[];
  primaryColor: string;
  theme: BabyShowerThemeId;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  slug: string | null;
  dashboardSlug: string | null;
  qrCodeUrl: string | null;
  status: 'pending' | 'paid';
  paymentId: string | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Gift list item entity
 */
export interface BabyShowerGift {
  id: string;
  babyShowerId: string;
  name: string;
  category: GiftCategory;
  diaperSize: DiaperSize | null;
  qtyDesired: number;
  qtyReserved: number;
  /** Suggested price in BRL cents. Reserved for MVP 2 (online payment); unused in MVP 1. */
  priceCents: number | null;
  isCustom: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Guest RSVP entity
 */
export interface BabyShowerRsvp {
  id: string;
  babyShowerId: string;
  guestName: string;
  attendance: Attendance;
  message: string | null;
  /** Primary reserved gift (the fralda), kept for backward compatibility. */
  giftId: string | null;
  giftQty: number;
  giftPaymentStatus: GiftPaymentStatus;
  giftPaymentId: string | null;
  /** All gifts reserved in this RSVP (fralda + optional mimo). */
  gifts: RsvpGift[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A single gift reserved within an RSVP (links rsvp -> gift with a quantity).
 */
export interface RsvpGift {
  id: string;
  rsvpId: string;
  giftId: string;
  qty: number;
  /** Denormalized gift info for display (filled by the service when available). */
  giftName?: string;
  giftCategory?: GiftCategory;
  diaperSize?: DiaperSize | null;
}

export interface RsvpGiftRow {
  id: string;
  rsvp_id: string;
  gift_id: string;
  qty: number;
  created_at: Date;
}

/* ------------------------------------------------------------------ */
/* Database row representations (snake_case from PostgreSQL)           */
/* ------------------------------------------------------------------ */

export interface BabyShowerRow {
  id: string;
  baby_name: string | null;
  baby_gender: BabyGender;
  host_name: string;
  partner_name: string | null;
  welcome_message: string | null;
  event_date: Date | null;
  location_name: string | null;
  location_address: string | null;
  location_maps_url: string | null;
  guest_count: number;
  photos: string[];
  primary_color: string;
  theme: BabyShowerThemeId;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  slug: string | null;
  dashboard_slug: string | null;
  qr_code_url: string | null;
  status: 'pending' | 'paid';
  payment_id: string | null;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface BabyShowerGiftRow {
  id: string;
  baby_shower_id: string;
  name: string;
  category: GiftCategory;
  diaper_size: DiaperSize | null;
  qty_desired: number;
  qty_reserved: number;
  price_cents: number | null;
  is_custom: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface BabyShowerRsvpRow {
  id: string;
  baby_shower_id: string;
  guest_name: string;
  attendance: Attendance;
  message: string | null;
  gift_id: string | null;
  gift_qty: number;
  gift_payment_status: GiftPaymentStatus;
  gift_payment_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/* ------------------------------------------------------------------ */
/* Zod schemas                                                         */
/* ------------------------------------------------------------------ */

const giftInputSchema = z.object({
  name: z.string().min(1, 'Nome do presente é obrigatório').max(150, 'Máximo de 150 caracteres').trim(),
  category: z.enum(['fralda', 'mimo']),
  diaperSize: z.enum(['RN', 'P', 'M', 'G', 'XG']).nullable().optional(),
  qtyDesired: z.number().int().min(1, 'Quantidade mínima é 1').max(999, 'Quantidade máxima é 999'),
  priceCents: z.number().int().min(0).nullable().optional(),
  isCustom: z.boolean().optional().default(false),
}).refine(
  (g) => g.category !== 'fralda' || !!g.diaperSize,
  { message: 'Selecione o tamanho da fralda', path: ['diaperSize'] }
);

export const createBabyShowerSchema = z.object({
  babyName: z.string().max(100, 'Máximo de 100 caracteres').trim().nullable().optional(),
  babyGender: z.enum(['menino', 'menina', 'surpresa'], { message: 'Selecione o sexo do bebê' }),
  hostName: z.string().min(1, 'Nome do organizador é obrigatório').max(100).trim(),
  partnerName: z.string().max(100).trim().nullable().optional(),
  welcomeMessage: z.string().max(2000, 'Mensagem deve ter no máximo 2000 caracteres').nullable().optional(),
  eventDate: z.coerce.date().nullable().optional(),
  locationName: z.string().max(200).trim().nullable().optional(),
  locationAddress: z.string().max(500).trim().nullable().optional(),
  locationMapsUrl: z.string().url('URL inválida').max(1000).nullable().optional(),
  guestCount: z.number().int().min(0).max(10000).optional().default(0),
  photos: z.array(z.string().url('URL de foto inválida')).max(5, 'Máximo de 5 fotos').optional().default([]),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional().default('#E6C2C2'),
  theme: z.enum(['classic', 'safari', 'ursos', 'princesa']).optional().default('safari'),
  contactName: z.string().min(1, 'Nome é obrigatório').max(100).trim().optional(),
  contactEmail: z.string().email('Email inválido').max(255).trim().optional(),
  contactPhone: z.string().max(20).trim().optional(),
  gifts: z.array(giftInputSchema).max(100, 'Máximo de 100 presentes').optional().default([]),
});

const giftSelectionSchema = z.object({
  giftId: z.string().uuid('Presente inválido'),
  qty: z.number().int().min(1, 'Quantidade mínima é 1').max(999),
});

export const createRsvpSchema = z.object({
  babyShowerId: z.string().uuid('ID inválido'),
  guestName: z.string().min(1, 'Nome é obrigatório').max(100).trim(),
  attendance: z.enum(['sim', 'nao', 'talvez'], { message: 'Confirme sua presença' }),
  message: z.string().max(500, 'Mensagem deve ter no máximo 500 caracteres').nullable().optional(),
  /** Gifts the guest reserved (e.g. a fralda + an optional mimo). */
  giftSelections: z.array(giftSelectionSchema).max(10).optional().default([]),
  // Legacy single-gift fields — still accepted, folded into giftSelections.
  giftId: z.string().uuid('Presente inválido').nullable().optional(),
  giftQty: z.number().int().min(0).max(999).optional().default(0),
});

export type CreateBabyShowerInput = z.infer<typeof createBabyShowerSchema>;
export type CreateGiftInput = z.infer<typeof giftInputSchema>;
export type CreateRsvpInput = z.infer<typeof createRsvpSchema>;

export function validateCreateBabyShower(data: unknown) {
  return createBabyShowerSchema.safeParse(data);
}

export function validateCreateRsvp(data: unknown) {
  return createRsvpSchema.safeParse(data);
}

/* ------------------------------------------------------------------ */
/* Row mappers                                                         */
/* ------------------------------------------------------------------ */

export function rowToBabyShower(row: BabyShowerRow): BabyShower {
  return {
    id: row.id,
    babyName: row.baby_name,
    babyGender: row.baby_gender,
    hostName: row.host_name,
    partnerName: row.partner_name,
    welcomeMessage: row.welcome_message,
    eventDate: row.event_date,
    locationName: row.location_name,
    locationAddress: row.location_address,
    locationMapsUrl: row.location_maps_url,
    guestCount: row.guest_count,
    photos: row.photos || [],
    primaryColor: row.primary_color,
    theme: row.theme,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    slug: row.slug,
    dashboardSlug: row.dashboard_slug,
    qrCodeUrl: row.qr_code_url,
    status: row.status,
    paymentId: row.payment_id,
    viewCount: row.view_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToGift(row: BabyShowerGiftRow): BabyShowerGift {
  return {
    id: row.id,
    babyShowerId: row.baby_shower_id,
    name: row.name,
    category: row.category,
    diaperSize: row.diaper_size,
    qtyDesired: row.qty_desired,
    qtyReserved: row.qty_reserved,
    priceCents: row.price_cents,
    isCustom: row.is_custom,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToRsvp(row: BabyShowerRsvpRow, gifts: RsvpGift[] = []): BabyShowerRsvp {
  return {
    id: row.id,
    babyShowerId: row.baby_shower_id,
    guestName: row.guest_name,
    attendance: row.attendance,
    message: row.message,
    giftId: row.gift_id,
    giftQty: row.gift_qty,
    giftPaymentStatus: row.gift_payment_status,
    giftPaymentId: row.gift_payment_id,
    gifts,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToRsvpGift(row: RsvpGiftRow): RsvpGift {
  return {
    id: row.id,
    rsvpId: row.rsvp_id,
    giftId: row.gift_id,
    qty: row.qty,
  };
}

/**
 * Dashboard stats interface for the host
 */
export interface BabyShowerStats {
  totalRsvps: number;
  confirmedYes: number;
  confirmedNo: number;
  confirmedMaybe: number;
  viewCount: number;
  rsvps: BabyShowerRsvp[];
  gifts: BabyShowerGift[];
}

/**
 * Public gift view (with availability derived from qty)
 */
export interface BabyShowerGiftPublic extends BabyShowerGift {
  qtyAvailable: number;
}

/**
 * Generate a public slug from the host name (+ baby name) and id.
 */
export function generateBabyShowerSlug(hostName: string, babyName: string | null, id: string): string {
  const sanitize = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const shortId = id.split('-')[0];
  const base = babyName ? `cha-${sanitize(babyName)}` : `cha-${sanitize(hostName)}`;
  return `${base}-${shortId}`;
}
