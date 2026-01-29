# Step 1: Page Title and URL Component

## Overview

The `Step1PageTitleURL` component is the first step in the multi-step wizard for creating personalized messages. It allows users to enter a page title and customize the URL slug for their message.

## Features

### 1. Page Title Input
- Text input for the message page title
- Maximum 100 characters
- Character counter display
- Real-time validation with inline error messages
- Updates preview in real-time

### 2. URL Slug Input
- Custom URL slug input with domain prefix display
- Auto-generation from page title
- Manual editing capability
- Maximum 50 characters
- Format validation (lowercase letters, numbers, hyphens only)

### 3. Real-time Slug Availability Check
- Debounced API calls (500ms delay)
- Visual status indicators:
  - Loading spinner while checking
  - Green checkmark for available slugs
  - Red X for unavailable slugs
- Automatic suggestion generation for taken slugs
- One-click suggestion acceptance

### 4. Validation
- Client-side validation using Zod schemas
- Inline error messages
- Visual feedback (red borders, error icons)
- Accessibility support (ARIA attributes)

### 5. Preview
- Shows formatted URL preview
- Updates in real-time as user types

## Usage

```tsx
import { Step1PageTitleURL } from '@/components/wizard/steps';
import { WizardProvider } from '@/contexts/WizardContext';

function MyWizard() {
  return (
    <WizardProvider>
      <Step1PageTitleURL />
    </WizardProvider>
  );
}
```

## Requirements Validated

This component validates the following requirements from the design document:

- **Requirement 2.1**: Display fields for page title and custom URL slug
- **Requirement 2.2**: Validate URL slug format (alphanumeric and hyphens only)
- **Requirement 2.3**: Real-time URL slug availability check
- **Requirement 2.4**: Auto-generate URL slug from title
- **Requirement 2.5**: Limit page title to 100 characters
- **Requirement 2.6**: Limit URL slug to 50 characters

## API Integration

### Slug Availability Check

The component uses the `/api/messages/check-slug` endpoint:

**Request:**
```
GET /api/messages/check-slug?slug=my-message
```

**Response:**
```json
{
  "available": false,
  "slug": "my-message",
  "suggestion": "my-message-1"
}
```

## State Management

The component uses the Wizard Context to:
- Read current form data (`data.pageTitle`, `data.urlSlug`)
- Update form fields (`updateField`)
- Access validation errors (`stepValidation[currentStep].errors`)

## Auto-generation Logic

1. User types in the title field
2. If the slug hasn't been manually edited, auto-generate slug:
   - Convert to lowercase
   - Remove accents (normalize NFD)
   - Remove special characters
   - Replace spaces with hyphens
   - Remove duplicate hyphens
   - Limit to 50 characters
3. Once user manually edits the slug, auto-generation stops

## Accessibility

- Proper label associations with `htmlFor`
- ARIA attributes for error states
- Visual and text feedback for all states
- Keyboard navigation support
- Screen reader friendly error messages

## Testing

Test page available at: `/editor/test-step1`

The test page includes:
- Live component rendering
- Validation testing
- Debug information display
- State inspection

## Dependencies

- `@/contexts/WizardContext` - Wizard state management
- `@/lib/wizard-utils` - Slug generation and availability check
- `@/components/ui/Input` - Input component
- `@/components/ui/Label` - Label component
- `lucide-react` - Icons (Loader2, CheckCircle2, XCircle, AlertCircle)

## Future Enhancements

- Add slug preview with QR code
- Show slug history/suggestions based on popular patterns
- Add "copy URL" button
- Support for custom domain configuration
