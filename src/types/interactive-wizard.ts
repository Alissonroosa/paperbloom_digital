/**
 * Interactive Wizard Types
 * 
 * Types and configurations for the generic interactive wizard system
 * used across different products (12 Cartas, Mensagem Digital, Revelação Virtual)
 * 
 * @see Requirements 1.1, 1.2, 1.6
 */

// ============================================================================
// Product Types
// ============================================================================

/**
 * Supported product types for the interactive wizard
 */
export type ProductType = 'card-collection' | 'digital-message' | 'gender-reveal';

// ============================================================================
// Gradient Configuration
// ============================================================================

/**
 * Configuration for gradient backgrounds
 */
export interface GradientConfig {
  /** Starting color (Tailwind class suffix, e.g., 'purple-50') */
  from: string;
  /** Optional middle color for three-color gradients */
  via?: string;
  /** Ending color (Tailwind class suffix, e.g., 'pink-50') */
  to: string;
}

// ============================================================================
// Wizard Configuration
// ============================================================================

/**
 * Configuration for an interactive wizard instance
 */
export interface InteractiveWizardConfig {
  /** Total number of steps in the wizard */
  totalSteps: number;
  /** Labels for each step (used in progress indicator) */
  stepLabels: string[];
  /** Gradient colors for the fullscreen background */
  gradientColors: GradientConfig;
  /** Themed emojis for each step */
  themeEmojis: string[];
  /** Product type identifier */
  productType: ProductType;
  /** Key used for auto-save in sessionStorage */
  autoSaveKey: string;
  /** Debounce delay for auto-save in milliseconds (default: 2000) */
  autoSaveDebounceMs?: number;
}

// ============================================================================
// Animation Configuration
// ============================================================================

/**
 * Configuration for step transition animations
 */
export interface StepTransitionConfig {
  /** Duration of the transition in seconds */
  duration: number;
  /** Initial state when entering */
  enterFrom: { opacity: number; x: number };
  /** Final state when entering */
  enterTo: { opacity: number; x: number };
  /** Final state when exiting */
  exitTo: { opacity: number; x: number };
}

/**
 * Configuration for emoji animations
 */
export interface EmojiAnimationConfig {
  /** Initial animation state */
  initial: { scale: number };
  /** Target animation state */
  animate: { scale: number };
  /** Animation transition settings */
  transition: { type: string; damping: number };
}

/**
 * Configuration for content stagger animations
 */
export interface ContentStaggerConfig {
  /** Delay values for staggered content animation */
  delays: number[];
}

/**
 * Complete animation configuration for the wizard
 */
export interface AnimationConfig {
  /** Step transition animation settings */
  stepTransition: StepTransitionConfig;
  /** Emoji animation settings */
  emojiAnimation: EmojiAnimationConfig;
  /** Content stagger animation settings */
  contentStagger: ContentStaggerConfig;
}

/**
 * Default animation configuration
 * - Step transitions: 300ms with horizontal slide
 * - Emoji: Spring animation with scale from 0 to 1
 * - Content: Staggered delays for sequential reveal
 * 
 * @see Requirements 2.1, 2.3, 2.4, 2.5
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  stepTransition: {
    duration: 0.3,
    enterFrom: { opacity: 0, x: 50 },
    enterTo: { opacity: 1, x: 0 },
    exitTo: { opacity: 0, x: -50 },
  },
  emojiAnimation: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: 'spring', damping: 10 },
  },
  contentStagger: {
    delays: [0.1, 0.2, 0.4, 0.5, 0.7],
  },
};

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Result of validating a wizard step
 */
export interface StepValidationResult {
  /** Whether the step is valid */
  isValid: boolean;
  /** Map of field names to error messages */
  errors: Record<string, string>;
}

/**
 * Function type for step validators
 */
export type StepValidator = (stepData: unknown) => StepValidationResult;

/**
 * Configuration for wizard validation behavior
 */
export interface ValidationConfig {
  /** Map of step numbers to their validator functions */
  validators: Record<number, StepValidator>;
  /** Whether to validate on field change (default: false) */
  validateOnChange?: boolean;
  /** Whether to validate on field blur (default: false) */
  validateOnBlur?: boolean;
}

// ============================================================================
// Product Configurations
// ============================================================================

/**
 * Configuration for the 12 Cartas (Card Collection) product
 *
 * 4 steps:
 * 1. Informações Básicas - De/Para (💌)
 * 2. Mensagem Inicial + Música + Foto Capa (✨)
 * 3. Suas 12 Cartas - grid agrupado por categoria (💌)
 * 4. Pré-visualização e Checkout (✨)
 *
 * @see Requirements 4.1, 4.3, 4.7
 */
export const CARD_COLLECTION_CONFIG: InteractiveWizardConfig = {
  totalSteps: 4,
  stepLabels: [
    'Informações Básicas',
    'Mensagem e Música',
    'Suas 12 Cartas',
    'Pré-visualização e Checkout',
  ],
  gradientColors: {
    from: 'purple-50',
    via: 'white',
    to: 'pink-50',
  },
  themeEmojis: ['💌', '✨', '💌', '✨'],
  productType: 'card-collection',
  autoSaveKey: 'card-collection-editor',
  autoSaveDebounceMs: 2000,
};

/**
 * Configuration for the Mensagem Digital (Digital Message) product
 * 
 * 7 steps:
 * 1. Título e URL (💌)
 * 2. Data Especial (📅)
 * 3. Mensagem (💬)
 * 4. Fotos (📸)
 * 5. Tema (🎨)
 * 6. Música (🎵)
 * 7. Contato (📧)
 * 
 * @see Requirements 5.1, 5.2, 5.7
 */
export const DIGITAL_MESSAGE_CONFIG: InteractiveWizardConfig = {
  totalSteps: 6,
  stepLabels: [
    'Para Quem?',
    'Sua Mensagem',
    'Data Especial',
    'Fotos',
    'Música e Tema',
    'Finalizar',
  ],
  gradientColors: {
    from: 'rose-50',
    via: 'white',
    to: 'amber-50',
  },
  themeEmojis: ['💝', '💬', '📅', '📸', '🎵', '✨'],
  productType: 'digital-message',
  autoSaveKey: 'paperbloom-wizard-draft',
  autoSaveDebounceMs: 2000,
};
