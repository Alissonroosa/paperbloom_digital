import { z } from 'zod';

/**
 * Gender Reveal Entity
 * Represents a gender reveal experience
 */
export interface GenderReveal {
  id: string;
  boyName: string;
  girlName: string;
  actualGender: 'menino' | 'menina';
  dadName: string;
  momName: string;
  storyMessage: string | null;
  photos: string[];
  boyColor: string;
  girlColor: string;
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
 * Gender Reveal Vote Entity
 */
export interface GenderRevealVote {
  id: string;
  revealId: string;
  voterName: string;
  vote: 'menino' | 'menina';
  message: string | null;
  createdAt: Date;
}

/**
 * Database row representation for GenderReveal (snake_case from PostgreSQL)
 */
export interface GenderRevealRow {
  id: string;
  boy_name: string;
  girl_name: string;
  actual_gender: 'menino' | 'menina';
  dad_name: string;
  mom_name: string;
  story_message: string | null;
  photos: string[];
  boy_color: string;
  girl_color: string;
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

/**
 * Database row representation for GenderRevealVote
 */
export interface GenderRevealVoteRow {
  id: string;
  reveal_id: string;
  voter_name: string;
  vote: 'menino' | 'menina';
  message: string | null;
  created_at: Date;
}

/**
 * Zod schema for creating a gender reveal
 */
export const createGenderRevealSchema = z.object({
  boyName: z.string()
    .min(1, 'Nome do menino é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  girlName: z.string()
    .min(1, 'Nome da menina é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  actualGender: z.enum(['menino', 'menina'], {
    message: 'Selecione o sexo do bebê',
  }),
  dadName: z.string()
    .min(1, 'Nome do pai é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  momName: z.string()
    .min(1, 'Nome da mãe é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  storyMessage: z.string()
    .max(2000, 'Mensagem deve ter no máximo 2000 caracteres')
    .nullable()
    .optional(),
  photos: z.array(z.string().url('URL de foto inválida'))
    .max(5, 'Máximo de 5 fotos permitidas')
    .optional()
    .default([]),
  boyColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida')
    .optional()
    .default('#5B9BD5'),
  girlColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida')
    .optional()
    .default('#E6A0B8'),
  contactName: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  contactEmail: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  contactPhone: z.string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .trim()
    .optional(),
});

/**
 * Zod schema for creating a vote
 */
export const createVoteSchema = z.object({
  revealId: z.string().uuid('ID inválido'),
  voterName: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  vote: z.enum(['menino', 'menina'], {
    message: 'Selecione seu palpite',
  }),
  message: z.string()
    .max(500, 'Mensagem deve ter no máximo 500 caracteres')
    .nullable()
    .optional(),
});

/**
 * Type inference from Zod schemas
 */
export type CreateGenderRevealInput = z.infer<typeof createGenderRevealSchema>;
export type CreateVoteInput = z.infer<typeof createVoteSchema>;

/**
 * Convert database row to GenderReveal entity
 */
export function rowToGenderReveal(row: GenderRevealRow): GenderReveal {
  return {
    id: row.id,
    boyName: row.boy_name,
    girlName: row.girl_name,
    actualGender: row.actual_gender,
    dadName: row.dad_name,
    momName: row.mom_name,
    storyMessage: row.story_message,
    photos: row.photos || [],
    boyColor: row.boy_color,
    girlColor: row.girl_color,
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

/**
 * Convert database row to GenderRevealVote entity
 */
export function rowToVote(row: GenderRevealVoteRow): GenderRevealVote {
  return {
    id: row.id,
    revealId: row.reveal_id,
    voterName: row.voter_name,
    vote: row.vote,
    message: row.message,
    createdAt: row.created_at,
  };
}

/**
 * Validation functions
 */
export function validateCreateGenderReveal(data: unknown) {
  return createGenderRevealSchema.safeParse(data);
}

export function validateCreateVote(data: unknown) {
  return createVoteSchema.safeParse(data);
}

/**
 * Dashboard stats interface
 */
export interface GenderRevealStats {
  totalVotes: number;
  boyVotes: number;
  girlVotes: number;
  viewCount: number;
  votes: GenderRevealVote[];
}

/**
 * Generate slug from names
 */
export function generateRevealSlug(boyName: string, girlName: string, id: string): string {
  const sanitize = (name: string) => 
    name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  
  const shortId = id.split('-')[0];
  return `${sanitize(boyName)}-ou-${sanitize(girlName)}-${shortId}`;
}
