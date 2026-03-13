# Enhanced Editor Form Validation

Comprehensive validation module for the Paper Bloom message editor form.

## Overview

This module provides validation functions for all editor form fields, including:
- Character limit validation
- Required field validation
- YouTube URL format validation
- Image file format and size validation
- Gallery images validation
- Date validation

## Requirements

Implements the following requirements:
- **11.1**: Required field validation
- **11.2**: Field-specific error messages
- **11.5**: YouTube URL format validation
- **11.6**: Image file format and size validation
- **11.7**: Character limit validation across fields

## Installation

```typescript
import { 
  validateEditorForm, 
  validateField,
  CHARACTER_LIMITS,
  IMAGE_CONSTRAINTS 
} from '@/lib/validation';
```

## API Reference

### Main Functions

#### `validateEditorForm(data: EditorFormData): ValidationResult`

Validates the entire editor form and returns all validation errors.

**Parameters:**
- `data`: EditorFormData - The complete form data to validate

**Returns:**
```typescript
{
  isValid: boolean;
  errors: Record<string, string>;
}
```

**Example:**
```typescript
const result = validateEditorForm(formData);
if (!result.isValid) {
  console.log('Errors:', result.errors);
}
```

#### `validateField(fieldName, value, data): string | null`

Validates a single field. Useful for real-time validation.

**Parameters:**
- `fieldName`: keyof EditorFormData - The field to validate
- `value`: any - The field value
- `data`: EditorFormData - Complete form data for context

**Returns:**
- `string` - Error message if invalid
- `null` - If valid

**Example:**
```typescript
const error = validateField('title', 'My Title', formData);
if (error) {
  setFieldError('title', error);
}
```

### Individual Validation Functions

#### `validateCharacterLimit(value, limit, fieldName): string | null`

Validates that a text value doesn't exceed the character limit.

#### `validateRequired(value, fieldName): string | null`

Validates that a required field is not empty.

#### `validateYouTubeUrl(url): string | null`

Validates YouTube URL format. Empty strings are valid (optional field).

#### `validateImageFile(file): string | null`

Validates image file format and size.

#### `validateGalleryImages(images): string | null`

Validates gallery images array (max 3 images, each validated).

#### `validateSpecialDate(date): string | null`

Validates that a date is a valid calendar date.

## Constants

### Character Limits

```typescript
CHARACTER_LIMITS = {
  title: 100,        // Requirement 2.3
  message: 500,
  closing: 200,      // Requirement 5.3
  signature: 50,     // Requirement 6.3
  from: 100,
  to: 100,
}
```

### Image Constraints

```typescript
IMAGE_CONSTRAINTS = {
  maxSize: 5 * 1024 * 1024,  // 5MB - Requirement 4.4
  allowedFormats: [
    'image/jpeg',
    'image/png',
    'image/webp'
  ],                          // Requirement 4.3
  maxGalleryImages: 3,        // Requirement 4.1
}
```

## Usage Examples

### 1. Form Submission Validation

```typescript
import { validateEditorForm } from '@/lib/validation';

const handleSubmit = () => {
  const result = validateEditorForm(formData);
  
  if (!result.isValid) {
    // Display errors
    setErrors(result.errors);
    return;
  }
  
  // Proceed to payment
  proceedToPayment(formData);
};
```

### 2. Real-time Field Validation

```typescript
import { validateField } from '@/lib/validation';

const handleFieldChange = (field, value) => {
  // Update form data
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Validate field
  const error = validateField(field, value, formData);
  
  if (error) {
    setFieldError(field, error);
  } else {
    clearFieldError(field);
  }
};
```

### 3. Character Counter

```typescript
import { CHARACTER_LIMITS } from '@/lib/validation';

const CharacterCounter = ({ value, field }) => {
  const limit = CHARACTER_LIMITS[field];
  const count = value?.length || 0;
  
  return (
    <span className={count > limit ? 'text-red-600' : 'text-muted-foreground'}>
      {count}/{limit}
    </span>
  );
};
```

### 4. Image Upload Validation

```typescript
import { validateImageFile } from '@/lib/validation';

const handleImageUpload = (file: File) => {
  const error = validateImageFile(file);
  
  if (error) {
    alert(error);
    return;
  }
  
  // Proceed with upload
  uploadImage(file);
};
```

### 5. API Route Validation

```typescript
import { validateEditorForm } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json();
  
  const formData = {
    // Map request body to EditorFormData
    ...body
  };
  
  const result = validateEditorForm(formData);
  
  if (!result.isValid) {
    return Response.json(
      { errors: result.errors },
      { status: 400 }
    );
  }
  
  // Process valid data
  // ...
}
```

## Error Messages

All error messages are in Portuguese:

### Character Limits
- `"Título deve ter no máximo 100 caracteres"`
- `"Mensagem deve ter no máximo 500 caracteres"`
- `"Mensagem de fechamento deve ter no máximo 200 caracteres"`
- `"Assinatura deve ter no máximo 50 caracteres"`

### Required Fields
- `"Nome do destinatário é obrigatório"`
- `"Seu nome é obrigatório"`
- `"Mensagem é obrigatório"`

### YouTube URL
- `"Por favor, insira uma URL válida do YouTube"`

### Image Validation
- `"Formato não suportado. Use JPEG, PNG ou WebP"`
- `"A imagem deve ter no máximo 5MB"`
- `"Máximo de 3 fotos na galeria"`
- `"Foto N da galeria: [error message]"`

### Date Validation
- `"Data inválida"`

## Validation Rules

### Required Fields
- Recipient name (to)
- Sender name (from)
- Message text

### Optional Fields
- Title
- Special date
- Main image
- Gallery images (0-3)
- Signature
- Closing message
- YouTube link

### YouTube URL Formats
Accepts:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- Empty string (optional)

### Image Requirements
- **Formats**: JPEG, PNG, WebP only
- **Size**: Maximum 5MB per image
- **Gallery**: Maximum 3 additional images

## Testing

Run the test suite:

```bash
npm test -- src/lib/__tests__/validation.test.ts --run
```

Test coverage:
- ✅ 35 tests
- ✅ All validation functions
- ✅ Edge cases
- ✅ Error messages
- ✅ Constants

## Integration Checklist

- [ ] Import validation functions in EditorForm component
- [ ] Add form-level validation on submit
- [ ] Add field-level validation on blur/change
- [ ] Display error messages below fields
- [ ] Show character counters
- [ ] Prevent payment when validation fails
- [ ] Add server-side validation in API routes
- [ ] Test all validation scenarios

## Related Files

- `src/lib/validation.ts` - Main validation module
- `src/lib/__tests__/validation.test.ts` - Test suite
- `src/lib/examples/validation-integration-example.ts` - Integration examples
- `src/types/message.ts` - Message types and schemas
- `src/components/editor/EditorForm.tsx` - Editor form component

## See Also

- [Error Handling](./ERROR_HANDLING.md)
- [URL Validation](./URL_VALIDATION.md)
- [Message Types](../types/message.ts)
