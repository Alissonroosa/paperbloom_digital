# Design Document

## Overview

This design document outlines the architecture and implementation strategy for enhancing the Paper Bloom message editor. The enhancement transforms the current basic editor into a comprehensive message creation tool with templates, text suggestions, multiple photos, and a complete cinematic preview experience. The editor will be relocated from `/editor` to `/editor/mensagem` to accommodate future product-specific editors.

The design focuses on:
- Expanding the data model to support new fields (title, date, closing message, signature, gallery photos)
- Creating a template and suggestion system for improved user experience
- Implementing auto-save functionality for draft preservation
- Maintaining real-time preview synchronization
- Ensuring responsive design and accessibility

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /editor/mensagem Page                                  │ │
│  │  ┌──────────────────┐    ┌──────────────────────────┐ │ │
│  │  │  EditorForm      │    │  CinematicPreview        │ │ │
│  │  │  - Fields        │◄───┤  - Real-time updates     │ │ │
│  │  │  - Validation    │    │  - Stage simulation      │ │ │
│  │  │  - Templates     │    │  - Full experience       │ │ │
│  │  └──────────────────┘    └──────────────────────────┘ │ │
│  │           │                                             │ │
│  │           ▼                                             │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Local Storage (Auto-save)                        │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes                                             │ │
│  │  - /api/messages/create                                 │ │
│  │  - /api/messages/upload-image                           │ │
│  │  - /api/checkout/create-session                         │ │
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
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database (PostgreSQL)                                  │ │
│  │  - messages table (extended schema)                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
EditorPage (/editor/mensagem)
├── EditorHeader
│   ├── Logo
│   ├── Progress Indicator
│   └── Cancel Button
├── EditorLayout (Grid)
│   ├── EditorSidebar (Left)
│   │   ├── TemplateSelector
│   │   │   ├── TemplateCard[]
│   │   │   └── ModelGallery
│   │   ├── EditorForm
│   │   │   ├── TitleInput (with suggestions)
│   │   │   ├── DatePicker
│   │   │   ├── ImageUploader (main)
│   │   │   ├── FromToInputs
│   │   │   ├── MessageTextarea (with suggestions)
│   │   │   ├── SignatureInput
│   │   │   ├── ClosingTextarea (with suggestions)
│   │   │   ├── GalleryUploader (3 images)
│   │   │   └── YouTubeInput
│   │   ├── ValidationErrors
│   │   └── ProTips
│   └── PreviewPanel (Right, Sticky)
│       ├── PreviewHeader
│       ├── CinematicPreview
│       │   ├── IntroStages
│       │   ├── PhotoReveal
│       │   ├── MessageDisplay
│       │   ├── ClosingStages
│       │   └── FullViewLayout
│       │       ├── CoverImage
│       │       ├── TitleSection
│       │       ├── MainMessage
│       │       ├── PhotoGallery
│       │       ├── MusicPlayer
│       │       └── Footer
│       └── ActionButtons
│           ├── RestartPreview
│           └── ContinueToPayment
└── AutoSaveIndicator
```

## Components and Interfaces

### Data Models

#### Extended Message Type

```typescript
// Extended from existing Message interface
export interface EnhancedMessage extends Message {
  title: string | null;              // Message title (max 100 chars)
  specialDate: Date | null;          // Special occasion date
  closingMessage: string | null;     // Closing text (max 200 chars)
  signature: string | null;          // Custom signature (max 50 chars)
  galleryImages: string[];           // Array of gallery image URLs (max 3)
}

// Database schema extension
export interface EnhancedMessageRow extends MessageRow {
  title: string | null;
  special_date: Date | null;
  closing_message: string | null;
  signature: string | null;
  gallery_images: string[];  // PostgreSQL array type
}
```

#### Template Types

```typescript
export type TemplateCategory = 
  | 'aniversario' 
  | 'amor' 
  | 'amizade' 
  | 'gratidao' 
  | 'parabens';

export interface MessageTemplate {
  id: string;
  category: TemplateCategory;
  name: string;
  description: string;
  thumbnail: string;
  fields: {
    title: string;
    message: string;
    closing: string;
    signature: string;
  };
}

export interface MessageModel {
  id: string;
  templateId: string;
  name: string;
  description: string;
  preview: string;
  completeData: Partial<EnhancedMessage>;
}
```

#### Suggestion Types

```typescript
export type SuggestionCategory = 
  | 'romantico' 
  | 'amigavel' 
  | 'formal' 
  | 'casual';

export interface TextSuggestion {
  id: string;
  category: SuggestionCategory;
  field: 'title' | 'message' | 'closing';
  text: string;
  tags: string[];
}
```

#### Editor State

```typescript
export interface EditorState {
  // Form data
  data: {
    title: string;
    specialDate: Date | null;
    mainImage: File | null;
    galleryImages: (File | null)[];
    from: string;
    to: string;
    message: string;
    signature: string;
    closing: string;
    youtubeLink: string;
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
    selectedTemplate: string | null;
    selectedModel: string | null;
    showSuggestions: boolean;
    suggestionField: string | null;
    isAutoSaving: boolean;
    lastSaved: Date | null;
    previewStage: string;
  };
  
  // Validation
  errors: Record<string, string>;
  isValid: boolean;
}
```

### Component Interfaces

#### TemplateSelector Component

```typescript
interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
  onSelectModel: (modelId: string) => void;
  hasUnsavedChanges: boolean;
}
```

#### TextSuggestionPanel Component

```typescript
interface TextSuggestionPanelProps {
  field: 'title' | 'message' | 'closing';
  currentValue: string;
  onSelectSuggestion: (text: string) => void;
  onClose: () => void;
}
```

#### CinematicPreview Component

```typescript
interface CinematicPreviewProps {
  data: {
    title: string;
    specialDate: Date | null;
    mainImage: string | null;
    galleryImages: string[];
    from: string;
    to: string;
    message: string;
    signature: string;
    closing: string;
    youtubeLink: string;
  };
  stage: PreviewStage;
  onStageChange: (stage: PreviewStage) => void;
  autoPlay: boolean;
}

type PreviewStage = 
  | 'intro-1' 
  | 'intro-2' 
  | 'intro-action'
  | 'transition'
  | 'reveal-photo'
  | 'reveal-intro'
  | 'reveal-message'
  | 'reading'
  | 'closing-1'
  | 'closing-2'
  | 'final'
  | 'full-view';
```

#### AutoSave Hook

```typescript
interface UseAutoSaveOptions {
  key: string;
  data: EditorState['data'];
  debounceMs: number;
  enabled: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  restore: () => EditorState['data'] | null;
  clear: () => void;
}
```

## Data Models

### Database Schema Extension

```sql
-- Migration to extend messages table
ALTER TABLE messages 
ADD COLUMN title VARCHAR(100),
ADD COLUMN special_date DATE,
ADD COLUMN closing_message VARCHAR(200),
ADD COLUMN signature VARCHAR(50),
ADD COLUMN gallery_images TEXT[] DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX idx_messages_special_date ON messages(special_date);
CREATE INDEX idx_messages_title ON messages(title);
```

### Validation Schema Extensions

```typescript
// Extend existing createMessageSchema
export const createEnhancedMessageSchema = createMessageSchema.extend({
  title: z.string()
    .max(100, 'Title must be 100 characters or less')
    .optional()
    .nullable(),
  specialDate: z.date()
    .optional()
    .nullable(),
  closingMessage: z.string()
    .max(200, 'Closing message must be 200 characters or less')
    .optional()
    .nullable(),
  signature: z.string()
    .max(50, 'Signature must be 50 characters or less')
    .optional()
    .nullable(),
  galleryImages: z.array(z.string().url())
    .max(3, 'Maximum 3 gallery images allowed')
    .default([]),
});

export type CreateEnhancedMessageInput = z.infer<typeof createEnhancedMessageSchema>;
```

### Template Data Structure

Templates and models will be stored as static JSON data in the codebase:

```typescript
// src/data/templates.ts
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'aniversario-1',
    category: 'aniversario',
    name: 'Aniversário Romântico',
    description: 'Perfeito para celebrar o aniversário de alguém especial',
    thumbnail: '/templates/aniversario-romantico.jpg',
    fields: {
      title: 'Feliz Aniversário!',
      message: 'Hoje é um dia especial...',
      closing: 'Que este novo ano seja repleto de alegrias',
      signature: 'Com todo meu amor',
    },
  },
  // ... more templates
];

// src/data/models.ts
export const MESSAGE_MODELS: MessageModel[] = [
  {
    id: 'model-aniversario-1',
    templateId: 'aniversario-1',
    name: 'Aniversário da Namorada',
    description: 'Mensagem completa para aniversário romântico',
    preview: '/models/aniversario-namorada-preview.jpg',
    completeData: {
      title: 'Feliz Aniversário, Meu Amor!',
      message: 'Não importa quanto tempo passe...',
      // ... complete example data
    },
  },
  // ... more models
];

// src/data/suggestions.ts
export const TEXT_SUGGESTIONS: TextSuggestion[] = [
  {
    id: 'title-romantico-1',
    category: 'romantico',
    field: 'title',
    text: 'Para o Amor da Minha Vida',
    tags: ['amor', 'romântico'],
  },
  // ... more suggestions
];
```

## Error Handling

### Validation Error Handling

```typescript
// Client-side validation
export function validateEditorForm(data: EditorState['data']): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  // Title validation
  if (data.title && data.title.length > 100) {
    errors.title = 'O título deve ter no máximo 100 caracteres';
  }
  
  // Required fields (existing validation)
  if (!data.to || data.to.trim().length === 0) {
    errors.to = 'O nome do destinatário é obrigatório';
  }
  
  if (!data.from || data.from.trim().length === 0) {
    errors.from = 'Seu nome é obrigatório';
  }
  
  if (!data.message || data.message.trim().length === 0) {
    errors.message = 'A mensagem é obrigatória';
  }
  
  // Message length
  if (data.message && data.message.length > 500) {
    errors.message = 'A mensagem deve ter no máximo 500 caracteres';
  }
  
  // Closing message validation
  if (data.closing && data.closing.length > 200) {
    errors.closing = 'A mensagem de fechamento deve ter no máximo 200 caracteres';
  }
  
  // Signature validation
  if (data.signature && data.signature.length > 50) {
    errors.signature = 'A assinatura deve ter no máximo 50 caracteres';
  }
  
  // YouTube URL validation
  if (data.youtubeLink && data.youtubeLink.trim().length > 0) {
    if (!isValidYouTubeUrl(data.youtubeLink)) {
      errors.youtubeLink = 'Por favor, insira uma URL válida do YouTube';
    }
  }
  
  // Gallery images validation
  const validGalleryImages = data.galleryImages.filter(img => img !== null);
  if (validGalleryImages.length > 3) {
    errors.galleryImages = 'Máximo de 3 fotos na galeria';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

### Image Upload Error Handling

```typescript
export async function handleImageUpload(
  file: File,
  type: 'main' | 'gallery'
): Promise<{ url: string } | { error: string }> {
  // File size validation
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    return { error: 'A imagem deve ter no máximo 5MB' };
  }
  
  // File type validation
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Formato não suportado. Use JPEG, PNG ou WebP' };
  }
  
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    
    const response = await fetch('/api/messages/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Falha no upload');
    }
    
    const result = await response.json();
    return { url: result.url };
  } catch (error) {
    console.error('Image upload error:', error);
    return { 
      error: error instanceof Error 
        ? error.message 
        : 'Erro ao fazer upload da imagem' 
    };
  }
}
```

### Auto-Save Error Handling

```typescript
export function useAutoSave({
  key,
  data,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const timeoutId = setTimeout(() => {
      try {
        setIsSaving(true);
        localStorage.setItem(key, JSON.stringify({
          data,
          savedAt: new Date().toISOString(),
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Silently fail - don't disrupt user experience
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [data, key, debounceMs, enabled]);
  
  const restore = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      return parsed.data;
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

### Property 1: Title input reflects in preview
*For any* title string input (up to 100 characters), when entered into the title field, the preview should display that exact title text.
**Validates: Requirements 2.2**

### Property 2: Title character limit enforcement
*For any* string input to the title field, if the string length exceeds 100 characters, the system should either reject the input or truncate it to 100 characters.
**Validates: Requirements 2.3**

### Property 3: Date formatting consistency
*For any* valid Date object, when selected in the date picker, the preview should display it formatted as "DD de MMMM, YYYY" in Portuguese.
**Validates: Requirements 3.2**

### Property 4: Date appears in preview
*For any* valid date selection, the formatted date should appear in the preview header section.
**Validates: Requirements 3.3**

### Property 5: Date validation
*For any* date input, the system should only accept valid calendar dates and reject invalid dates.
**Validates: Requirements 3.5**

### Property 6: Photo upload limit enforcement
*For any* attempt to upload more than 4 photos total (1 main + 3 gallery), the system should reject the additional uploads.
**Validates: Requirements 4.1**

### Property 7: Image format validation
*For any* uploaded file, the system should only accept files with JPEG, PNG, or WebP formats and reject all other file types.
**Validates: Requirements 4.3**

### Property 8: Image size validation
*For any* uploaded image file, if the file size exceeds 5MB, the system should reject the upload.
**Validates: Requirements 4.4**

### Property 9: Gallery photos appear in preview
*For any* set of uploaded gallery photos (up to 3), all photos should appear in the full-view section of the preview.
**Validates: Requirements 4.6**

### Property 10: Closing message reflects in preview
*For any* closing message text input (up to 200 characters), when entered, the preview should display that text in the closing sequence.
**Validates: Requirements 5.2**

### Property 11: Closing message character limit
*For any* string input to the closing message field, if the string length exceeds 200 characters, the system should either reject the input or truncate it to 200 characters.
**Validates: Requirements 5.3**

### Property 12: Signature reflects in preview
*For any* signature text input (up to 50 characters), when entered, the preview should display that signature below the main message.
**Validates: Requirements 6.2**

### Property 13: Signature character limit
*For any* string input to the signature field, if the string length exceeds 50 characters, the system should either reject the input or truncate it to 50 characters.
**Validates: Requirements 6.3**

### Property 14: Template application populates fields
*For any* template selection, all fields defined in that template should be populated with the template's content.
**Validates: Requirements 7.2**

### Property 15: Template fields remain editable
*For any* template application and any field, the user should be able to edit the populated content.
**Validates: Requirements 7.3**

### Property 16: Model application populates fields
*For any* model selection, all fields defined in that model should be populated with the model's complete data.
**Validates: Requirements 8.3**

### Property 17: Model fields remain editable
*For any* model application and any field, the user should be able to edit the populated content.
**Validates: Requirements 8.4**

### Property 18: Suggestion insertion
*For any* text suggestion, when clicked, the suggestion text should be inserted into the corresponding field (title, message, or closing).
**Validates: Requirements 9.4**

### Property 19: Suggestion categorization
*For any* text suggestion, it should have a valid category (Romântico, Amigável, Formal, or Casual) and be properly grouped with other suggestions of the same category.
**Validates: Requirements 9.5**

### Property 20: Suggestions remain editable
*For any* inserted suggestion text, the user should be able to edit the text after insertion.
**Validates: Requirements 9.6**

### Property 21: Preview updates with data changes
*For any* change to any editor field, the preview should update to reflect that change in real-time.
**Validates: Requirements 10.2**

### Property 22: All customizations appear in preview
*For any* set of user customizations (title, date, photos, messages, etc.), all customizations should be accurately reflected in the preview.
**Validates: Requirements 10.6**

### Property 23: Validation runs before payment
*For any* form state, when the user attempts to proceed to payment, validation should execute and check all required fields.
**Validates: Requirements 11.1**

### Property 24: Validation errors display messages
*For any* validation error, a clear error message should be displayed for the corresponding field.
**Validates: Requirements 11.2**

### Property 25: Invalid form blocks payment
*For any* form state that fails validation, navigation to the payment page should be prevented.
**Validates: Requirements 11.3**

### Property 26: YouTube URL validation
*For any* YouTube URL input, the system should validate the URL format and reject invalid YouTube URLs.
**Validates: Requirements 11.5**

### Property 27: File validation
*For any* file upload, the system should validate both the file format (image types only) and file size (max 5MB).
**Validates: Requirements 11.6**

### Property 28: Character limit validation across fields
*For any* text input in any field (title, message, closing, signature), the system should enforce the field's character limit.
**Validates: Requirements 11.7**

### Property 29: Auto-save persistence
*For any* changes made to editor fields, after a period of inactivity, the data should be saved to browser local storage.
**Validates: Requirements 12.1**

### Property 30: Auto-save round-trip
*For any* editor data saved to local storage, when restored, the data should match the original saved data.
**Validates: Requirements 12.2**

### Property 31: Payment completion clears draft
*For any* completed payment, the saved draft data should be cleared from local storage.
**Validates: Requirements 12.4**

## Testing Strategy

### Unit Testing

Unit tests will verify individual component behavior and utility functions:

1. **Validation Functions**
   - Test `validateEditorForm` with valid and invalid inputs
   - Test character limit enforcement for all text fields
   - Test YouTube URL validation
   - Test image file validation (size, type)

2. **Data Transformation**
   - Test template application to editor state
   - Test model loading and field population
   - Test suggestion insertion logic

3. **Auto-Save Utilities**
   - Test localStorage save/restore operations
   - Test debounce behavior
   - Test error handling when localStorage is unavailable

4. **Component Rendering**
   - Test TemplateSelector renders all templates
   - Test TextSuggestionPanel filters by category
   - Test validation error display
   - Test character counter updates

### Property-Based Testing

Property-based tests will be implemented using `fast-check` library to verify universal properties across all inputs. Each test will run a minimum of 100 iterations.

**PBT Library**: fast-check (JavaScript/TypeScript property-based testing)

**Configuration**: All property tests will use `fc.assert` with `{ numRuns: 100 }` to ensure adequate coverage.

**Test Tagging**: Each property-based test will include a comment with the format:
```typescript
// **Feature: message-editor-enhancement, Property {number}: {property_text}**
```

