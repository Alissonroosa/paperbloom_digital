# Step 7: Contact Info and Summary Component

## Overview

The `Step7ContactInfo` component is the final step in the multi-step wizard, collecting user contact information and displaying a comprehensive summary of all entered data before proceeding to payment.

## Features

### Contact Information Collection
- **Name Input**: Full name with character limit (100 chars)
- **Email Input**: Email with format validation
- **Phone Input**: Brazilian phone format with auto-formatting
- **Icon Indicators**: Visual icons for each field type

### Phone Number Auto-Formatting
- Automatically formats as user types
- Supports both formats:
  - (XX) XXXXX-XXXX (mobile)
  - (XX) XXXX-XXXX (landline)
- Removes non-digit characters automatically

### Validation
- **Email Format**: Standard email validation (user@domain.tld)
- **Phone Format**: Brazilian format (XX) XXXXX-XXXX
- **Required Fields**: All three fields must be filled
- **Real-time Error Display**: Shows validation errors inline

### Summary Display
Shows a comprehensive review of all wizard steps:
- ✅ Page title and URL slug
- 📅 Special date (if provided)
- 💬 Message details (sender, recipient, content preview)
- 🖼️ Photo count
- 🎨 Theme and color selection
- 🎵 Music selection (if provided)

### User Experience
- **Visual Feedback**: Icons and colors for each summary item
- **Privacy Notice**: Reassures users about data security
- **Next Steps**: Clear explanation of what happens after payment
- **Responsive Design**: Works on all screen sizes

## Props

This component uses the Wizard Context and doesn't accept props directly.

### Context Usage
```typescript
const { data, updateField, stepValidation, currentStep } = useWizard();
```

## Validation Schema

```typescript
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

## Usage Example

```tsx
import { Step7ContactInfo } from '@/components/wizard/steps/Step7ContactInfo';

function WizardPage() {
  return (
    <WizardProvider>
      <Step7ContactInfo />
    </WizardProvider>
  );
}
```

## Phone Formatting Logic

The component automatically formats phone numbers as the user types:

1. Removes all non-digit characters
2. Formats as (XX) XXXXX-XXXX for 11 digits (mobile)
3. Formats as (XX) XXXX-XXXX for 10 digits (landline)
4. Handles partial input gracefully

Example transformations:
- Input: `11987654321` → Output: `(11) 98765-4321`
- Input: `1133334444` → Output: `(11) 3333-4444`

## Summary Items

The summary section displays different items based on what the user has filled:

### Always Shown
- Page title and URL
- Main message (sender, recipient, content)
- Theme selection

### Conditionally Shown
- Special date (only if selected)
- Photos (only if uploaded)
- Music (only if YouTube URL provided)

## Accessibility

- Proper ARIA labels on all inputs
- Error messages linked via `aria-describedby`
- Invalid state indicated with `aria-invalid`
- Icon decorations are properly labeled
- Keyboard navigation support

## Validation Requirements

From Requirements 8.1-8.6:
- 8.1: Display fields for name, email, and phone ✅
- 8.2: Validate email format ✅
- 8.3: Validate Brazilian phone format ✅
- 8.4: Require all three fields ✅
- 8.5: Display summary of all information ✅
- 8.6: Enable "Proceed to Payment" when valid ✅

## Integration

This component integrates with:
- **WizardContext**: For state management
- **Validation System**: Uses step7Schema from wizard.ts
- **Navigation**: Works with wizard navigation buttons
- **Payment Flow**: Prepares data for Stripe checkout

## Testing

See `__tests__/Step7ContactInfo.test.tsx` for unit tests covering:
- Contact information input
- Phone number formatting
- Email validation
- Summary display
- Error handling
