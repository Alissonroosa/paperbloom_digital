import { z } from 'zod';

/**
 * YouTube URL validation regex
 * Supports formats: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
 * Also accepts additional query parameters like &list=, &start_radio=, etc.
 */
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+(\?[\w&=%-]*)?(&[\w&=%-]*)*$/;

/**
 * Zod schema for YouTube URL validation
 */
export const youtubeUrlSchema = z.string().regex(YOUTUBE_URL_REGEX, {
  message: 'Invalid YouTube URL format',
});

/**
 * Card Template Interface
 * Defines the structure of pre-filled card templates
 */
export interface CardTemplate {
  order: number;
  title: string;
  defaultMessage: string;
}

/**
 * 12 Card Templates with emotional themes
 * Requirements: 2.1
 */
export const CARD_TEMPLATES: CardTemplate[] = [
  {
    order: 1,
    title: "Abra quando... estiver tendo um dia difícil",
    defaultMessage: "Sei que hoje não está sendo fácil, mas quero que saiba que você é mais forte do que imagina. Cada desafio que você enfrenta te torna mais resiliente. Lembre-se: eu acredito em você, sempre. Respire fundo, você vai superar isso. ❤️"
  },
  {
    order: 2,
    title: "Abra quando... estiver se sentindo inseguro(a)",
    defaultMessage: "Você é incrível exatamente do jeito que é. Sua gentileza, sua inteligência, seu sorriso - tudo em você é especial. Não deixe que a insegurança te faça esquecer o quanto você é valioso(a). Eu te admiro mais do que você imagina. 💪"
  },
  {
    order: 3,
    title: "Abra quando... estivermos longe um do outro",
    defaultMessage: "A distância física não muda nada entre nós. Você está sempre no meu coração, não importa onde esteja. Mal posso esperar para te ver novamente e te dar um abraço apertado. Até lá, saiba que penso em você todos os dias. 🌍"
  },
  {
    order: 4,
    title: "Abra quando... estiver estressado(a) com o trabalho",
    defaultMessage: "Respire. Você está fazendo o seu melhor, e isso é mais do que suficiente. Lembre-se de fazer pausas, beber água, e não se cobrar tanto. O trabalho é importante, mas sua saúde mental vem primeiro. Você merece descanso. 🧘"
  },
  {
    order: 5,
    title: "Abra quando... quiser saber o quanto eu te amo",
    defaultMessage: "Te amo mais do que as palavras podem expressar. Você ilumina meus dias, me faz querer ser uma pessoa melhor, e torna minha vida infinitamente mais feliz. Cada momento ao seu lado é um presente. Te amo hoje, amanhã e sempre. 💕"
  },
  {
    order: 6,
    title: "Abra quando... completarmos mais um ano juntos",
    defaultMessage: "Mais um ano ao seu lado, e cada dia me apaixono mais por você. Obrigado por cada risada, cada abraço, cada momento compartilhado. Você é meu melhor amigo, meu amor, minha pessoa. Que venham muitos e muitos anos juntos! 🎉"
  },
  {
    order: 7,
    title: "Abra quando... estivermos celebrando uma conquista sua",
    defaultMessage: "Parabéns! Você conseguiu! Sua dedicação e esforço finalmente foram recompensados. Estou tão orgulhoso(a) de você e de tudo que você conquistou. Continue brilhando, você merece todo o sucesso do mundo! 🏆"
  },
  {
    order: 8,
    title: "Abra quando... for uma noite de chuva e tédio",
    defaultMessage: "Que tal preparar um chocolate quente, colocar aquele filme que a gente ama, e se aconchegar no sofá? Ou podemos fazer aquela receita nova que você queria tentar. Noites assim são perfeitas para criar memórias especiais juntos. ☕🎬"
  },
  {
    order: 9,
    title: "Abra quando... tivermos nossa primeira briga boba",
    defaultMessage: "Ei, a gente brigou por uma bobagem, né? Quero que saiba que nosso amor é muito maior do que qualquer discussão. Me desculpe se eu exagerei. No final do dia, você é a pessoa mais importante para mim. Vamos fazer as pazes? 🤝"
  },
  {
    order: 10,
    title: "Abra quando... você precisar dar uma risada",
    defaultMessage: "Lembra daquela vez que a gente [insira aqui uma memória engraçada de vocês]? Eu rio até hoje quando penso nisso! Você tem o dom de transformar momentos simples em memórias inesquecíveis. Obrigado por todas as risadas! 😂"
  },
  {
    order: 11,
    title: "Abra quando... eu tiver feito algo que te irritou",
    defaultMessage: "Me desculpe. Eu errei, e reconheço isso. Você merece ser tratado(a) com todo o amor e respeito do mundo, e prometo fazer melhor. Obrigado por ter paciência comigo e por me dar a chance de crescer ao seu lado. Te amo. 🙏"
  },
  {
    order: 12,
    title: "Abra quando... você não conseguir dormir",
    defaultMessage: "Feche os olhos e respire devagar. Pense em um lugar tranquilo, onde você se sente seguro(a) e em paz. Lembre-se de que amanhã é um novo dia, cheio de possibilidades. Você está seguro(a), você está amado(a). Boa noite. 🌙"
  }
];

/**
 * CardCollection Entity
 * Represents a collection of 12 cards
 * Requirements: 1.2, 10.4
 */
export interface CardCollection {
  id: string;                      // UUID
  recipientName: string;           // Nome do destinatário (1-100 chars)
  senderName: string;              // Nome do remetente (1-100 chars)
  slug: string | null;             // URL slug único (gerado após pagamento)
  qrCodeUrl: string | null;        // URL do QR code
  status: 'pending' | 'paid';      // Status de pagamento
  stripeSessionId: string | null;  // ID da sessão Stripe
  contactEmail: string | null;     // Email para envio
  contactPhone: string | null;     // Telefone para contato
  contactName: string | null;      // Nome para contato
  introMessage: string | null;     // Mensagem inicial personalizada
  youtubeVideoId: string | null;   // ID do vídeo do YouTube
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Card Entity
 * Represents an individual card within a collection
 * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 10.5
 */
export interface Card {
  id: string;                      // UUID
  collectionId: string;            // FK para card_collections
  order: number;                   // Ordem da carta (1-12)
  title: string;                   // Título da carta (ex: "Abra quando...")
  messageText: string;             // Texto da mensagem (1-500 chars)
  imageUrl: string | null;         // URL da foto (opcional)
  youtubeUrl: string | null;       // URL do YouTube (opcional)
  status: 'unopened' | 'opened';   // Status de abertura
  openedAt: Date | null;           // Data/hora da primeira abertura
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database row representation for CardCollection (snake_case from PostgreSQL)
 */
export interface CardCollectionRow {
  id: string;
  recipient_name: string;
  sender_name: string;
  slug: string | null;
  qr_code_url: string | null;
  status: 'pending' | 'paid';
  stripe_session_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  intro_message: string | null;
  youtube_video_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Database row representation for Card (snake_case from PostgreSQL)
 */
export interface CardRow {
  id: string;
  collection_id: string;
  order: number;
  title: string;
  message_text: string;
  image_url: string | null;
  youtube_url: string | null;
  status: 'unopened' | 'opened';
  opened_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Zod schema for creating a card collection
 * Requirements: 1.1, 1.2
 */
export const createCardCollectionSchema = z.object({
  recipientName: z.string()
    .min(1, 'Recipient name is required')
    .max(100, 'Recipient name must be 100 characters or less')
    .trim(),
  senderName: z.string()
    .min(1, 'Sender name is required')
    .max(100, 'Sender name must be 100 characters or less')
    .trim(),
  contactEmail: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be 255 characters or less')
    .trim()
    .nullable()
    .optional(),
});

/**
 * Zod schema for creating a card
 * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 3.3, 3.5
 */
export const createCardSchema = z.object({
  collectionId: z.string().uuid('Invalid collection ID'),
  order: z.number()
    .int('Order must be an integer')
    .min(1, 'Order must be at least 1')
    .max(12, 'Order must be at most 12'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  messageText: z.string()
    .min(1, 'Message text is required')
    .max(500, 'Message text must be 500 characters or less')
    .trim(),
  imageUrl: z.string()
    .url('Invalid image URL')
    .nullable()
    .optional(),
  youtubeUrl: youtubeUrlSchema
    .nullable()
    .optional(),
});

/**
 * Zod schema for updating a card
 * Requirements: 1.4, 1.5, 1.6, 1.7, 3.2, 3.3, 3.5
 */
export const updateCardSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim()
    .optional(),
  messageText: z.string()
    .min(1, 'Message text is required')
    .max(500, 'Message text must be 500 characters or less')
    .trim()
    .optional(),
  imageUrl: z.string()
    .url('Invalid image URL')
    .nullable()
    .optional(),
  youtubeUrl: youtubeUrlSchema
    .nullable()
    .optional(),
});

/**
 * Zod schema for updating card collection status
 */
export const updateCardCollectionStatusSchema = z.object({
  id: z.string().uuid('Invalid collection ID'),
  status: z.enum(['pending', 'paid']),
});

/**
 * Zod schema for updating card collection with QR code and slug
 */
export const updateCardCollectionQRCodeSchema = z.object({
  id: z.string().uuid('Invalid collection ID'),
  qrCodeUrl: z.string().url('Invalid QR code URL'),
  slug: z.string().min(1, 'Slug is required'),
});

/**
 * Zod schema for the complete CardCollection entity
 */
export const cardCollectionSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
  recipientName: z.string().min(1).max(100),
  senderName: z.string().min(1).max(100),
  slug: z.string().nullable(),
  qrCodeUrl: z.string().nullable(),
  status: z.enum(['pending', 'paid']),
  stripeSessionId: z.string().nullable(),
  contactEmail: z.string().email().max(255).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Zod schema for the complete Card entity
 */
export const cardSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
  collectionId: z.string().uuid('Invalid collection ID'),
  order: z.number().int().min(1).max(12),
  title: z.string().min(1).max(200),
  messageText: z.string().min(1).max(500),
  imageUrl: z.string().url().nullable(),
  youtubeUrl: youtubeUrlSchema.nullable(),
  status: z.enum(['unopened', 'opened']),
  openedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Type inference from Zod schemas
 */
export type CreateCardCollectionInput = z.infer<typeof createCardCollectionSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type UpdateCardCollectionStatusInput = z.infer<typeof updateCardCollectionStatusSchema>;
export type UpdateCardCollectionQRCodeInput = z.infer<typeof updateCardCollectionQRCodeSchema>;

/**
 * Convert database row to CardCollection entity
 * Requirements: 10.4
 */
export function rowToCardCollection(row: CardCollectionRow): CardCollection {
  return {
    id: row.id,
    recipientName: row.recipient_name,
    senderName: row.sender_name,
    slug: row.slug,
    qrCodeUrl: row.qr_code_url,
    status: row.status,
    stripeSessionId: row.stripe_session_id,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    contactName: row.contact_name,
    introMessage: row.intro_message,
    youtubeVideoId: row.youtube_video_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert database row to Card entity
 * Requirements: 10.5
 */
export function rowToCard(row: CardRow): Card {
  return {
    id: row.id,
    collectionId: row.collection_id,
    order: row.order,
    title: row.title,
    messageText: row.message_text,
    imageUrl: row.image_url,
    youtubeUrl: row.youtube_url,
    status: row.status,
    openedAt: row.opened_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Validation Functions
 */

/**
 * Validates card collection creation data
 * @param data - The data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateCreateCardCollection(data: unknown) {
  return createCardCollectionSchema.safeParse(data);
}

/**
 * Validates card creation data
 * @param data - The data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateCreateCard(data: unknown) {
  return createCardSchema.safeParse(data);
}

/**
 * Validates card update data
 * @param data - The data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateUpdateCard(data: unknown) {
  return updateCardSchema.safeParse(data);
}

/**
 * Validates a complete card collection entity
 * @param data - The card collection data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateCardCollection(data: unknown) {
  return cardCollectionSchema.safeParse(data);
}

/**
 * Validates a complete card entity
 * @param data - The card data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateCard(data: unknown) {
  return cardSchema.safeParse(data);
}

/**
 * Validates YouTube URL format
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidYouTubeUrl(url: string): boolean {
  return youtubeUrlSchema.safeParse(url).success;
}

/**
 * Validates required fields for card collection creation
 * @param data - The data to check
 * @returns Object with validation results for each required field
 */
export function validateRequiredCardCollectionFields(data: Partial<CreateCardCollectionInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.recipientName || data.recipientName.trim().length === 0) {
    errors.recipientName = 'Recipient name is required';
  }

  if (!data.senderName || data.senderName.trim().length === 0) {
    errors.senderName = 'Sender name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates required fields for card creation
 * @param data - The data to check
 * @returns Object with validation results for each required field
 */
export function validateRequiredCardFields(data: Partial<CreateCardInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.collectionId) {
    errors.collectionId = 'Collection ID is required';
  }

  if (data.order === undefined || data.order < 1 || data.order > 12) {
    errors.order = 'Order must be between 1 and 12';
  }

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  }

  if (!data.messageText || data.messageText.trim().length === 0) {
    errors.messageText = 'Message text is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format Zod validation errors into a user-friendly format
 * @param error - Zod validation error
 * @returns Formatted error object
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  });

  return formatted;
}

/**
 * Get card template by order
 * @param order - The order number (1-12)
 * @returns The card template or undefined if not found
 */
export function getCardTemplateByOrder(order: number): CardTemplate | undefined {
  return CARD_TEMPLATES.find(template => template.order === order);
}

/**
 * Validate that all 12 cards exist for a collection
 * @param cards - Array of cards
 * @returns true if all 12 cards exist with correct order
 */
export function validateCompleteCardSet(cards: Card[]): boolean {
  if (cards.length !== 12) {
    return false;
  }

  const orders = cards.map(card => card.order).sort((a, b) => a - b);
  for (let i = 1; i <= 12; i++) {
    if (orders[i - 1] !== i) {
      return false;
    }
  }

  return true;
}
