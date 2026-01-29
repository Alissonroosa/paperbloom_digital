# Design Document

## Overview

This design document outlines the architecture and implementation strategy for transforming the Paper Bloom message editor into a multi-step wizard interface with real-time preview capabilities and email delivery integration via Resend. The wizard will guide users through 7 logical steps, making the message creation process more intuitive and less overwhelming.

The design focuses on:
- Creating a step-based navigation system with visual progress indicator
- Organizing form fields into logical, focused steps
- Implementing real-time preview with Card/Cinema view toggle
- Integrating Resend for QR Code email delivery
- Creating a delivery page to display QR Code after payment
- Maintaining auto-save functionality across wizard steps
- Ensuring responsive design for mobile devices

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /editor/mensagem Page (Wizard)                         │ │
│  │  ┌──────────────────┐    ┌──────────────────────────┐ │ │
│  │  │  WizardStepper   │    │  PreviewPanel            │ │ │
│  │  │  - Step 1-7      │    │  - Card View             │ │ │
│  │  │  - Navigation    │◄───┤  - Cinema View           │ │ │
│  │  │  - Validation    │    │  - Real-time updates     │ │ │
│  │  └──────────────────┘    └──────────────────────────┘ │ │
│  │           │                                             │ │
│  │           ▼                                             │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Local Storage (Auto-save with step tracking)    │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes                                             │ │
│  │  - /api/messages/create                                 │ │
│  │  - /api/messages/upload-image                           │ │
│  │  - /api/checkout/create-session                         │ │
│  │  - /api/email/send-qrcode (NEW)                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Server (Next.js)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services                                               │ │
│  │  - MessageService (CRUD operations)                     │ │
│  │  - ImageService (Upload & validation)                   │ │
│  │  - StripeService (Payment processing)                   │ │
│  │  - EmailService (Resend integration) [NEW]              │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  External Services                                      │ │
│  │  - PostgreSQL (Database)                                │ │
│  │  - Cloudflare R2 (Image storage)                        │ │
│  │  - Resend (Email delivery) [NEW]                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```


### Component Architecture

```
WizardEditorPage (/editor/mensagem)
├── WizardHeader
│   ├── Logo
│   ├── StepIndicator (1/7)
│   └── SaveIndicator
├── WizardLayout (Grid)
│   ├── WizardSidebar (Left)
│   │   ├── StepperNavigation
│   │   │   ├── StepButton[1-7]
│   │   │   └── ProgressBar
│   │   ├── StepContent (Dynamic)
│   │   │   ├── Step1: PageTitleAndURL
│   │   │   │   ├── TitleInput
│   │   │   │   ├── URLSlugInput
│   │   │   │   └── SlugAvailabilityCheck
│   │   │   ├── Step2: SpecialDate
│   │   │   │   └── DatePicker
│   │   │   ├── Step3: MainMessage
│   │   │   │   ├── RecipientInput
│   │   │   │   ├── SenderInput
│   │   │   │   ├── MessageTextarea
│   │   │   │   └── TextSuggestionButton
│   │   │   ├── Step4: PhotoUpload
│   │   │   │   ├── MainImageUploader
│   │   │   │   └── GalleryUploader (3 slots)
│   │   │   ├── Step5: ThemeCustomization
│   │   │   │   ├── BackgroundColorPicker
│   │   │   │   ├── ThemeSelector (Light/Dark/Gradient)
│   │   │   │   └── ContrastValidator
│   │   │   ├── Step6: MusicSelection
│   │   │   │   ├── YouTubeURLInput
│   │   │   │   ├── StartTimeSlider
│   │   │   │   └── MusicPreview
│   │   │   └── Step7: ContactInfo
│   │   │       ├── NameInput
│   │   │       ├── EmailInput
│   │   │       ├── PhoneInput
│   │   │       └── SummaryReview
│   │   ├── ValidationErrors
│   │   └── NavigationButtons
│   │       ├── BackButton
│   │       └── NextButton / PaymentButton
│   └── PreviewPanel (Right, Sticky)
│       ├── ViewToggle (Card/Cinema)
│       ├── CardPreview (Static)
│       │   ├── CoverImage
│       │   ├── TitleSection
│       │   ├── MainMessage
│       │   ├── PhotoGallery
│       │   └── Footer
│       └── CinematicPreview (Animated)
│           ├── IntroStages
│           ├── PhotoReveal
│           ├── MessageDisplay
│           └── ClosingStages
└── AutoSaveIndicator

DeliveryPage (/delivery/[messageId])
├── DeliveryHeader
│   ├── SuccessIcon
│   └── Title
├── QRCodeDisplay
│   ├── QRCodeImage
│   ├── DownloadButton
│   └── MessageURL
├── ShareInstructions
└── EmailConfirmation
    └── EmailSentMessage
```

## Components and Interfaces

### Data Models

#### Extended Wizard State

```typescript
export interface WizardState {
  // Current step (1-7)
  currentStep: number;
  
  // Form data (extended from existing)
  data: {
    // Step 1: Page Title and URL
    pageTitle: string;
    urlSlug: string;
    
    // Step 2: Special Date
    specialDate: Date | null;
    
    // Step 3: Main Message
    recipientName: string;
    senderName: string;
    mainMessage: string;
    
    // Step 4: Photos
    mainImage: File | null;
    galleryImages: (File | null)[];
    
    // Step 5: Theme
    backgroundColor: string;
    theme: 'light' | 'dark' | 'gradient';
    customColor: string | null;
    
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
  };
  
  // Upload states
  uploads: {
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
  };
  
  // UI states
  ui: {
    previewMode: 'card' | 'cinema';
    isAutoSaving: boolean;
    lastSaved: Date | null;
    showMobilePreview: boolean;
  };
  
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
```


#### Email Service Types

```typescript
export interface QRCodeEmailData {
  recipientEmail: string;
  recipientName: string;
  messageUrl: string;
  qrCodeDataUrl: string; // Base64 encoded QR code image
  senderName: string;
  messageTitle: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}
```

#### Delivery Page Types

```typescript
export interface DeliveryPageData {
  messageId: string;
  messageUrl: string;
  qrCodeUrl: string;
  recipientName: string;
  emailSent: boolean;
  emailAddress: string;
}
```

### Component Interfaces

#### WizardStepper Component

```typescript
interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  stepLabels: string[];
}
```

#### StepContent Component

```typescript
interface StepContentProps {
  step: number;
  data: WizardState['data'];
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
  uploads: WizardState['uploads'];
}
```

#### PreviewPanel Component

```typescript
interface PreviewPanelProps {
  data: WizardState['data'];
  uploads: WizardState['uploads'];
  viewMode: 'card' | 'cinema';
  onViewModeChange: (mode: 'card' | 'cinema') => void;
}
```

#### ThemeCustomization Component

```typescript
interface ThemeCustomizationProps {
  backgroundColor: string;
  theme: 'light' | 'dark' | 'gradient';
  customColor: string | null;
  onBackgroundChange: (color: string) => void;
  onThemeChange: (theme: 'light' | 'dark' | 'gradient') => void;
  onCustomColorChange: (color: string) => void;
}

// Predefined color options
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

export const THEME_OPTIONS = [
  { name: 'Claro', value: 'light', description: 'Texto escuro em fundo claro' },
  { name: 'Escuro', value: 'dark', description: 'Texto claro em fundo escuro' },
  { name: 'Gradiente', value: 'gradient', description: 'Fundo com gradiente suave' },
];
```

#### MusicSelection Component

```typescript
interface MusicSelectionProps {
  youtubeUrl: string;
  startTime: number;
  onUrlChange: (url: string) => void;
  onStartTimeChange: (time: number) => void;
  error?: string;
}
```

#### ContactInfo Component

```typescript
interface ContactInfoProps {
  name: string;
  email: string;
  phone: string;
  onChange: (field: 'name' | 'email' | 'phone', value: string) => void;
  errors: Record<string, string>;
  summaryData: WizardState['data'];
}
```

#### EmailService Interface

```typescript
export interface IEmailService {
  sendQRCodeEmail(data: QRCodeEmailData): Promise<EmailSendResult>;
  validateConfig(): boolean;
}
```

## Data Models

### Database Schema Extensions

No additional database schema changes are required beyond the existing enhanced message fields. The wizard reorganizes existing fields into steps.

### Validation Schemas

```typescript
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

// Step 2: Special Date
export const step2Schema = z.object({
  specialDate: z.date().nullable(),
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

// Step 4: Photos (validated on upload)
export const step4Schema = z.object({
  mainImage: z.instanceof(File).nullable(),
  galleryImages: z.array(z.instanceof(File).nullable()).max(3),
});

// Step 5: Theme
export const step5Schema = z.object({
  backgroundColor: z.string(),
  theme: z.enum(['light', 'dark', 'gradient']),
  customColor: z.string().nullable(),
});

// Step 6: Music
export const step6Schema = z.object({
  youtubeUrl: z.string()
    .url('URL inválida')
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
```


### Resend Integration

```typescript
// Environment variables
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@paperbloom.com
RESEND_FROM_NAME=Paper Bloom

// Email template structure
export const QR_CODE_EMAIL_TEMPLATE = {
  subject: (recipientName: string) => 
    `Sua mensagem especial para ${recipientName} está pronta! 🎁`,
  
  html: (data: QRCodeEmailData) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .qr-code { text-align: center; margin: 30px 0; }
          .qr-code img { max-width: 300px; border: 2px solid #ddd; padding: 10px; }
          .message-url { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Sua Mensagem Está Pronta!</h1>
            <p>Olá ${data.recipientName},</p>
            <p>Sua mensagem especial "${data.messageTitle}" foi criada com sucesso!</p>
          </div>
          
          <div class="qr-code">
            <h2>QR Code da Mensagem</h2>
            <img src="cid:qrcode" alt="QR Code" />
            <p>Escaneie este código para acessar sua mensagem</p>
          </div>
          
          <div class="message-url">
            <h3>Link Direto:</h3>
            <p><a href="${data.messageUrl}">${data.messageUrl}</a></p>
            <p style="text-align: center; margin-top: 15px;">
              <a href="${data.messageUrl}" class="button">Visualizar Mensagem</a>
            </p>
          </div>
          
          <div class="instructions">
            <h3>Como Compartilhar:</h3>
            <ul>
              <li>Envie o QR Code por WhatsApp, email ou redes sociais</li>
              <li>Imprima o QR Code e coloque em um cartão físico</li>
              <li>Compartilhe o link direto com o destinatário</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Com carinho,<br>Equipe Paper Bloom</p>
            <p><a href="https://paperbloom.com">paperbloom.com</a></p>
          </div>
        </div>
      </body>
    </html>
  `,
};
```

## Error Handling

### Wizard Navigation Validation

```typescript
export function validateStepBeforeNavigation(
  step: number,
  data: WizardState['data']
): { isValid: boolean; errors: Record<string, string> } {
  const schemas = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema,
    5: step5Schema,
    6: step6Schema,
    7: step7Schema,
  };
  
  const schema = schemas[step];
  if (!schema) {
    return { isValid: true, errors: {} };
  }
  
  try {
    // Extract relevant fields for this step
    const stepData = extractStepData(step, data);
    schema.parse(stepData);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Erro de validação' } };
  }
}

function extractStepData(step: number, data: WizardState['data']): any {
  switch (step) {
    case 1:
      return { pageTitle: data.pageTitle, urlSlug: data.urlSlug };
    case 2:
      return { specialDate: data.specialDate };
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
```

### URL Slug Availability Check

```typescript
export async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean; suggestion?: string }> {
  try {
    const response = await fetch(`/api/messages/check-slug?slug=${encodeURIComponent(slug)}`);
    
    if (!response.ok) {
      throw new Error('Failed to check slug availability');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Slug availability check error:', error);
    return { available: false };
  }
}

// Auto-generate slug from title
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .substring(0, 50); // Limit length
}
```


### Email Service Error Handling

```typescript
export class EmailService implements IEmailService {
  private resend: Resend;
  private config: ResendConfig;
  
  constructor(config: ResendConfig) {
    this.config = config;
    this.resend = new Resend(config.apiKey);
  }
  
  validateConfig(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.fromEmail &&
      this.config.fromName
    );
  }
  
  async sendQRCodeEmail(data: QRCodeEmailData): Promise<EmailSendResult> {
    if (!this.validateConfig()) {
      return {
        success: false,
        error: 'Email service not configured properly',
      };
    }
    
    try {
      const result = await this.sendWithRetry(data, 3);
      return result;
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }
  
  private async sendWithRetry(
    data: QRCodeEmailData,
    maxRetries: number
  ): Promise<EmailSendResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.resend.emails.send({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: data.recipientEmail,
          subject: QR_CODE_EMAIL_TEMPLATE.subject(data.recipientName),
          html: QR_CODE_EMAIL_TEMPLATE.html(data),
          attachments: [
            {
              filename: 'qrcode.png',
              content: data.qrCodeDataUrl.split(',')[1], // Remove data:image/png;base64, prefix
              cid: 'qrcode',
            },
          ],
        });
        
        return {
          success: true,
          messageId: result.id,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Failed to send email after retries');
  }
}
```

### Contrast Validation

```typescript
// Ensure text remains readable with selected background
export function validateContrast(
  backgroundColor: string,
  theme: 'light' | 'dark' | 'gradient'
): { isValid: boolean; warning?: string } {
  // Convert hex to RGB
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) {
    return { isValid: false, warning: 'Cor inválida' };
  }
  
  // Calculate relative luminance
  const luminance = calculateLuminance(rgb);
  
  // Check contrast ratio
  const textColor = theme === 'dark' ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  const textLuminance = calculateLuminance(textColor);
  
  const contrastRatio = (Math.max(luminance, textLuminance) + 0.05) / 
                        (Math.min(luminance, textLuminance) + 0.05);
  
  // WCAG AA requires 4.5:1 for normal text
  if (contrastRatio < 4.5) {
    return {
      isValid: false,
      warning: `Contraste insuficiente (${contrastRatio.toFixed(2)}:1). Recomendamos escolher ${
        theme === 'dark' ? 'uma cor mais escura' : 'uma cor mais clara'
      }.`,
    };
  }
  
  return { isValid: true };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

### Auto-Save with Step Tracking

```typescript
export function useWizardAutoSave({
  key,
  state,
  debounceMs = 2000,
  enabled = true,
}: {
  key: string;
  state: WizardState;
  debounceMs?: number;
  enabled?: boolean;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const timeoutId = setTimeout(() => {
      try {
        setIsSaving(true);
        localStorage.setItem(key, JSON.stringify({
          state,
          savedAt: new Date().toISOString(),
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [state, key, debounceMs, enabled]);
  
  const restore = useCallback((): WizardState | null => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      // Convert Set back from array
      if (parsed.state.completedSteps) {
        parsed.state.completedSteps = new Set(parsed.state.completedSteps);
      }
      return parsed.state;
    } catch (error) {
      console.error('Failed to restore auto-save:', error);
      return null;
    }
  }, [key]);
  
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear auto-save:', error);
    }
  }, [key]);
  
  return { isSaving, lastSaved, restore, clear };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Step Navigation Preservation
*For any* wizard state with data entered in any step, navigating to a different step and back should preserve all the original data without loss.
**Validates: Requirements 1.5**

### Property 2: URL Slug Validation
*For any* string containing characters other than lowercase letters, numbers, and hyphens, the URL slug validation should reject it.
**Validates: Requirements 2.2**

### Property 3: Slug Generation from Title
*For any* page title string, the auto-generated slug should contain only lowercase alphanumeric characters and hyphens, with no accents or special characters.
**Validates: Requirements 2.4**

### Property 4: Title Length Validation
*For any* string longer than 100 characters, the page title validation should reject it.
**Validates: Requirements 2.5**

### Property 5: URL Slug Length Validation
*For any* string longer than 50 characters, the URL slug validation should reject it.
**Validates: Requirements 2.6**

### Property 6: Date Formatting Consistency
*For any* valid date object, the formatted output should match the pattern "DD de MMMM, YYYY" in Portuguese.
**Validates: Requirements 3.2**

### Property 7: Message Length Validation
*For any* string longer than 500 characters, the main message validation should reject it.
**Validates: Requirements 4.3**

### Property 8: Character Count Accuracy
*For any* text input in the message field, the displayed character count should equal the actual string length.
**Validates: Requirements 4.4**

### Property 9: Preview Update Responsiveness
*For any* field update in the wizard, the preview should reflect the change within 300ms.
**Validates: Requirements 9.1**

### Property 10: Image Format Validation
*For any* uploaded file that is not in JPEG, PNG, or WebP format, the image validation should reject it.
**Validates: Requirements 5.2**

### Property 11: Image Size Validation
*For any* uploaded file larger than 5MB, the image validation should reject it.
**Validates: Requirements 5.3**

### Property 12: Preview Synchronization
*For any* customization (text, image, color, theme) applied in the wizard, the preview should immediately reflect that exact customization.
**Validates: Requirements 9.4**

### Property 13: View Mode Persistence
*For any* view mode selection (Card or Cinema), navigating between wizard steps should preserve the selected view mode.
**Validates: Requirements 10.4**

### Property 14: Email Format Validation
*For any* string that doesn't match standard email format (user@domain.tld), the email validation should reject it.
**Validates: Requirements 8.2**

### Property 15: Brazilian Phone Format Validation
*For any* string that doesn't match Brazilian phone format (XX) XXXXX-XXXX, the phone validation should reject it.
**Validates: Requirements 8.3**

### Property 16: YouTube URL Validation
*For any* URL that doesn't contain youtube.com or youtu.be domain, the YouTube URL validation should reject it.
**Validates: Requirements 7.2**

### Property 17: YouTube Video ID Extraction
*For any* valid YouTube URL (regardless of format: watch?v=, youtu.be/, embed/), the video ID extraction should return the same 11-character video identifier.
**Validates: Requirements 7.3**

### Property 18: Contrast Validation
*For any* background color and theme combination, if the calculated contrast ratio is below 4.5:1, the validation should reject it or warn the user.
**Validates: Requirements 6.5**

### Property 19: Email Content Completeness
*For any* QR code email sent, the email content should include the QR code image, the message URL as a clickable link, and usage instructions.
**Validates: Requirements 12.2, 12.3, 12.4**

### Property 20: Email Retry with Exponential Backoff
*For any* failed email send attempt, the system should retry up to 3 times with delays following exponential backoff (1s, 2s, 4s).
**Validates: Requirements 13.6**

### Property 21: Auto-Save Round Trip
*For any* wizard state saved to local storage, restoring it should produce an equivalent state with the same data and current step.
**Validates: Requirements 15.2**

### Property 22: Auto-Save Trigger Timing
*For any* field change in the wizard, if no further changes occur, auto-save should trigger after exactly 2 seconds of inactivity.
**Validates: Requirements 15.1**

### Property 23: Touch Target Minimum Size
*For any* interactive element on mobile devices, the touch target size should be at least 44x44 pixels.
**Validates: Requirements 14.4**

### Property 24: Wizard Functionality on Mobile
*For any* wizard feature available on desktop, the same feature should be functional on mobile devices (screen width < 768px).
**Validates: Requirements 14.3**

## Testing Strategy

### Unit Testing

Unit tests will verify specific behaviors and edge cases for individual components and functions:

- **Validation Functions**: Test each validation schema with valid and invalid inputs
- **Slug Generation**: Test title-to-slug conversion with various inputs (accents, special chars, spaces)
- **Date Formatting**: Test date formatting with different locales and edge cases
- **Contrast Calculation**: Test contrast validation with various color combinations
- **Email Template**: Test email HTML generation with different data inputs
- **URL Extraction**: Test YouTube video ID extraction from various URL formats

### Property-Based Testing

Property-based tests will verify universal properties across many randomly generated inputs using **fast-check** library for TypeScript. Each test will run a minimum of 100 iterations.

**Testing Framework**: fast-check (https://github.com/dubzzz/fast-check)

**Key Property Tests**:

1. **Step Navigation Preservation** (Property 1): Generate random wizard states, navigate between steps, verify data preservation
2. **URL Slug Validation** (Property 2): Generate random strings with invalid characters, verify all are rejected
3. **Slug Generation** (Property 3): Generate random titles, verify generated slugs contain only valid characters
4. **Length Validations** (Properties 4, 5, 7): Generate strings of various lengths, verify validation boundaries
5. **Date Formatting** (Property 6): Generate random dates, verify format consistency
6. **Image Validation** (Properties 10, 11): Generate files with various formats and sizes, verify validation
7. **Email Validation** (Property 14): Generate random strings, verify email format detection
8. **Phone Validation** (Property 15): Generate random strings, verify Brazilian phone format detection
9. **YouTube URL Validation** (Properties 16, 17): Generate various URL formats, verify validation and ID extraction
10. **Contrast Validation** (Property 18): Generate random color combinations, verify contrast calculations
11. **Auto-Save Round Trip** (Property 21): Generate random wizard states, save and restore, verify equivalence

**Test Configuration**:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

**Property Test Example**:
```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Property Tests - Wizard', () => {
  it('Property 3: Slug generation produces valid slugs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (title) => {
          const slug = generateSlugFromTitle(title);
          // Slug should only contain lowercase letters, numbers, and hyphens
          expect(slug).toMatch(/^[a-z0-9-]*$/);
          // Slug should not exceed 50 characters
          expect(slug.length).toBeLessThanOrEqual(50);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests will verify the complete flow:

- **Wizard Flow**: Complete all 7 steps and verify data submission
- **Payment Integration**: Test Stripe checkout session creation with wizard data
- **Email Delivery**: Test Resend integration with mock email service
- **QR Code Generation**: Test QR code creation and delivery page display
- **Auto-Save**: Test local storage persistence across browser sessions

### End-to-End Testing

E2E tests will verify the complete user journey:

- User completes wizard from step 1 to 7
- User navigates back and forth between steps
- User uploads images and sees preview updates
- User completes payment and receives QR code
- User receives email with QR code

### Accessibility Testing

- Keyboard navigation through wizard steps
- Screen reader compatibility for step indicators
- ARIA labels for form fields and buttons
- Color contrast validation for all themes
- Touch target sizes on mobile devices

