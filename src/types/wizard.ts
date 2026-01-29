import { z } from 'zod';

/**
 * Wizard State Type
 * Manages the complete state of the multi-step wizard
 */
export interface WizardState {
  // Current step (1-7)
  currentStep: number;
  
  // Form data
  data: WizardFormData;
  
  // Upload states
  uploads: WizardUploadStates;
  
  // UI states
  ui: WizardUIState;
  
  // Validation per step
  stepValidation: {
    [step: number]: {
      isValid: boolean;
      errors: Record<string, string>;
    };
  };
  
  // Completion tracking
  completedSteps: Set<number>;
}

/**
 * Wizard Form Data
 * Contains all form fields organized by wizard steps
 */
export interface WizardFormData {
  // Step 1: Page Title and URL
  pageTitle: string;
  urlSlug: string;
  
  // Step 2: Special Date
  specialDate: Date | null;
  showTimeCounter: boolean;
  timeCounterLabel: string;
  
  // Step 3: Main Message
  recipientName: string;
  senderName: string;
  mainMessage: string;
  
  // Step 4: Photos
  mainImage: File | null;
  galleryImages: (File | null)[];
  
  // Step 5: Theme
  backgroundColor: string;
  theme: 'gradient' | 'bright' | 'matte' | 'pastel' | 'neon' | 'vintage';
  customColor: string | null;
  customEmoji: string | null;
  
  // Step 6: Music
  youtubeUrl: string;
  musicStartTime: number; // in seconds (0-300)
  
  // Step 7: Contact Info
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Additional fields from existing system
  signature: string;
  closingMessage: string;
}

/**
 * Upload States
 * Tracks upload progress and errors for images
 */
export interface WizardUploadStates {
  mainImage: {
    url: string | null;
    isUploading: boolean;
    error: string | null;
  };
  galleryImages: Array<{
    url: string | null;
    isUploading: boolean;
    error: string | null;
  }>;
}

/**
 * UI State
 * Manages UI-specific state like preview mode and auto-save
 */
export interface WizardUIState {
  previewMode: 'desktop' | 'mobile';
  isAutoSaving: boolean;
  lastSaved: Date | null;
  showMobilePreview: boolean;
}

/**
 * Initial Wizard State
 */
export const initialWizardState: WizardState = {
  currentStep: 1,
  data: {
    pageTitle: '',
    urlSlug: '',
    specialDate: null,
    showTimeCounter: false,
    timeCounterLabel: '',
    recipientName: '',
    senderName: '',
    mainMessage: '',
    mainImage: null,
    galleryImages: [null, null, null, null, null, null, null],
    backgroundColor: '#FFFFFF',
    theme: 'gradient',
    customColor: null,
    customEmoji: null,
    youtubeUrl: '',
    musicStartTime: 0,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    signature: '',
    closingMessage: '',
  },
  uploads: {
    mainImage: {
      url: null,
      isUploading: false,
      error: null,
    },
    galleryImages: [
      { url: null, isUploading: false, error: null },
      { url: null, isUploading: false, error: null },
      { url: null, isUploading: false, error: null },
      { url: null, isUploading: false, error: null },
      { url: null, isUploading: false, error: null },
      { url: null, isUploading: false, error: null },
      { url: null, isUploading: false, error: null },
    ],
  },
  ui: {
    previewMode: 'desktop',
    isAutoSaving: false,
    lastSaved: null,
    showMobilePreview: false,
  },
  stepValidation: {
    1: { isValid: false, errors: {} },
    2: { isValid: true, errors: {} },
    3: { isValid: false, errors: {} },
    4: { isValid: true, errors: {} },
    5: { isValid: true, errors: {} },
    6: { isValid: true, errors: {} },
    7: { isValid: false, errors: {} },
  },
  completedSteps: new Set<number>(),
};

/**
 * Wizard Action Types
 */
export type WizardAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof WizardFormData; value: any } }
  | { type: 'UPDATE_UPLOAD_STATE'; payload: { type: 'main' | 'gallery'; index?: number; state: Partial<WizardUploadStates['mainImage']> } }
  | { type: 'UPDATE_UI_STATE'; payload: Partial<WizardUIState> }
  | { type: 'SET_STEP_VALIDATION'; payload: { step: number; isValid: boolean; errors: Record<string, string> } }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'RESTORE_STATE'; payload: WizardState }
  | { type: 'RESET_STATE' };

/**
 * Validation Schemas for each step
 */

// Step 1: Page Title and URL
export const step1Schema = z.object({
  pageTitle: z.string()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  urlSlug: z.string()
    .min(3, 'URL deve ter no mínimo 3 caracteres')
    .max(50, 'URL deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'URL deve conter apenas letras minúsculas, números e hífens'),
});

// Step 2: Special Date (optional)
export const step2Schema = z.object({
  specialDate: z.date().nullable(),
  showTimeCounter: z.boolean(),
  timeCounterLabel: z.string().max(50, 'Nome da data deve ter no máximo 50 caracteres').optional(),
});

// Step 3: Main Message
export const step3Schema = z.object({
  recipientName: z.string()
    .min(1, 'Nome do destinatário é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  senderName: z.string()
    .min(1, 'Seu nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  mainMessage: z.string()
    .min(1, 'Mensagem é obrigatória')
    .max(500, 'Mensagem deve ter no máximo 500 caracteres'),
});

// Step 4: Photos (validated on upload, not required)
export const step4Schema = z.object({
  mainImage: z.instanceof(File).nullable().optional(),
  galleryImages: z.array(z.instanceof(File).nullable()).max(7).optional(),
});

// Step 5: Theme
export const step5Schema = z.object({
  backgroundColor: z.string().min(1, 'Cor de fundo é obrigatória'),
  theme: z.enum(['gradient', 'bright', 'matte', 'pastel', 'neon', 'vintage']),
  customColor: z.string().nullable().optional(),
  customEmoji: z.string().nullable().optional(),
});

// Step 6: Music (optional)
export const step6Schema = z.object({
  youtubeUrl: z.string()
    .regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//, 'Deve ser uma URL do YouTube')
    .optional()
    .or(z.literal('')),
  musicStartTime: z.number().min(0).max(300),
});

// Step 7: Contact Info
export const step7Schema = z.object({
  contactName: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  contactEmail: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  contactPhone: z.string()
    .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .min(1, 'Telefone é obrigatório'),
});

/**
 * Step validation schema map
 */
export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
  7: step7Schema,
} as const;

/**
 * Extract step-specific data from wizard form data
 */
export function extractStepData(step: number, data: WizardFormData): any {
  switch (step) {
    case 1:
      return { pageTitle: data.pageTitle, urlSlug: data.urlSlug };
    case 2:
      return { 
        specialDate: data.specialDate,
        showTimeCounter: data.showTimeCounter,
        timeCounterLabel: data.timeCounterLabel,
      };
    case 3:
      return {
        recipientName: data.recipientName,
        senderName: data.senderName,
        mainMessage: data.mainMessage,
      };
    case 4:
      return {
        mainImage: data.mainImage,
        galleryImages: data.galleryImages,
      };
    case 5:
      return {
        backgroundColor: data.backgroundColor,
        theme: data.theme,
        customColor: data.customColor,
      };
    case 6:
      return {
        youtubeUrl: data.youtubeUrl,
        musicStartTime: data.musicStartTime,
      };
    case 7:
      return {
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      };
    default:
      return {};
  }
}

/**
 * Validate step before navigation
 */
export function validateStepBeforeNavigation(
  step: number,
  data: WizardFormData
): { isValid: boolean; errors: Record<string, string> } {
  const schema = stepSchemas[step as keyof typeof stepSchemas];
  if (!schema) {
    return { isValid: true, errors: {} };
  }
  
  try {
    const stepData = extractStepData(step, data);
    schema.parse(stepData);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Erro de validação' } };
  }
}

/**
 * Predefined background colors
 */
export const BACKGROUND_COLORS = [
  { name: 'Rosa Suave', value: '#FFE4E1' },
  { name: 'Azul Céu', value: '#E0F2FE' },
  { name: 'Verde Menta', value: '#D1FAE5' },
  { name: 'Lavanda', value: '#E9D5FF' },
  { name: 'Pêssego', value: '#FECACA' },
  { name: 'Amarelo Claro', value: '#FEF3C7' },
  { name: 'Cinza Claro', value: '#F3F4F6' },
  { name: 'Branco', value: '#FFFFFF' },
];

/**
 * Theme options
 */
export const THEME_OPTIONS = [
  { name: 'Gradiente', value: 'gradient' as const, description: 'Gradiente suave da cor escolhida' },
  { name: 'Brilhante', value: 'bright' as const, description: 'Cor vibrante com brilho' },
  { name: 'Fosco', value: 'matte' as const, description: 'Acabamento fosco e elegante' },
  { name: 'Pastel', value: 'pastel' as const, description: 'Tom suave e delicado' },
  { name: 'Neon', value: 'neon' as const, description: 'Cores vibrantes e modernas' },
  { name: 'Vintage', value: 'vintage' as const, description: 'Tom retrô e nostálgico' },
];

/**
 * Step labels for the wizard
 */
export const STEP_LABELS = [
  'Título e URL',
  'Data Especial',
  'Mensagem',
  'Fotos',
  'Tema',
  'Música',
  'Contato',
];
