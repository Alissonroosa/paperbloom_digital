# Step2SpecialDate Component

## Overview

The `Step2SpecialDate` component is the second step in the multi-step wizard for creating Paper Bloom messages. It allows users to optionally select a special date that will be displayed in their message.

## Features

- **Date Picker**: Native HTML5 date input for selecting dates
- **Portuguese Formatting**: Displays selected date in Portuguese format (DD de MMMM, YYYY)
- **Optional Selection**: Users can skip this step if they don't want to include a date
- **Clear Functionality**: Users can clear a selected date
- **Real-time Preview**: Updates the wizard state immediately for preview synchronization
- **Accessible**: Proper ARIA labels and keyboard navigation

## Usage

```tsx
import { Step2SpecialDate } from '@/components/wizard/steps';

function WizardPage() {
  return (
    <WizardProvider>
      <Step2SpecialDate />
    </WizardProvider>
  );
}
```

## Component Structure

### State Management

The component uses the `useWizard` hook to access and update the wizard state:
- `data.specialDate`: The selected date (Date | null)
- `updateField`: Function to update the date in wizard state

### Local State

- `showDatePicker`: Boolean to control whether the date picker is visible

## User Flow

1. **Initial State**: User sees a "Selecionar Data" button and "Pular esta etapa" link
2. **Date Selection**: Clicking the button shows the date picker
3. **Date Display**: After selecting a date, it's displayed in Portuguese format
4. **Clear/Skip**: User can clear the date or skip the step entirely

## Date Formatting

The component uses the `formatDateInPortuguese` utility function from `@/lib/wizard-utils`:

```typescript
formatDateInPortuguese(new Date('2024-12-25'))
// Returns: "25 de Dezembro, 2024"
```

## Validation

Step 2 has minimal validation since the date is optional:
- The date must be a valid calendar date (enforced by HTML5 date input)
- No minimum or maximum date restrictions
- Empty/null dates are valid (step can be skipped)

## Accessibility

- Proper `<Label>` components with `htmlFor` attributes
- ARIA labels on interactive elements
- Keyboard navigation support
- Clear visual feedback for selected dates

## Integration with Wizard

The component integrates with the wizard system through:
- `WizardContext`: Provides access to wizard state and actions
- `updateField('specialDate', date)`: Updates the wizard state
- Preview synchronization: Changes are immediately reflected in the preview panel

## Testing

Test the component at: `/editor/test-step2`

### Manual Testing Checklist

- [ ] Date picker opens when clicking "Selecionar Data"
- [ ] Selected date is formatted correctly in Portuguese
- [ ] Clear button removes the selected date
- [ ] "Pular esta etapa" link works correctly
- [ ] Date persists when navigating between wizard steps
- [ ] Preview updates with the selected date

## Requirements Validation

This component satisfies the following requirements:

- **3.1**: Displays date picker on Step 2
- **3.2**: Formats date as "DD de MMMM, YYYY" in Portuguese
- **3.3**: Allows optional date selection (skip functionality)
- **3.4**: Validates that selected date is valid (via HTML5 date input)
- **3.5**: Updates preview with formatted date (via wizard state)

## Future Enhancements

Potential improvements for future iterations:
- Date range restrictions (e.g., no dates in the past)
- Calendar popup UI instead of native date picker
- Quick date presets (e.g., "Today", "Tomorrow", "Next Week")
- Date validation messages for invalid dates
- Time selection in addition to date
