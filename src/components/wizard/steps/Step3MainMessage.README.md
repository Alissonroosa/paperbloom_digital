# Step 3: Main Message Component

## Overview

The `Step3MainMessage` component is the third step in the multi-step wizard, allowing users to compose the main message with recipient and sender information.

## Features

- **Recipient Name Field**: Input for the message recipient's name (required, max 100 characters)
- **Sender Name Field**: Input for the sender's name (required, max 100 characters)
- **Main Message Textarea**: Large text area for the message content (required, max 500 characters)
- **Character Counter**: Real-time character count with color-coded feedback
- **Text Suggestions**: Integration with TextSuggestionPanel for message inspiration
- **Real-time Validation**: Inline validation errors for all fields
- **Preview Updates**: Changes update the preview panel in real-time

## Requirements Validation

This component validates the following requirements:

- **4.1**: Display fields for recipient name, sender name, and main message ✓
- **4.2**: Provide text suggestions for the main message field ✓
- **4.3**: Limit the main message to 500 characters maximum ✓
- **4.4**: Display character count feedback as the user types ✓
- **4.5**: Validate that recipient and sender names are not empty ✓
- **4.6**: Update the preview in real-time as the user types ✓

## Usage

```tsx
import { Step3MainMessage } from '@/components/wizard/steps';

function WizardPage() {
  return (
    <WizardProvider>
      <Step3MainMessage />
    </WizardProvider>
  );
}
```

## Character Counter Behavior

The character counter provides visual feedback based on usage:

- **0-74%**: Gray text (normal state)
- **75-89%**: Yellow text (approaching limit)
- **90-99%**: Orange text (near limit) + warning message
- **100%**: Red text (limit reached) + error message

## Text Suggestions

Users can click the "Sugestões" button to open a modal with pre-written message suggestions organized by category:

- Romântico (Romantic)
- Amigável (Friendly)
- Formal (Formal)
- Casual (Casual)

Suggestions can be selected and will replace the current message content (with confirmation if content already exists).

## Validation

All three fields are required:

- **Recipient Name**: 1-100 characters
- **Sender Name**: 1-100 characters
- **Main Message**: 1-500 characters

Validation errors are displayed inline below each field with an error icon.

## Accessibility

- All inputs have proper labels with required indicators
- Error messages are associated with inputs via `aria-describedby`
- Invalid states are indicated with `aria-invalid`
- Character counter is announced to screen readers
- Suggestion button has descriptive `aria-label`
- Modal has proper `role="dialog"` and `aria-modal="true"`

## Testing

Test the component at: `/editor/test-step3`

### Test Cases

1. **Empty Fields**: Leave fields empty and verify validation errors appear
2. **Character Limits**: Test that inputs respect max length constraints
3. **Character Counter**: Verify counter updates in real-time and changes color appropriately
4. **Text Suggestions**: Open suggestion panel and select a suggestion
5. **Suggestion Replacement**: Test confirmation dialog when replacing existing content
6. **Real-time Preview**: Verify changes update the preview panel (when integrated)

## Integration with Wizard Context

The component uses the `useWizard` hook to:

- Access current form data (`data`)
- Update field values (`updateField`)
- Access validation errors (`stepValidation`)
- Get current step number (`currentStep`)

## Styling

The component uses Tailwind CSS classes and follows the design system:

- Consistent spacing with `space-y-6` and `space-y-2`
- Error states with red borders and text
- Character counter with dynamic color classes
- Modal overlay with backdrop blur
- Responsive design for mobile and desktop

## Dependencies

- `@/contexts/WizardContext`: Wizard state management
- `@/components/ui/Input`: Input component
- `@/components/ui/Label`: Label component
- `@/components/ui/Textarea`: Textarea component
- `@/components/ui/Button`: Button component
- `@/components/editor/TextSuggestionPanel`: Suggestion panel
- `lucide-react`: Icons (XCircle, Sparkles)

## Future Enhancements

- Auto-save draft messages to local storage
- Spell check integration
- Word count in addition to character count
- Emoji picker integration
- Voice-to-text input option
